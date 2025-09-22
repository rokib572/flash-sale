import { describe, it, expect, vi } from 'vitest';
import { createFlashSaleCheckStatusHandler } from './check-status';
import { mockReq, mockRes } from '../test-utils';

vi.mock('@flash-sale/domain-core', () => ({
  getFlashSaleByProductId: vi.fn(async (_db, { productId }: any) =>
    productId === 'exists'
      ? { id: 'fs', productId, startDate: new Date(Date.now() - 1000), endDate: new Date(Date.now() + 1000) }
      : undefined,
  ),
}));

describe('flash-sale/check-status handler', () => {
  it('400 when productId missing', async () => {
    const handler = createFlashSaleCheckStatusHandler({} as any);
    const { res, store } = mockRes();
    await handler(mockReq({ params: {} as any }), res, vi.fn());
    expect(store.status).toBe(400);
  });
  it('404 when not found', async () => {
    const handler = createFlashSaleCheckStatusHandler({} as any);
    const { res, store } = mockRes();
    await handler(mockReq({ params: { productId: 'nope' } as any }), res, vi.fn());
    expect(store.status).toBe(404);
  });
  it('returns active status for existing sale', async () => {
    const handler = createFlashSaleCheckStatusHandler({} as any);
    const { res, store } = mockRes();
    await handler(mockReq({ params: { productId: 'exists' } as any }), res, vi.fn());
    expect(store.body?.status).toBe('active');
  });
});

