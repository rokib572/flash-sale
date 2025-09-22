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

    try {
      const order = await createOrder(db, {
        orderData: { userId, productId, flashSaleId: sale.id, quantity: 1 },
      });
      res.setHeader('Cache-Control', 'no-store');
      return res.status(201).json({ order });
    } catch (e) {
      const err: any = e;
      const code = err?.code || 'BAD_REQUEST';
      const map: Record<string, number> = {
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        UNAUTHORISED: 401,
        INTERNAL_ERROR: 500,
      };
      const status = map[code] ?? 400;
      const traceId = (res.locals as any).traceId;
      return res.status(status).json({
        traceId,
        error: String(code).toLowerCase(),
        message: err?.clientSafeMessage || err?.message,
      });
    }
  });
