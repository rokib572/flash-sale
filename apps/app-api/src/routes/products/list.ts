import type { DbClient } from '@flash-sale/domain-core';
import { listProducts } from '@flash-sale/domain-core';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../utils/async-handler';

export const createProductListHandler = (db: DbClient): RequestHandler =>
  asyncHandler(async (_req, res) => {
    const products = await listProducts(db);
    return res.json({ products });
  });
