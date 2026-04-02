import Redis from 'ioredis';
import { env } from './env';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

if (env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now();
  const windowKey = `ratelimit:${key}`;

  const multi = redis.multi();
  multi.zremrangebyscore(windowKey, 0, now - windowMs);
  multi.zcard(windowKey);
  multi.zadd(windowKey, now, `${now}:${Math.random()}`);
  multi.pexpire(windowKey, windowMs);

  const results = await multi.exec();
  const count = (results?.[1]?.[1] as number) ?? 0;

  if (count >= limit) {
    const earliest = await redis.zrange(windowKey, 0, 0, 'WITHSCORES');
    const resetIn = earliest.length >= 2
      ? Number(earliest[1]) + windowMs - now
      : windowMs;
    return { allowed: false, remaining: 0, resetIn };
  }

  return {
    allowed: true,
    remaining: limit - count - 1,
    resetIn: windowMs,
  };
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
}
