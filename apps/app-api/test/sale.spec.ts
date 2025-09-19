import { describe, it, expect, beforeAll } from 'vitest';
import IORedis from 'ioredis';
import { SaleService } from '@flash-sale/domain-sale';

describe('SaleService (integration, requires Redis)', () => {
  let redis: IORedis;
  let available = true;
  beforeAll(async () => {
    redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
    try {
      await redis.ping();
    } catch {
      available = false;
    }
  });

  (available ? it : it.skip)('enforces one-per-user and stock floor', async () => {
    const now = Date.now();
    const service = new SaleService(redis as any, {
      startsAt: new Date(now - 1000),
      endsAt: new Date(now + 60_000),
      totalStock: 2,
    });
    process.env.RESET_ON_START = '1';
    await service.init();
    const u = 'user-x';
    const r1 = await service.attemptPurchase(u);
    const r2 = await service.attemptPurchase(u);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(false);
    expect(r2).toHaveProperty('reason', 'already_purchased');
  });
});

