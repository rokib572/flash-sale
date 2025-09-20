import type { DbClient } from '@flash-sale/domain-core';
import { getFlashSaleByProductId } from '@flash-sale/domain-core';
import { getOrSetJsonNullable } from '@flash-sale/redis';
import type { RequestHandler } from 'express';
import type { Redis } from 'ioredis';
import { asyncHandler } from '../utils/async-handler';

export const createFlashSaleCheckStatusHandler = (db: DbClient): RequestHandler =>
  asyncHandler(async (req, res) => {
    const { productId } = req.params as { productId: string };
    if (!productId) return res.status(400).json({ error: 'product_id_required' });

    const redis: Redis | undefined = req.app?.locals?.redis;
    const key = `fs:status:${productId}`;

    if (redis) {
      const ttl = Number(process.env.STATUS_TTL_SECONDS || 1);
      const { value } = await getOrSetJsonNullable(redis, {
        key,
        ttlSeconds: ttl,
        negativeTtlSeconds: 5,
        enableLock: true,
        lockTtlMs: 2000,
        waitBackoffMs: 40,
        waitMaxMs: 200,
        fetch: async () => {
          const flashSaleData = await getFlashSaleByProductId(db, { productId });
          if (!flashSaleData) return null;
          const { startDate, endDate } = flashSaleData;
          return {
            status: getStatus({ startDate, endDate }),
            responseDateTime: new Date().toISOString(),
            sale: {
              ...flashSaleData,
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            },
          };
        },
      });
      res.setHeader('Cache-Control', 'no-store');
      if (value === null) return res.status(404).json({ status: 'not_found' as const });
      return res.json(value);
    }

    // Fallback path if Redis unavailable: direct DB
    const flashSaleData = await getFlashSaleByProductId(db, { productId });
    res.setHeader('Cache-Control', 'no-store');
    if (!flashSaleData) return res.status(404).json({ status: 'not_found' });
    const { startDate, endDate } = flashSaleData;
    return res.json({
      status: getStatus({ startDate, endDate }),
      responseDateTime: new Date().toISOString(),
      sale: {
        ...flashSaleData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  });

const getStatus = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const now = new Date();
  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'ended';

  return 'active';
};
