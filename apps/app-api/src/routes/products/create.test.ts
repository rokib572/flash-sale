import { describe, it, expect, vi } from 'vitest';
import { createProductHandler } from './create';
import { mockReq, mockRes } from '../test-utils';

vi.mock('@flash-sale/domain-core', () => ({
  createProduct: vi.fn(async (_db, { productData }: any) => ({ id: 'p1', ...productData })),
}));

describe('products/create handler', () => {
  it('400 on invalid body', async () => {
    const handler = createProductHandler({} as any);
    const { res, store } = mockRes();
    await handler(mockReq({ body: {} }), res, vi.fn());
    expect(store.status).toBe(400);
  });
  it('201 on success', async () => {
    const handler = createProductHandler({} as any);
    const { res, store } = mockRes();
    await handler(
      mockReq({ body: { name: 'N', quantity: 1, disabled: false } }),
      res,
      vi.fn(),
    );
    expect(store.status).toBe(201);
    expect(store.body?.product?.name).toBe('N');
  });
});
