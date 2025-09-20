import type { RateLimitScope } from '../../types';

export const buildRateLimitKey = (prefix: string, scope: RateLimitScope, id: string): string =>
  `${prefix}:${scope}:${id}`;
