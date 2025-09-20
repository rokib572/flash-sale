import type { Request, Response, NextFunction } from 'express';
import { parseJwtPayload, extractUserId } from './decode';

export const jwtOptional = () => (req: Request, _res: Response, next: NextFunction) => {
  const token = (req.headers['x-auth-token'] as string | undefined) || undefined;
  if (token) {
    const payload = parseJwtPayload(token);
    const userId = extractUserId(payload);
    (req as any).auth = { token, userId, payload };
  }
  next();
};

export const jwtRequired = () => (req: Request, res: Response, next: NextFunction) => {
  const token = (req.headers['x-auth-token'] as string | undefined) || undefined;
  if (!token) return res.status(401).json({ error: 'auth_required' });
  const payload = parseJwtPayload(token);
  const userId = extractUserId(payload);
  if (!payload || !userId) return res.status(401).json({ error: 'invalid_token' });
  (req as any).auth = { token, userId, payload };
  next();
};
