import type { Request, Response, NextFunction } from 'express';
import { parseJwtPayload, extractUserId } from './decode';

const isExpired = (payload: any): boolean => {
  const exp: unknown = payload?.exp;
  if (typeof exp !== 'number') return false;
  const now = Math.floor(Date.now() / 1000);
  const skew = Number(process.env.AUTH_CLOCK_SKEW_SECONDS || '30');
  return now > exp + skew; // allow small positive clock skew
};

export const jwtOptional = () => (req: Request, _res: Response, next: NextFunction) => {
  const token = (req.headers['x-auth-token'] as string | undefined) || undefined;
  if (token) {
    const payload = parseJwtPayload(token);
    const userId = extractUserId(payload);
    if (payload && !isExpired(payload)) {
      (req as any).auth = { token, userId, payload };
    }
  }
  next();
};

export const jwtRequired = () => (req: Request, res: Response, next: NextFunction) => {
  const token = (req.headers['x-auth-token'] as string | undefined) || undefined;
  if (!token) return res.status(401).json({ error: 'auth_required' });
  const payload = parseJwtPayload(token);
  const userId = extractUserId(payload);
  if (!payload || !userId) return res.status(401).json({ error: 'invalid_token' });
  if (isExpired(payload)) return res.status(401).json({ error: 'token_expired' });
  (req as any).auth = { token, userId, payload };
  next();
};
