import { Request, Response, NextFunction } from 'express';
import { rateLimit } from '../config/redis';
import { AppError } from '../utils/AppError';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, keyPrefix = 'api' } = options;

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userId = (req as any).user?.userId || ip;
    const key = `${keyPrefix}:${userId}`;

    try {
      const result = await rateLimit(key, max, windowMs);

      _res.setHeader('X-RateLimit-Limit', max.toString());
      _res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      _res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetIn / 1000).toString());

      if (!result.allowed) {
        throw AppError.badRequest(
          `Too many requests. Try again in ${Math.ceil(result.resetIn / 1000)} seconds.`
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        // Redis unavailable, allow request
        next();
      }
    }
  };
}

// Pre-configured rate limiters
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  keyPrefix: 'api',
});

export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  keyPrefix: 'login',
});

export const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  keyPrefix: 'register',
});
