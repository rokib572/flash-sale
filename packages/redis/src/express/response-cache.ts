import type { Redis } from 'ioredis';
import { getJson, setJson } from '../cache/json';
import { acquireLock, releaseLock } from '../cache/lock';
import type {
  NextFunction,
  RedisJsonCacheOptions,
  Request,
  RequestHandler,
  Response,
} from './types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const redisJsonCache = (opts: RedisJsonCacheOptions): RequestHandler => {
  const enableLock = opts.enableLock ?? true;
  const negTtl = opts.negativeTtlSeconds ?? 5;
  const shouldCache = opts.shouldCache ?? ((code) => code === 200 || code === 404);

  return async (req: Request, res: Response, next: NextFunction) => {
    const redis: Redis | undefined = (req.app?.locals as any)?.redis;
    if (!redis) {
      res.setHeader('X-Cache', 'bypass');
      return next();
    }

    const key = opts.key(req);
    const hit = await getJson<{ code: number; body: unknown }>(redis, key);
    if (hit) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Cache', 'hit');
      return res.status(hit.code).json(hit.body);
    }

    if (!enableLock) {
      res.setHeader('X-Cache', 'miss');
      return next();
    }

    const lockKey = `${key}:lock`;
    const lockTtl = opts.lockTtlMs ?? 2000;
    const backoff = opts.waitBackoffMs ?? 40;
    const maxWait = opts.waitMaxMs ?? 200;

    const { ok, token } = await acquireLock(redis, lockKey, lockTtl);
    if (ok && token) {
      // Patch res.json to capture body and write to cache
      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        try {
          const code = res.statusCode || 200;
          res.setHeader('Cache-Control', 'no-store');
          res.setHeader('X-Cache', 'miss');
          if (shouldCache(code)) {
            const ttl = code === 404 ? negTtl : opts.ttlSeconds;
            // fire-and-forget cache write
            void setJson(redis, key, { code, body }, { ttlSeconds: ttl });
          }
        } finally {
          // fire-and-forget unlock
          void releaseLock(redis, lockKey, token);
        }
        return originalJson(body);
      };
      return next();
    }

    // Follower: wait briefly and retry cache; otherwise bypass
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      await sleep(backoff + Math.floor(Math.random() * 20));
      const again = await getJson<{ code: number; body: unknown }>(redis, key);
      if (again) {
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Cache', 'hit');
        return res.status(again.code).json(again.body);
      }
    }
    res.setHeader('X-Cache', 'bypass');
    return next();
  };
};
