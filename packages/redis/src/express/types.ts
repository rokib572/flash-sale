export type Request = {
  app?: { locals?: Record<string, unknown> };
  params?: Record<string, unknown>;
  headers?: Record<string, string | string[] | undefined>;
};

export type Response = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  status: (code: number) => Response;
  json: (body: unknown) => Response;
};

export type NextFunction = (err?: unknown) => void;

export type RequestHandler = (req: Request, res: Response, next: NextFunction) => unknown;

export type RedisJsonCacheOptions = {
  key: (req: import('./types').Request) => string;
  ttlSeconds: number;
  negativeTtlSeconds?: number; // for 404s
  enableLock?: boolean;
  lockTtlMs?: number;
  waitBackoffMs?: number;
  waitMaxMs?: number;
  shouldCache?: (statusCode: number) => boolean; // default: cache 200 and 404
};
