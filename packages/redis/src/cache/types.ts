import type { Redis } from 'ioredis';

export type GetOrSetArgs<T> = {
  key: string;
  ttlSeconds: number;
  fetch: () => Promise<T>;
  enableLock?: boolean;
  lockTtlMs?: number; // default 2000
  waitBackoffMs?: number; // default 40
  waitMaxMs?: number; // default 200
};

export type GetOrSetNullableArgs<T> = Omit<GetOrSetArgs<T>, 'ttlSeconds'> & {
  ttlSeconds: number;
  negativeTtlSeconds?: number; // default 5
};

export type JsonCache = {
  getJson<T>(redis: Redis, key: string): Promise<T | null>;
  setJson<T>(redis: Redis, key: string, value: T, opts?: { ttlSeconds?: number }): Promise<void>;
  del(redis: Redis, key: string): Promise<number>;
};

