import type { Redis } from 'ioredis';
import { getJson, setJson } from './json';
import { acquireLock, releaseLock } from './lock';
import type { GetOrSetArgs, GetOrSetNullableArgs } from './types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getOrSetJson = async <T>(
  redis: Redis,
  args: GetOrSetArgs<T>,
): Promise<{ value: T; cached: boolean }> => {
  const { key } = args;
  const cached = await getJson<T>(redis, key);
  if (cached != null) return { value: cached, cached: true };

  const enableLock = args.enableLock ?? true;
  if (!enableLock) {
    const value = await args.fetch();
    await setJson(redis, key, value, { ttlSeconds: args.ttlSeconds });
    return { value, cached: false };
  }

  const lockKey = `${key}:lock`;
  const ttlMs = args.lockTtlMs ?? 2000;
  const backoff = args.waitBackoffMs ?? 40;
  const maxWait = args.waitMaxMs ?? 200;

  const { ok, token } = await acquireLock(redis, lockKey, ttlMs);
  if (ok && token) {
    try {
      const fresh = await args.fetch();
      await setJson(redis, key, fresh, { ttlSeconds: args.ttlSeconds });
      return { value: fresh, cached: false };
    } finally {
      await releaseLock(redis, lockKey, token);
    }
  }

  // Follower path: brief wait and retry cache
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await sleep(backoff + Math.floor(Math.random() * 20));
    const again = await getJson<T>(redis, key);
    if (again != null) return { value: again, cached: true };
  }
  const value = await args.fetch();
  return { value, cached: false };
};

export const getOrSetJsonNullable = async <T>(
  redis: Redis,
  args: GetOrSetNullableArgs<T>,
): Promise<{ value: T | null; cached: boolean }> => {
  const { key } = args;
  const cached = await getJson<T | null>(redis, key);
  if (cached !== null && cached !== undefined) return { value: cached, cached: true };

  const enableLock = args.enableLock ?? true;
  if (!enableLock) {
    const fresh = await args.fetch();
    const isNull = fresh === null || fresh === undefined;
    await setJson(redis, key, isNull ? null : (fresh as T), {
      ttlSeconds: isNull ? args.negativeTtlSeconds ?? 5 : args.ttlSeconds,
    });
    return { value: fresh ?? null, cached: false };
  }

  const lockKey = `${key}:lock`;
  const ttlMs = args.lockTtlMs ?? 2000;
  const backoff = args.waitBackoffMs ?? 40;
  const maxWait = args.waitMaxMs ?? 200;

  const { ok, token } = await acquireLock(redis, lockKey, ttlMs);
  if (ok && token) {
    try {
      const fresh = await args.fetch();
      const isNull = fresh === null || fresh === undefined;
      await setJson(redis, key, isNull ? null : (fresh as T), {
        ttlSeconds: isNull ? args.negativeTtlSeconds ?? 5 : args.ttlSeconds,
      });
      return { value: fresh ?? null, cached: false };
    } finally {
      await releaseLock(redis, lockKey, token);
    }
  }

  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await sleep(backoff + Math.floor(Math.random() * 20));
    const again = await getJson<T | null>(redis, key);
    if (again !== null && again !== undefined) return { value: again, cached: true };
  }

  const value = await args.fetch();
  return { value: value ?? null, cached: false };
};

