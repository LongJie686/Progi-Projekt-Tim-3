import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './AppError';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
}

export function verifyAccessToken(token: string): DecodedToken {
  try {
    return jwt.verify(token, env.JWT_SECRET) as DecodedToken;
  } catch {
    throw AppError.unauthorized('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): DecodedToken {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as DecodedToken;
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }
}

export function generateTokenPair(payload: TokenPayload): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}
