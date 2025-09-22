import { createOrderSafe, getDbClient, type DbClient } from '@flash-sale/domain-core';
import { createWorker } from '@flash-sale/queue';
import { logger } from '@flash-sale/shared';

type CreateOrderJob = {
  jobId: string;
  userId: string;
  productId: string;
  flashSaleId: string;
  quantity: number;
  traceId?: string;
  enqueuedAt?: string;
};

const main = async () => {
  const connectionString = process.env.DATABASE_CONNECTION_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_CONNECTION_URL (or DATABASE_URL) is required');

  const { db } = getDbClient(connectionString, {
    logQueries: process.env.DATABASE_LOG_QUERIES === 'true',
    ssl: process.env.DATABASE_SSL !== 'false',
    maxConnections: Number(process.env.DATABASE_MAX_CONNECTIONS) || 10,
    connectionTimeout: Number(process.env.DATABASE_CONNECT_TIMEOUT) || 30,
    idleTimeout: Number(process.env.DATABASE_IDLE_TIMEOUT) || 30,
  });

  const workerConcurrency = Number(process.env.ORDERS_WORKER_CONCURRENCY) || 50;

  const { worker } = createWorker<CreateOrderJob>(
    'orders-create',
    async (job) => {
      const startedAtMs = Date.now();
      const jobPayload = job.data;
      const traceId = jobPayload.traceId || job.id;

      try {
        const result = await createOrderSafe(db as DbClient, {
          orderData: {
            userId: jobPayload.userId,
            productId: jobPayload.productId,
            flashSaleId: jobPayload.flashSaleId,
            quantity: jobPayload.quantity,
          },
        });

        if (result.ok) {
          logger.info(
            { traceId, jobId: job.id, id: result.order.id, ms: Date.now() - startedAtMs },
            'order created',
          );
          return { ok: true, orderId: result.order.id };
        }

        // Treat already-ordered or not-found as terminal success to avoid retries
        if (
          result.code === 'ALREADY_ORDERED' ||
          result.code === 'NOT_FOUND' ||
          result.code === 'BAD_REQUEST'
        ) {
          logger.warn(
            { traceId, jobId: job.id, code: result.code, ms: Date.now() - startedAtMs },
            'order terminal outcome',
          );
          return { ok: false, code: result.code };
        }

        // INTERNAL_ERROR -> throw to trigger retry
        throw new Error(`retryable:${result.code}`);
      } catch (error) {
        logger.error({ traceId, jobId: job.id, error }, 'order job failed');
        throw error;
      }
    },
    { connectionUrl: process.env.REDIS_URL, concurrency: workerConcurrency },
  );

  worker.on('ready', () => logger.info({ concurrency: workerConcurrency }, 'orders worker ready'));
  worker.on('error', (error) => logger.error({ error }, 'orders worker error'));

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info({ signal }, 'orders worker shutting down');
    Promise.resolve()
      .then(() => worker.close())
      .finally(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

main().catch((err) => {
  logger.error({ err }, 'orders worker bootstrap error');
  process.exit(1);
});
