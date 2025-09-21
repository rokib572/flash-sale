import type { DbClient } from '@flash-sale/domain-core';
import { redisJsonCache } from '@flash-sale/redis';
import { Router } from 'express';
import { jwtRequired } from '../../middleware/jwt';
import { createProductHandler } from './create';
import { createProductByIdHandler } from './get';
import { createProductListHandler } from './list';

export const createProductsRouter = (db: DbClient) => {
  const router = Router();

  // POST /products/create (create)
  router.post('/create', jwtRequired(), createProductHandler(db));

  // GET /products/list (non-disabled products via domain function)
  // Place before '/:productId' to avoid route shadowing
  router.get(
    '/list',
    jwtRequired(),
    redisJsonCache({
      key: () => 'products:list:active',
      ttlSeconds: 5,
      negativeTtlSeconds: 2,
      enableLock: true,
    }),
    createProductListHandler(db),
  );

  // GET /products/:productId (single)
  router.get('/:productId', jwtRequired(), createProductByIdHandler(db));

  return router;
};
