import { getEnv } from '@flash-sale/shared';
import IORedis from 'ioredis';

export const createRedis = () => {
  const url = getEnv('REDIS_URL', 'redis://localhost:6379');
  const client = new IORedis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
  return client;
};
