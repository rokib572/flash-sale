import { describe, it, expect, vi } from 'vitest';
import { createUserAuthenticateHandler } from './authenticate';
import { mockReq, mockRes } from '../test-utils';

vi.mock('@flash-sale/domain-core', () => ({
  authenticateUser: vi.fn(async (_db, { email }: any) => ({ id: 'u1', email, givenName: 'A', familyName: 'B' })),
}));

describe('user/authenticate handler', () => {
  it('400 on invalid body', async () => {
    const handler = createUserAuthenticateHandler({} as any);
    const { res, store } = mockRes();
    await handler(mockReq({ body: {} }), res, vi.fn());
    expect(store.status).toBe(400);
  });
  it('returns token and user on success', async () => {
    const handler = createUserAuthenticateHandler({} as any);
    const { res, store } = mockRes();
    await handler(
      mockReq({ body: { email: 'a@b.com', password: 'x' } }),
      res,
      vi.fn(),
    );
    expect(store.body?.token).toBeTruthy();
    expect(store.body?.user?.id).toBe('u1');
  });
});

