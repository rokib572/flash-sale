import { getDbClient } from '@flash-sale/domain-core';
import { createRedisClient } from '@flash-sale/redis';
import { DomainError, logger } from '@flash-sale/shared';
import cors, { type CorsOptions } from 'cors';
import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { createFlashSaleRouter } from './routes/flash-sale';
import { healthRouter } from './routes/health';
import { createOrderRouter } from './routes/order';
import { createProductsRouter } from './routes/products';
import { createUserRouter } from './routes/user';
import crypto from 'node:crypto';

const app = express();

// Core server hardening / tuning for throughput
app.disable('x-powered-by');
// Attach a per-request trace id
app.use((_req, res, next) => {
  const traceId = crypto.randomUUID();
  (res.locals as any).traceId = traceId;
  next();
});
// If behind a proxy/load balancer set hops via env, default 1
const TRUST_PROXY = process.env.TRUST_PROXY ?? '1';
app.set(
  'trust proxy',
  TRUST_PROXY === 'true'
    ? true
    : TRUST_PROXY === 'false'
      ? false
      : Number(TRUST_PROXY) || TRUST_PROXY,
);

// CORS with preflight cache
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const corsOptions: CorsOptions = {
  origin: corsOrigins.length ? corsOrigins : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  maxAge: 86400, // cache preflight for 24h
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parsers with explicit limits
const jsonLimit = process.env.JSON_LIMIT || '100kb';
// Accept JSON bodies and tolerate text/plain bodies containing JSON (some clients send text/plain)
app.use(
  express.json({
    limit: jsonLimit,
    type: ['application/json', 'text/plain'],
  }),
);
// Also accept URL-encoded bodies for form posts
app.use(express.urlencoded({ extended: true, limit: jsonLimit }));

// Routes
app.use('/health', healthRouter);

// (Static UI serving is registered after API routes in bootstrap)

// Centralized error handler with DomainError mapping
app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // Handle DomainError even across different module instances by duck-typing
    const isDomainErrorLike = (e: any) =>
      e && typeof e === 'object' && typeof e.code === 'string' && typeof e.message === 'string';

    if (err instanceof DomainError || isDomainErrorLike(err)) {
      const e: any = err;
      const map: Record<string, number> = {
        BAD_REQUEST: 400,
        UNPROCESSABLE_CONTENT: 422,
        NOT_FOUND: 404,
        UNAUTHORISED: 401,
        HTTP_ERROR: 400,
        INTERNAL_ERROR: 500,
      };
      const code = e.code || 'BAD_REQUEST';
      const status = map[code] ?? 400;
      const traceId = (res.locals as any).traceId;
      // Log minimal details (avoid leaking stack traces)
      logger.warn({ traceId, status, code, msg: e.clientSafeMessage || e.message }, 'Domain error');
      // Respond with client-safe message only
      return res
        .status(status)
        .json({ traceId, error: String(code).toLowerCase(), message: e.clientSafeMessage || 'Bad request' });
    }
    const traceId = (res.locals as any).traceId;
    // Log minimal details
    logger.error({ traceId, msg: (err as any)?.message || 'Unhandled error' }, 'Unhandled error');
    res.status(500).json({ traceId, error: 'internal_error', message: 'Unexpected error' });
  },
);

const port = Number(process.env.PORT) || 4000;

const bootstrap = async () => {
  // Initialize Redis and DB once for the process
  const redis = createRedisClient({ name: 'api' });
  app.locals.redis = redis;

  // Initialize DB once for the process
  const connectionString = process.env.DATABASE_CONNECTION_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_CONNECTION_URL (or DATABASE_URL) is required');
  }
  const { db } = getDbClient(connectionString, {
    logQueries: process.env.DATABASE_LOG_QUERIES === 'true',
    ssl: process.env.DATABASE_SSL !== 'false',
    maxConnections: Number(process.env.DATABASE_MAX_CONNECTIONS) || 20,
    connectionTimeout: Number(process.env.DATABASE_CONNECT_TIMEOUT) || 30,
    idleTimeout: Number(process.env.DATABASE_IDLE_TIMEOUT) || 30,
  });

  // Mount routers that need DB access
  app.use('/flash-sales', createFlashSaleRouter(db));
  app.use('/orders', createOrderRouter(db));
  app.use('/products', createProductsRouter(db));
  app.use('/users', createUserRouter(db));

  // Serve UI static assets if present (after API routes)
  const uiDist = path.resolve(process.cwd(), 'apps/app-ui/dist');
  if (fs.existsSync(uiDist)) {
    app.use(express.static(uiDist));
    // SPA fallback for client routes
    app.get('*', (_req, res) => {
      res.sendFile(path.join(uiDist, 'index.html'));
    });
  }

  const server = http.createServer(app);

  // Tune timeouts to play nicely with load balancers (e.g., AWS ALB)
  server.keepAliveTimeout = 65_000; // 65s
  server.headersTimeout = 66_000; // must be > keepAliveTimeout
  // 0 disables per-request timeout, rely on LB timeouts
  server.requestTimeout = 0;

  server.listen(port, () => {
    logger.info({ port }, 'API listening');
  });

  // Graceful shutdown
  const shutdown = (signal: NodeJS.Signals) => {
    logger.info({ signal }, 'Shutting down');
    // Stop accepting new connections
    server.close((err) => {
      if (err) {
        logger.error({ err }, 'Server close error');
        process.exitCode = 1;
      }
      Promise.resolve()
        .then(async () => {
          try {
            await redis.quit();
          } catch (e) {
            logger.warn({ e }, 'Error closing Redis');
          }
        })
        .finally(() => process.exit());
    });
    // Fallback timeout
    setTimeout(
      () => {
        logger.warn('Forced shutdown');
        process.exit(1);
      },
      Number(process.env.SHUTDOWN_TIMEOUT_MS) || 10_000,
    ).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

bootstrap().catch((err) => {
  logger.error({ err }, 'API bootstrap error');
  process.exit(1);
});
