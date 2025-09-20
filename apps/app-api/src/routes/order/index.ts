import type { DbClient } from '@flash-sale/domain-core';
import { redisJsonCache } from '@flash-sale/redis';
import { Router } from 'express';
import { jwtRequired } from '../../middleware/jwt';
import {
  createGlobalRateLimitMiddleware,
  createIpRateLimitMiddleware,
  createUserRateLimitMiddleware,
} from '../../middleware/rate-limit';
import { createOrderCheckStatusHandler } from './check-status';
import { createOrderCreateHandler } from './create';

export const createOrderRouter = (db: DbClient) => {
  const router = Router();

  // POST /flash-sales/:productId/order
  router.post(
    '/:productId/order',
    jwtRequired(),
    createGlobalRateLimitMiddleware(),
    createIpRateLimitMiddleware(),
    createUserRateLimitMiddleware(),
    createOrderCreateHandler(db),
  );

  // GET /flash-sales/:productId/order (check if secured)
  router.get(
    '/:productId/order',
    jwtRequired(),
    redisJsonCache({
      key: (req) => `fs:secured:${(req.params as any).productId}:${(req as any).auth?.userId}`,
      ttlSeconds: 2,
      negativeTtlSeconds: 2,
      enableLock: true,
    }),
    createOrderCheckStatusHandler(db),
  );

  return router;
};
