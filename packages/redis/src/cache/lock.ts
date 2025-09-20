import type { Redis } from 'ioredis';
import { randomUUID } from 'crypto';

// Safe unlock script: DEL only if value matches
const UNLOCK_LUA = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
else
  return 0
end
`;

export const acquireLock = async (
  redis: Redis,
  lockKey: string,
  ttlMs: number,
): Promise<{ ok: boolean; token?: string }> => {
  const token = randomUUID();
  const res = await redis.set(lockKey, token, 'PX', ttlMs, 'NX');
  return { ok: res === 'OK', token: res === 'OK' ? token : undefined };
};

export const releaseLock = async (redis: Redis, lockKey: string, token: string): Promise<void> => {
  try {
    await redis.eval(UNLOCK_LUA, 1, lockKey, token);
  } catch {
    // ignore unlock errors
  }
};

