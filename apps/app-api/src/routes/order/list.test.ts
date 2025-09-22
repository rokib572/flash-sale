import { describe, it, expect, vi } from 'vitest';
import { createOrdersListHandler } from './list';
import { mockReq, mockRes } from '../test-utils';

vi.mock('@flash-sale/domain-core', () => ({
  listOrdersByUserId: vi.fn(async (_db, { userId }: any) =>
    userId ? [{ id: 'o1', userId, flashSaleId: null, productId: 'p1', quantity: 1, createdAt: new Date().toISOString() }] : [],
  ),
}));

describe('order/list handler', () => {
  it('returns orders list for user', async () => {
    const handler = createOrdersListHandler({} as any);
    const { res, store } = mockRes();
    const req = mockReq({ auth: { userId: 'u1' }, query: { limit: '10', offset: '0' } as any } as any);
    await handler(req, res, vi.fn());
    expect(Array.isArray(store.body?.orders)).toBe(true);
  });
});

