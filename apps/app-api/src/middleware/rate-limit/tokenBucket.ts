import type { Redis } from 'ioredis';
import type { TokenBucketEvalResult } from '../../types';

// Atomic token-bucket Lua script
const TOKEN_BUCKET_LUA = `
-- KEYS[1] = bucket key
-- ARGV[1] = capacity
-- ARGV[2] = refill_per_sec
-- ARGV[3] = now_ms
-- ARGV[4] = ttl_seconds

local cap = tonumber(ARGV[1])
local refill = tonumber(ARGV[2])
local now_ms = tonumber(ARGV[3])
local ttl = tonumber(ARGV[4])

local tokens = 0
local last_ms = now_ms

if redis.call('EXISTS', KEYS[1]) == 1 then
  local data = redis.call('HMGET', KEYS[1], 't', 'l')
  tokens = tonumber(data[1]) or 0
  last_ms = tonumber(data[2]) or now_ms
end

local delta = math.max(0, now_ms - last_ms)
local new_tokens = math.min(cap, tokens + (delta * refill / 1000.0))

if new_tokens >= 1 then
  new_tokens = new_tokens - 1
  redis.call('HMSET', KEYS[1], 't', new_tokens, 'l', now_ms)
  if ttl and ttl > 0 then redis.call('EXPIRE', KEYS[1], ttl) end
  return {1, new_tokens, 0}
else
  local needed = 1 - new_tokens
  local retry_ms = math.ceil((needed / refill) * 1000)
  redis.call('HMSET', KEYS[1], 't', new_tokens, 'l', now_ms)
  if ttl and ttl > 0 then redis.call('EXPIRE', KEYS[1], ttl) end
  return {0, new_tokens, retry_ms}
end
`;

let cachedSha: string | undefined;

export const evaluateTokenBucket = async (
  redis: Redis,
  key: string,
  capacity: number,
  refillPerSec: number,
  ttlSeconds: number,
): Promise<TokenBucketEvalResult> => {
  const now = Date.now();
  const args = [
    capacity.toString(),
    refillPerSec.toString(),
    now.toString(),
    ttlSeconds.toString(),
  ];
  try {
    if (!cachedSha) {
      cachedSha = (await redis.script('LOAD', TOKEN_BUCKET_LUA)) as string;
    }
    const res = (await redis.evalsha(cachedSha, 1, key, ...args)) as [number, number, number];
    return { allowed: res[0] === 1, remainingTokens: res[1], retryAfterMs: res[2] };
  } catch {
    const res = (await redis.eval(TOKEN_BUCKET_LUA, 1, key, ...args)) as [number, number, number];
    return { allowed: res[0] === 1, remainingTokens: res[1], retryAfterMs: res[2] };
  }
};

export const calculateSuggestedTtlSeconds = (capacity: number, refillPerSec: number): number =>
  Math.max(5, Math.ceil((capacity / Math.max(1, refillPerSec)) * 3));
