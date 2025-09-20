import type { Redis } from 'ioredis';

export const getJson = async <T>(redis: Redis, key: string): Promise<T | null> => {
  const raw = await redis.get(key);
  if (raw == null) return null;
  return JSON.parse(raw) as T;
};

export const setJson = async <T>(
  redis: Redis,
  key: string,
  value: T,
  opts: { ttlSeconds?: number } = {},
): Promise<void> => {
  const payload = JSON.stringify(value);
  if (opts.ttlSeconds && opts.ttlSeconds > 0) {
    await redis.set(key, payload, 'EX', opts.ttlSeconds);
  } else {
    await redis.set(key, payload);
  }
};

export const del = async (redis: Redis, key: string): Promise<number> => redis.del(key);

