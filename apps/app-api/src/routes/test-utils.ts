import type { Request, Response } from 'express';

export const mockReq = (init?: Partial<Request>): Request => {
  return {
    params: {},
    query: {},
    body: undefined,
    headers: {},
    app: { locals: {} },
    ...((init || {}) as any),
  } as unknown as Request;
};

export const mockRes = () => {
  const store: { status?: number; body?: any; headers: Record<string, any>; locals: any } = {
    headers: {},
    locals: {},
  };
  const res = {
    locals: store.locals,
    status(code: number) {
      store.status = code;
      return res;
    },
    json(payload: any) {
      if (store.status == null) store.status = 200;
      store.body = payload;
      return res;
    },
    setHeader(name: string, value: any) {
      store.headers[name] = value;
    },
  } as unknown as Response;
  return { res, store };
};
