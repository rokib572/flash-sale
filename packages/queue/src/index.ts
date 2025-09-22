import { Queue, Worker, type JobsOptions, type Processor, type QueueOptions, type WorkerOptions } from 'bullmq';

export type CreateQueueOptions = {
  connectionUrl?: string;
  prefix?: string;
  defaultJobOptions?: JobsOptions;
  connection?: QueueOptions['connection'];
};

export type EnqueueOptions = JobsOptions & { jobId?: string };

export const createQueue = (name: string, opts: CreateQueueOptions = {}) => {
  const connection = opts.connection ?? (opts.connectionUrl ? { url: opts.connectionUrl } : undefined);
  const queueOptions: QueueOptions = {
    prefix: opts.prefix,
    defaultJobOptions: opts.defaultJobOptions,
    ...(connection ? { connection } : {}),
  } as QueueOptions;
  const queue = new Queue(name, queueOptions);

  const enqueue = async <T>(jobName: string, data: T, options?: EnqueueOptions) => {
    return queue.add(jobName, data as any, options);
  };

  return { queue, enqueue };
};

export type CreateWorkerOptions = {
  connectionUrl?: string;
  concurrency?: number;
  connection?: WorkerOptions['connection'];
};

export const createWorker = <T = unknown>(
  name: string,
  processor: Processor<T, unknown>,
  opts: CreateWorkerOptions = {},
) => {
  const connection = opts.connection ?? (opts.connectionUrl ? { url: opts.connectionUrl } : undefined);
  const workerOptions: WorkerOptions = {
    concurrency: opts.concurrency ?? 10,
    ...(connection ? { connection } : {}),
  } as WorkerOptions;
  const worker = new Worker<T>(name, processor, workerOptions);

  const close = async () => {
    await worker.close();
  };

  return { worker, close };
};

export type { JobsOptions } from 'bullmq';
