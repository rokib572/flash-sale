export const base64UrlEncode = (input: string) => {
  const b64 = btoa(unescape(encodeURIComponent(input)));
  return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

export const makeDummyJwt = (payload: Record<string, unknown>) => {
  const header = { alg: 'none', typ: 'JWT' };
  const encHeader = base64UrlEncode(JSON.stringify(header));
  const encPayload = base64UrlEncode(JSON.stringify(payload));
  // Signature is irrelevant for server which only decodes payload
  const signature = '';
  return `${encHeader}.${encPayload}.${signature}`;
};
