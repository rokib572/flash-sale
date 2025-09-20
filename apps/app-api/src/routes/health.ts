import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  let redis: any | undefined;
  try {
    redis = req.app?.locals?.redis;
  } catch {}

  let redisStatus: 'ok' | 'down' | 'n/a' = 'n/a';
  if (redis && typeof redis.ping === 'function') {
    try {
      await Promise.race([
        redis.ping(),
        new Promise((_resolve, reject) => setTimeout(() => reject(new Error('timeout')), 200)),
      ]);
      redisStatus = 'ok';
    } catch {
      redisStatus = 'down';
    }
  }

  res.json({ ok: true, ts: new Date().toISOString(), redis: redisStatus });
});
