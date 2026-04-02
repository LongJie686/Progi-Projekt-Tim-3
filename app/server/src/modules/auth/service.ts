import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthRepository } from './repository';
import { PrismaClient } from '../../generated/prisma/client';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './dto';
import { AppError } from '../../utils/AppError';
import { generateTokenPair, verifyRefreshToken, TokenPayload } from '../../utils/jwt';
import { redis } from '../../config/redis';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class AuthService {
  private repo: AuthRepository;

  constructor(prisma: PrismaClient) {
    this.repo = new AuthRepository(prisma);
  }

  async register(data: RegisterInput) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await this.repo.create(data, passwordHash);

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokenPair(payload);

    // Store refresh token in Redis
    await redis.set(
      `refresh:${user.id}`,
      tokens.refreshToken,
      'PX',
      this.parseExpiry(env.JWT_REFRESH_EXPIRES_IN)
    );

    // Generate email verification token
    const verifyToken = this.generateToken(user.id, env.VERIFY_SECRET);
    // TODO: Send verification email

    logger.info('User registered', { userId: user.id, role: user.role });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(data: LoginInput) {
    const user = await this.repo.findByEmail(data.email);
    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw AppError.forbidden('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokenPair(payload);

    await redis.set(
      `refresh:${user.id}`,
      tokens.refreshToken,
      'PX',
      this.parseExpiry(env.JWT_REFRESH_EXPIRES_IN)
    );

    logger.info('User logged in', { userId: user.id });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);

    const stored = await redis.get(`refresh:${decoded.userId}`);
    if (stored !== refreshToken) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    const user = await this.repo.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw AppError.unauthorized('User not found or deactivated');
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokenPair(payload);

    await redis.set(
      `refresh:${user.id}`,
      tokens.refreshToken,
      'PX',
      this.parseExpiry(env.JWT_REFRESH_EXPIRES_IN)
    );

    return tokens;
  }

  async logout(userId: string) {
    await redis.del(`refresh:${userId}`);
    logger.info('User logged out', { userId });
  }

  async verifyEmail(token: string) {
    const userId = this.verifyToken(token, env.VERIFY_SECRET);
    if (!userId) {
      throw AppError.badRequest('Invalid or expired verification token');
    }

    await this.repo.updateVerificationStatus(userId, true);
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await this.repo.findByEmail(data.email);
    // Always return success to prevent email enumeration
    if (!user) return { message: 'If an account exists, a reset email has been sent' };

    const resetToken = this.generateToken(user.id, env.RESET_SECRET);

    // Store token in Redis with 1 hour expiry
    await redis.set(`reset:${user.id}`, resetToken, 'PX', 3600000);

    // TODO: Send reset email with token
    logger.info('Password reset requested', { userId: user.id });

    return { message: 'If an account exists, a reset email has been sent' };
  }

  async resetPassword(data: ResetPasswordInput) {
    const userId = this.verifyToken(data.token, env.RESET_SECRET);
    if (!userId) {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    const stored = await redis.get(`reset:${userId}`);
    if (stored !== data.token) {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    await this.repo.updatePassword(userId, passwordHash);
    await redis.del(`reset:${userId}`);

    // Invalidate all refresh tokens
    await redis.del(`refresh:${userId}`);

    logger.info('Password reset completed', { userId });

    return { message: 'Password reset successfully' };
  }

  async oauthLogin(provider: string, providerId: string, profile: {
    email: string;
    firstName: string;
    lastName: string;
    accessToken?: string;
    refreshToken?: string;
  }) {
    let oauthConn = await this.repo.findOAuthUser(provider, providerId);

    if (oauthConn) {
      // Existing OAuth user
      const user = oauthConn.user;
      if (!user.isActive) {
        throw AppError.forbidden('Account is deactivated');
      }

      await this.repo.createOAuthConnection({
        userId: user.id,
        provider,
        providerId,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
      });

      const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const tokens = generateTokenPair(payload);
      await redis.set(
        `refresh:${user.id}`,
        tokens.refreshToken,
        'PX',
        this.parseExpiry(env.JWT_REFRESH_EXPIRES_IN)
      );

      return { user: this.sanitizeUser(user), ...tokens };
    }

    // Check if email exists
    let user = await this.repo.findByEmail(profile.email);
    if (!user) {
      // Create new user
      user = await this.repo.create(
        {
          email: profile.email,
          password: '', // Will be empty for OAuth users
          firstName: profile.firstName,
          lastName: profile.lastName,
          role: 'STUDENT',
        },
        ''
      );
    }

    // Create OAuth connection
    await this.repo.createOAuthConnection({
      userId: user.id,
      provider,
      providerId,
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
    });

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokenPair(payload);
    await redis.set(
      `refresh:${user.id}`,
      tokens.refreshToken,
      'PX',
      this.parseExpiry(env.JWT_REFRESH_EXPIRES_IN)
    );

    logger.info('OAuth login', { userId: user.id, provider });

    return { user: this.sanitizeUser(user), ...tokens };
  }

  private generateToken(userId: string, secret: string): string {
    const randomPart = crypto.randomBytes(16).toString('hex');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${userId}:${randomPart}`);
    const signature = hmac.digest('hex');
    return Buffer.from(`${userId}:${randomPart}:${signature}`).toString('base64url');
  }

  private verifyToken(token: string, secret: string): string | null {
    try {
      const decoded = Buffer.from(token, 'base64url').toString();
      const [userId, randomPart, signature] = decoded.split(':');

      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(`${userId}:${randomPart}`);
      const expected = hmac.digest('hex');

      if (signature !== expected) return null;
      return userId;
    } catch {
      return null;
    }
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const value = parseInt(match[1]);
    const unit: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (unit[match[2]] || 1);
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
