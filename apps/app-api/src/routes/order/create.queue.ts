import type { Request, Response } from 'express';

import { validateQueueBackpressure } from './validate.queue.backpressure';

type OrderJobData = {
  userId: string;
  productId: string;
  flashSaleId: string;
  quantity: number;
};

export const enqueueOrderJob = async (
  req: Request,
  res: Response,
  params: { orderData: OrderJobData; traceId: string },
): Promise<{ status: number; body: any }> => {
  const { orderData, traceId } = params;
  const ordersCreateQueue = (req.app.locals as any).ordersCreateQueue;
  if (!ordersCreateQueue?.enqueue) throw new Error('Orders queue not initialized');

  const maxQueuedDepth = Number(process.env.ORDERS_QUEUE_MAX_QUEUED || '100000');
  const retryAfterSeconds = Number(process.env.ORDERS_QUEUE_RETRY_AFTER_SECONDS || '2');
  const bullQueue: any = ordersCreateQueue.queue;

  const bp = await validateQueueBackpressure(bullQueue, { maxQueuedDepth, retryAfterSeconds });
  if (bp) {
    res.setHeader('Retry-After', String(bp.retryAfterSeconds));
    return { status: 503, body: { traceId, ...bp } };
  }

  const jobId = `${orderData.userId}__${orderData.flashSaleId}`; // Avoid ':' in BullMQ custom IDs
  const orderJobPayload = {
    jobId,
    ...orderData,
    traceId,
    enqueuedAt: new Date().toISOString(),
  };

  await ordersCreateQueue.enqueue('create', orderJobPayload, { jobId });
  res.setHeader('Cache-Control', 'no-store');
  return { status: 202, body: { queued: true, jobId, traceId } };
};

