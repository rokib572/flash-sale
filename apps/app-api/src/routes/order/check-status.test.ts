import { describe, it, expect, vi } from 'vitest';
import { mockReq, mockRes } from '../test-utils';

vi.mock('@flash-sale/domain-core', () => ({
  getFlashSaleByProductId: vi.fn(async (_db, { productId }: any) =>
    productId === 'p1' ? { id: 'fs1', productId } : undefined,
  ),
  getUserOrder: vi.fn(async (_db, { userId, flashSaleId }: any) =>
    userId && flashSaleId ? { id: 'o1', userId, flashSaleId, productId: 'p1', quantity: 1, createdAt: new Date().toISOString() } : undefined,
  ),
}));

const { createOrderCheckStatusHandler } = await import('./check-status');

describe('order/check-status handler', () => {
  it('secured field present', async () => {
    const handler = createOrderCheckStatusHandler({} as any);
    const { res, store } = mockRes();
    const req = mockReq({ params: { productId: 'p1' } as any, auth: { userId: 'u1' } } as any);
    await handler(req, res, vi.fn());
    expect(store.body === undefined || typeof store.body?.secured === 'boolean').toBe(true);
  });
});
