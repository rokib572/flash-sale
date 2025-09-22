import { describe, it, expect, vi } from 'vitest';
import { createFlashSaleCreateHandler } from './create';
import { mockReq, mockRes } from '../test-utils';

vi.mock('@flash-sale/domain-core', () => ({
  createFlashSale: vi.fn(async (_db, { flashSaleData }: any) => ({ id: 'fs1', ...flashSaleData })),
}));

describe('flash-sale/create handler', () => {
  it('returns 400 on invalid body', async () => {
    const handler = createFlashSaleCreateHandler({} as any);
    const { res, store } = mockRes();
    await handler(mockReq({ body: { name: '' } }), res, vi.fn());
    expect(store.status).toBe(400);
    expect(store.body?.error).toBe('invalid_body');
  });

  it('returns 201 on success', async () => {
    const handler = createFlashSaleCreateHandler({} as any);
    const body = {
      name: 'Sale',
      description: 'Desc',
      productId: 'p1',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600_000).toISOString(),
    };
    const { res, store } = mockRes();
    await handler(mockReq({ body }), res, vi.fn());
    expect(store.status).toBe(201);
    expect(store.body?.flashSale?.name).toBe('Sale');
  });
});

