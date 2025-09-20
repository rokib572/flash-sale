import type { JwtPayload } from '../../types';

export const decodeBase64Url = (value: string): string => {
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Buffer.from(b64, 'base64').toString('utf8');
};

export const parseJwtPayload = (token: string): JwtPayload | undefined => {
  const parts = token.split('.');
  if (parts.length < 2) return undefined;
  try {
    const payloadStr = decodeBase64Url(parts[1] || '');
    return JSON.parse(payloadStr) as JwtPayload;
  } catch {
    return undefined;
  }
};

export const extractUserId = (payload?: JwtPayload): string | undefined => payload?.sub || payload?.userId || payload?.uid;
