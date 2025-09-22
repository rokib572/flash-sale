export type QueueBackpressureError = {
  error: 'queue_busy';
  message: string;
  retryAfterSeconds: number;
  queuedDepth: number;
};

// Returns a structured error when queue is too deep; otherwise null.
export const validateQueueBackpressure = async (
  bullQueue: any,
  opts?: { maxQueuedDepth?: number; retryAfterSeconds?: number },
): Promise<QueueBackpressureError | null> => {
  const maxQueuedDepth = Number(opts?.maxQueuedDepth ?? 100000);
  const retryAfterSeconds = Number(opts?.retryAfterSeconds ?? 2);

  if (!bullQueue || typeof bullQueue.getJobCounts !== 'function') {
    return null;
  }
  const counts = await bullQueue.getJobCounts('waiting', 'delayed');
  const queuedDepth = Number(counts?.waiting || 0) + Number(counts?.delayed || 0);
  if (queuedDepth >= maxQueuedDepth) {
    return {
      error: 'queue_busy',
      message: 'Order queue is busy, please retry later.',
      retryAfterSeconds,
      queuedDepth,
    };
  }
  return null;
};

