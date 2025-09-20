import type { Request, Response, NextFunction } from 'express';
import type { Redis } from 'ioredis';
import { logger } from '@flash-sale/shared';
import { extractUserIdFromAuthToken } from './jwt';
import { buildRateLimitKey } from './keys';
import { calculateSuggestedTtlSeconds, evaluateTokenBucket } from './tokenBucket';
import type { RateLimitOptions } from '../../types';

export const createRateLimitMiddleware = (options: RateLimitOptions) => {
  const prefix = options.keyPrefix ?? 'rl';
  const ttl = options.ttlSeconds ?? calculateSuggestedTtlSeconds(options.capacity, options.refillPerSec);

  return async (req: Request, res: Response, next: NextFunction) => {
    const redis: Redis | undefined = req.app?.locals?.redis;
    if (!redis) return next();

    let identity = 'global';
    if (options.scope === 'user') {
      const uid = req.auth?.userId;
      identity = uid || `ip:${req.ip}`;
    } else if (options.scope === 'ip') {
      identity = req.ip || 'unknown';
    }

    const key = buildRateLimitKey(prefix, options.scope, identity);

    try {
      const { allowed, remainingTokens, retryAfterMs } = await evaluateTokenBucket(
        redis,
        key,
        options.capacity,
        options.refillPerSec,
        ttl,
      );

      res.setHeader('X-RateLimit-Limit', String(options.capacity));
      res.setHeader('X-RateLimit-Remaining', Math.max(0, Math.floor(remainingTokens)).toString());

      if (!allowed) {
        res.setHeader('Retry-After', Math.ceil(retryAfterMs / 1000).toString());
        return res.status(429).json({ error: 'rate_limited', retry_after_ms: retryAfterMs });
      }

      return next();
    } catch (err) {
      logger.warn({ err }, 'Rate limiter error; allowing request');
      return next();
    }
  };
};

export const createUserRateLimitMiddleware = () =>
  createRateLimitMiddleware({
    scope: 'user',
    capacity: Number(process.env.RL_USER_CAPACITY ?? 5),
    refillPerSec: Number(process.env.RL_USER_REFILL ?? 1),
  });

export const createIpRateLimitMiddleware = () =>
  createRateLimitMiddleware({
    scope: 'ip',
    capacity: Number(process.env.RL_IP_CAPACITY ?? 30),
    refillPerSec: Number(process.env.RL_IP_REFILL ?? 3),
  });

export const createGlobalRateLimitMiddleware = () =>
  createRateLimitMiddleware({
    scope: 'global',
    capacity: Number(process.env.RL_GLOBAL_CAPACITY ?? 2000),
    refillPerSec: Number(process.env.RL_GLOBAL_REFILL ?? 200),
  });
