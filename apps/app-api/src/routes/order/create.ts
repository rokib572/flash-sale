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
    const traceId = (res.locals as any).traceId;

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

    const orderData = { userId, productId, flashSaleId: sale.id, quantity: 1 } as const;
    const isOrdersQueueEnabled = process.env.ORDERS_USE_QUEUE === 'true';

    if (isOrdersQueueEnabled) {
      const jobId = `${userId}__${sale.id}`; // Avoid ':' in BullMQ custom IDs
      const orderJobPayload = {
        jobId,
        ...orderData,
        traceId,
        enqueuedAt: new Date().toISOString(),
      };
      try {
        const ordersCreateQueue = (req.app.locals as any).ordersCreateQueue;
        if (!ordersCreateQueue?.enqueue) throw new Error('Orders queue not initialized');
        await ordersCreateQueue.enqueue('create', orderJobPayload, { jobId });
        res.setHeader('Cache-Control', 'no-store');
        return res.status(202).json({ queued: true, jobId, traceId });
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
