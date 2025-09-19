import { logger } from '@flash-sale/shared';
import cors from 'cors';
import express from 'express';
import { healthRouter } from './routes/health';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);

app.get('/', (_req, res) => {
  res.json({ name: 'flash-sale-api', status: 'ok' });
});

const port = Number(process.env.PORT) || 4000;

const bootstrap = async () => {
  app.listen(port, () => {
    logger.info({ port }, 'API listening');
  });
};

bootstrap().catch((err) => {
  logger.error({ err }, 'API bootstrap error');
  process.exit(1);
});
