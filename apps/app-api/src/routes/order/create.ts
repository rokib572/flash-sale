import type { DbClient } from '@flash-sale/domain-core';
import { createOrder } from '@flash-sale/domain-core';
import type { RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { asyncHandler } from '../utils/async-handler';
import { validateOrderCreate } from './create.validate';
import { enqueueOrderJob } from './create.queue';

// POST handler: /flash-sales/:productId/order
export const createOrderCreateHandler = (db: DbClient): RequestHandler =>
  asyncHandler(async (req, res) => {
    const { productId } = req.params as { productId: string };
    const { auth } = req as AuthenticatedRequest;
    const userId = auth.userId!;
    const traceId = (res.locals as any).traceId;

    let sale;
    try {
      ({ sale } = await validateOrderCreate(db, { productId, userId }));
    } catch (error) {
      const err: any = error;
      const code = err?.code || 'BAD_REQUEST';
      const statusMap: Record<string, number> = {
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        UNAUTHORISED: 401,
        INTERNAL_ERROR: 500,
      };
      const status = statusMap[code] ?? 400;
      return res.status(status).json({
        traceId,
        error: String(code).toLowerCase(),
        message: err?.clientSafeMessage || err?.message,
      });
    }

    const orderData = { userId, productId, flashSaleId: sale.id, quantity: 1 };
    const isOrdersQueueEnabled = process.env.ORDERS_USE_QUEUE === 'true';

    if (isOrdersQueueEnabled) {
      try {
        const result = await enqueueOrderJob(req, res, { orderData, traceId });
        return res.status(result.status).json(result.body);
      } catch (error) {
        const message = (error as any)?.message || 'Failed to enqueue order';
        return res.status(500).json({ traceId, error: 'internal_error', message });
      }
    }

    try {
      const order = await createOrder(db, { orderData });
      res.setHeader('Cache-Control', 'no-store');
      return res.status(201).json({ order });
    } catch (error) {
      const err: any = error;
      const code = err?.code || 'BAD_REQUEST';
      const statusMap: Record<string, number> = {
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        UNAUTHORISED: 401,
        INTERNAL_ERROR: 500,
      };
      const status = statusMap[code] ?? 400;
      return res.status(status).json({
        traceId,
        error: String(code).toLowerCase(),
        message: err?.clientSafeMessage || err?.message,
      });
    }
  });
