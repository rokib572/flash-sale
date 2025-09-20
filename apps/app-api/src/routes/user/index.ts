import type { DbClient } from '@flash-sale/domain-core';
import { Router } from 'express';
import { createUserAuthenticateHandler } from './authenticate';

export const createUserRouter = (db: DbClient) => {
  const router = Router();

  router.post('/authenticate', createUserAuthenticateHandler(db));

  return router;
};

