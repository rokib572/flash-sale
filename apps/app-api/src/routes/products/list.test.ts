import { describe, it, expect, vi } from 'vitest';
import { createProductListHandler } from './list';
import { mockReq, mockRes } from '../test-utils';

vi.mock('@flash-sale/domain-core', () => ({
  listProducts: vi.fn(async () => [{ id: 'p1' }, { id: 'p2' }]),
}));

describe('products/list handler', () => {
  it('returns list', async () => {
    const handler = createProductListHandler({} as any);
    const { res, store } = mockRes();
    await handler(mockReq(), res, vi.fn());
    expect(store.body?.products?.length).toBe(2);
  });
});
