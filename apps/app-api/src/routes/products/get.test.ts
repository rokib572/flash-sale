import { describe, it, expect, vi } from 'vitest';
import { createProductByIdHandler } from './get';
import { mockReq, mockRes } from '../test-utils';

vi.mock('@flash-sale/domain-core', () => ({
  getProductById: vi.fn(async (_db, { productId }: any) =>
    productId === 'p1' ? { id: 'p1', name: 'X' } : undefined,
  ),
}));

describe('products/get handler', () => {
  it('400 if missing id', async () => {
    const handler = createProductByIdHandler({} as any);
    const { res, store } = mockRes();
    await handler(mockReq({ params: {} as any }), res, vi.fn());
    expect(store.status).toBe(400);
  });
  it('404 if not found', async () => {
    const handler = createProductByIdHandler({} as any);
    const { res, store } = mockRes();
    await handler(mockReq({ params: { productId: 'nope' } as any }), res, vi.fn());
    expect(store.status).toBe(404);
  });
  it('200 with product', async () => {
    const handler = createProductByIdHandler({} as any);
    const { res, store } = mockRes();
    await handler(mockReq({ params: { productId: 'p1' } as any }), res, vi.fn());
    expect(store.body?.product?.id).toBe('p1');
  });
});
