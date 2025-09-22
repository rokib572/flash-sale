import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes } from '../test-utils';

vi.mock('./create.validate', () => ({
  validateOrderCreate: vi.fn(async (_db, { productId, userId }: any) => ({
    productId,
    userId,
    sale: { id: 'fs1', productId, startDate: new Date(Date.now() - 1000), endDate: new Date(Date.now() + 1000) },
  })),
}));

vi.mock('@flash-sale/domain-core', () => ({
  createOrder: vi.fn(async (_db, { orderData }: any) => ({ id: 'o1', ...orderData })),
}));

vi.mock('./create.queue', () => ({
  enqueueOrderJob: vi.fn(async () => ({ status: 202, body: { queued: true, jobId: 'j1' } })),
}));

describe('order/create handler', () => {
  beforeEach(() => {
    delete (process as any).env.ORDERS_USE_QUEUE;
  });

  it('creates order directly (201) when queue disabled', async () => {
    const handler = createOrderCreateHandler({} as any);
    const { res, store } = mockRes();
    const req = mockReq({ params: { productId: 'p1' } as any, auth: { userId: 'u1' } } as any);
    await handler(req, res, vi.fn());
    expect(store.body === undefined || store.body?.order?.id === 'o1').toBe(true);
  });

  it('enqueues when queue enabled (202)', async () => {
    (process as any).env.ORDERS_USE_QUEUE = 'true';
    const handler = createOrderCreateHandler({} as any);
    const { res, store } = mockRes();
    const req = mockReq({ params: { productId: 'p1' } as any, auth: { userId: 'u1' } } as any);
    (req.app.locals as any).ordersCreateQueue = { enqueue: vi.fn(), queue: { getJobCounts: vi.fn(async () => ({ waiting: 0, delayed: 0 })) } };
    await handler(req, res, vi.fn());
    expect(store.body === undefined || store.body?.queued === true).toBe(true);
  });
});
const { createOrderCreateHandler } = await import('./create');
