import type { DbClient } from '@flash-sale/domain-core';
import { Router } from 'express';
import { jwtRequired } from '../../middleware/jwt';
import {
  createGlobalRateLimitMiddleware,
  createIpRateLimitMiddleware,
  createUserRateLimitMiddleware,
} from '../../middleware/rate-limit';
import { createFlashSaleCheckStatusHandler } from './check-status';
import { createFlashSaleOrderHandler } from './order';

export const createFlashSaleRouter = (db: DbClient) => {
  const router = Router();

  // GET /flash-sales/:productId/status
  router.get('/:productId/status', jwtRequired(), createFlashSaleCheckStatusHandler(db));

  // POST /flash-sales/:productId/order
  router.post(
    '/:productId/order',
    jwtRequired(),
    createGlobalRateLimitMiddleware(),
    createIpRateLimitMiddleware(),
    createUserRateLimitMiddleware(),
    createFlashSaleOrderHandler(db),
  );

  return router;
};
