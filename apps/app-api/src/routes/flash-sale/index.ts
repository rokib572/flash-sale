import type { DbClient } from '@flash-sale/domain-core';
import { redisJsonCache } from '@flash-sale/redis';
import { Router } from 'express';
import { jwtOptional, jwtRequired } from '../../middleware/jwt';
import { createFlashSaleCheckStatusHandler } from './check-status';
import { createFlashSalesListHandler } from './list';
import { createFlashSaleCreateHandler } from './create';

export const createFlashSaleRouter = (db: DbClient) => {
  const router = Router();

  // POST /flash-sales (create)
  router.post('/', jwtRequired(), createFlashSaleCreateHandler(db));

  // GET /flash-sales (list active)
  router.get(
    '/list',
    jwtOptional(),
    redisJsonCache({
      key: () => `fs:list:active`,
      ttlSeconds: Number(process.env.STATUS_TTL_SECONDS || 1),
      negativeTtlSeconds: 2,
      enableLock: true,
    }),
    createFlashSalesListHandler(db),
  );

  // GET /flash-sales/status/:productId (Redis cached)
  router.get(
    '/status/:productId',
    jwtRequired(),
    redisJsonCache({
      key: (req) => `fs:status:${(req.params as any).productId}`,
      ttlSeconds: Number(process.env.STATUS_TTL_SECONDS || 1),
      negativeTtlSeconds: 5,
      enableLock: true,
    }),
    createFlashSaleCheckStatusHandler(db),
  );

  return router;
};
