import type { DbClient } from '@flash-sale/domain-core';
import { createOrder, getFlashSaleByProductId } from '@flash-sale/domain-core';
import { DomainError } from '@flash-sale/shared';
import type { RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { asyncHandler } from '../utils/async-handler';

// POST handler: /flash-sales/:productId/order
export const createOrderCreateHandler = (db: DbClient): RequestHandler =>
  asyncHandler(async (req, res) => {
    const { productId } = req.params as { productId: string };
    const { auth } = req as AuthenticatedRequest;
    const userId = auth.userId!;

    if (!productId) {
      throw DomainError.makeError({
        message: 'product_id_required',
        code: 'BAD_REQUEST',
        clientSafeMessage: 'product_id_required',
      });
    }

    const sale = await getFlashSaleByProductId(db, { productId });
    if (!sale) {
      throw DomainError.makeError({
        message: 'flash_sale_not_found',
        code: 'NOT_FOUND',
        clientSafeMessage: 'flash_sale_not_found',
      });
    }

    const order = await createOrder(db, {
      orderData: {
        userId,
        flashSaleId: sale.id,
        quantity: 1,
      },
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(201).json({ order });
  });
