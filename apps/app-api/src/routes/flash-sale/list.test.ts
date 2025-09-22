import { describe, it, expect, vi } from 'vitest';
import { createFlashSalesListHandler } from './list';
import { mockReq, mockRes } from '../test-utils';

vi.mock('@flash-sale/domain-core', () => ({
  getFlashSalesList: vi.fn(async () => [{ id: 'a' }, { id: 'b' }]),
}));

describe('flash-sale/list handler', () => {
  it('returns list payload', async () => {
    const handler = createFlashSalesListHandler({} as any);
    const { res, store } = mockRes();
    await handler(mockReq(), res, vi.fn());
    expect(store.body?.flashSales?.length).toBe(2);
  });
});

