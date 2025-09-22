import { logger } from '@flash-sale/shared';
import type { NextFunction, Request, Response } from 'express';
import type { Redis } from 'ioredis';
import type { RateLimitOptions } from '../../types';
import { buildRateLimitKey } from './keys';
import { calculateSuggestedTtlSeconds, evaluateTokenBucket } from './tokenBucket';

export const createRateLimitMiddleware = (options: RateLimitOptions) => {
  const prefix = options.keyPrefix ?? 'rl';
  const ttl =
    options.ttlSeconds ?? calculateSuggestedTtlSeconds(options.capacity, options.refillPerSec);

  return async (req: Request, res: Response, next: NextFunction) => {
    // Global off switch
    if (process.env.RL_DISABLED === 'true') return next();
    // Allow simple path-based bypasses for stress testing or specific routes
    // RL_BYPASS_PATHS supports comma-separated path prefixes. Example: "/orders/,/health"
    const bypassPaths = (process.env.RL_BYPASS_PATHS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (bypassPaths.length && typeof req.path === 'string') {
      const p = req.path || '';
      if (bypassPaths.some((prefixPath) => p.startsWith(prefixPath))) return next();
    }

    // If orders are enqueued via a background worker, do not rate-limit the order ingestion path
    // This prevents 429 storms during flash sales; admission control is handled by the queue.
    if (process.env.ORDERS_USE_QUEUE === 'true' && typeof req.path === 'string') {
      if (req.path.startsWith('/orders/')) return next();
    }

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
  (req: Request, res: Response, next: NextFunction) => {
    // Default: disable user rate limits outside production to ease local/stress testing
    const disabledDefault = process.env.NODE_ENV !== 'production' ? 'true' : 'false';
    if ((process.env.RL_USER_DISABLED ?? disabledDefault) === 'true') return next();
    return createRateLimitMiddleware({
      scope: 'user',
      capacity: Number(process.env.RL_USER_CAPACITY ?? 5),
      refillPerSec: Number(process.env.RL_USER_REFILL ?? 1),
    })(req, res, next);
  };

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
