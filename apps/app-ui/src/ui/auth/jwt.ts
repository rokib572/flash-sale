export type JwtPayload = {
  sub?: string;
  email?: string;
  iat?: number;
  exp?: number;
  [k: string]: unknown;
};

const decodeBase64Url = (value: string): string => {
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  try {
    return atob(b64);
  } catch {
    return '';
  }
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

export const getTokenExpiry = (token?: string | null): number | undefined => {
  if (!token) return undefined;
  const p = parseJwtPayload(token);
  return p?.exp && typeof p.exp === 'number' ? p.exp : undefined;
};

export const isTokenExpired = (token?: string | null, skewSec = 0): boolean => {
  const exp = getTokenExpiry(token);
  if (!exp) return false; // no exp -> treat as session without expiry
  const now = Math.floor(Date.now() / 1000);
  return now + skewSec >= exp;
};

