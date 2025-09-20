import type { DbClient } from '@flash-sale/domain-core';
import { Router } from 'express';
import { jwtRequired } from '../../middleware/jwt';
import { createFlashSaleCheckStatusHandler } from './check-status';
import { redisJsonCache } from '@flash-sale/redis';

export const createFlashSaleRouter = (db: DbClient) => {
  const router = Router();

  // GET /flash-sales/:productId/status (Redis cached)
  router.get(
    '/:productId/status',
    jwtRequired(),
    redisJsonCache({
      key: (req) => `fs:status:${(req.params as any).productId}`,
      ttlSeconds: Number(process.env.STATUS_TTL_SECONDS || 1),
      negativeTtlSeconds: 5,
      enableLock: true,
    }),
    createFlashSaleCheckStatusHandler(db),
  );

  // Order routes moved to routes/order

  return router;
};
