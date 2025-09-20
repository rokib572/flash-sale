import IORedis, { type Redis, type RedisOptions } from 'ioredis';
import { logger } from '@flash-sale/shared';

export type CreateRedisClientOptions = {
  url?: string;
  options?: RedisOptions;
  name?: string;
};

/**
 * Create a high-throughput Redis client configured for Docker Compose defaults.
 * - Defaults to REDIS_URL env or redis://redis:6379 (Compose service name)
 * - Enables auto pipelining for better throughput
 * - Adds basic lifecycle logging
 */
export const createRedisClient = (cfg: CreateRedisClientOptions = {}): Redis => {
  const url = cfg.url || process.env.REDIS_URL || 'redis://redis:6379';
  const name = cfg.name || 'redis';
  const client = new IORedis(url, {
    enableAutoPipelining: true,
    // Reasonable retry strategy: fast backoff to 2s max
    retryStrategy: (retries) => Math.min(2000, 50 + retries * 50),
    // Allow env/consumer overrides last
    ...(cfg.options || {}),
  });

  client.on('connect', () => logger.info({ name, url: redacted(url) }, 'Redis connect'));
  client.on('ready', () => logger.info({ name }, 'Redis ready'));
  client.on('error', (err) => logger.error({ name, err }, 'Redis error'));
  client.on('end', () => logger.warn({ name }, 'Redis connection ended'));
  client.on('reconnecting', (delay: number) => logger.warn({ name, delay }, 'Redis reconnecting'));

  return client as unknown as Redis;
};

const redacted = (u: string) => u.replace(/:\/\/([^:@]+):[^@]+@/, '://$1:***@');
