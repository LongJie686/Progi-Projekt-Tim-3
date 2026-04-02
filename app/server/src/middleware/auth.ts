import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, DecodedToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/database';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing or invalid Authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return next(AppError.unauthorized('User account is deactivated'));
    }

    if (!roles.includes(user.role)) {
      return next(AppError.forbidden(`Required role: ${roles.join(' or ')}`));
    }

    // Update role in token payload if changed
    req.user.role = user.role;
    next();
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Token invalid, but continue without auth
    }
  }

  next();
}
