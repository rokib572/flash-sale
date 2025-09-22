import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export type StressEnv = {
  url: string;
  productId: string;
  users: number;
  connections: number;
  duration: number;
  amount?: number;
  mode: 'same-user' | 'distinct';
  userId?: string;
  usersFile?: string;
  envFile?: string;
  dbUrl?: string;
};

export const loadEnv = (): StressEnv => {
  const envFile = process.env.ENV_FILE || '.env.local';
  const p = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(p)) dotenv.config({ path: p });

  const url = process.env.URL || 'http://localhost:4000';
  const productId = process.env.PRODUCT_ID || '';
  const users = Number(process.env.USERS || '1000');
  const connections = Number(process.env.CONNECTIONS || '50');
  const duration = Number(process.env.DURATION || '30');
  const amount = process.env.AMOUNT ? Number(process.env.AMOUNT) : undefined;
  const mode = (process.env.STRESS_MODE as StressEnv['mode']) || 'distinct';
  const userId = process.env.USER_ID;
  const usersFile = process.env.USERS_FILE;
  const dbUrl = process.env.DATABASE_CONNECTION_URL;

  return { url, productId, users, connections, duration, amount, mode, userId, usersFile, envFile, dbUrl };
};
