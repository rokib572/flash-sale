export type RateLimitScope = 'global' | 'user' | 'ip';

export type TokenBucketEvalResult = {
  allowed: boolean;
  remainingTokens: number;
  retryAfterMs: number;
};

export type RateLimitOptions = {
  scope: RateLimitScope;
  capacity: number;
  refillPerSec: number;
  ttlSeconds?: number;
  keyPrefix?: string;
};

