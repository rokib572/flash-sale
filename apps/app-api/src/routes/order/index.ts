import type { DbClient } from '@flash-sale/domain-core';
import { redisJsonCache } from '@flash-sale/redis';
import { Router } from 'express';
import { jwtRequired } from '../../middleware/jwt';
// Rate limiting disabled for stress testing; re-enable per-user limiter if needed
import { createOrderCheckStatusHandler } from './check-status';
import { createOrderCreateHandler } from './create';
import { createOrdersListHandler } from './list';
// debug/stats routes removed after validation

export const createOrderRouter = (db: DbClient) => {
  const router = Router();

  // POST /flash-sales/:productId/order
  router.post('/:productId/order', jwtRequired(), createOrderCreateHandler(db));

  // GET /orders/list (user's orders, optional filters) with Redis cache
  router.get(
    '/list',
    jwtRequired(),
    redisJsonCache({
      key: (req) => {
        const authUserId = (req as any).auth?.userId || 'anon';
        const q = (req as any).query as any;
        const pid = q?.productId || '';
        const fsid = q?.flashSaleId || '';
        const lim = q?.limit || '';
        const off = q?.offset || '';
        return `orders:list:${authUserId}:${pid}:${fsid}:${lim}:${off}`;
      },
      ttlSeconds: 2,
      negativeTtlSeconds: 2,
      enableLock: true,
    }),
    createOrdersListHandler(db),
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
