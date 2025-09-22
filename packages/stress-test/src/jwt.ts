const base64UrlEncode = (value: string) =>
  Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

export const makeUnsignedJwt = (payload: Record<string, unknown>) => {
  const header = { alg: 'none', typ: 'JWT' } as const;
  const encHeader = base64UrlEncode(JSON.stringify(header));
  const encPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encHeader}.${encPayload}.`;
};

