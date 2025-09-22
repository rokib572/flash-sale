import type { DbClient } from '@flash-sale/domain-core';
import { listOrdersByUserId } from '@flash-sale/domain-core';
import type { RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { asyncHandler } from '../utils/async-handler';

// GET handler: /orders/list?limit=&offset=&productId=&flashSaleId=
export const createOrdersListHandler = (db: DbClient): RequestHandler =>
  asyncHandler(async (req, res) => {
    const { auth } = req as AuthenticatedRequest;
    const userId = auth.userId!;

    const limit = Number((req.query.limit as string) ?? '50');
    const offset = Number((req.query.offset as string) ?? '0');
    const productId = (req.query.productId as string) || undefined;
    const flashSaleId = (req.query.flashSaleId as string) || undefined;

    const rows = await listOrdersByUserId(db, { userId, limit, offset, productId, flashSaleId });
    return res.json({
      orders: rows.map((o) => ({
        id: o.id,
        userId: o.userId,
        flashSaleId: o.flashSaleId,
        productId: o.productId,
        quantity: o.quantity,
        createdAt: o.createdAt,
      })),
      limit,
      offset,
    });
  });

