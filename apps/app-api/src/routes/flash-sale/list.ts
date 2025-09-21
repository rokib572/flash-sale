import type { DbClient } from '@flash-sale/domain-core';
import { getFlashSalesList } from '@flash-sale/domain-core';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../utils/async-handler';

export const createFlashSalesListHandler = (db: DbClient): RequestHandler =>
  asyncHandler(async (_req, res) => {
    const items = await getFlashSalesList(db);
    res.setHeader('Cache-Control', 'public, max-age=1, stale-while-revalidate=5');
    return res.json({ flashSales: items });
  });
