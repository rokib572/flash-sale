export type JwtPayload = {
  sub?: string;
  userId?: string;
  uid?: string;
  [k: string]: unknown;
};

export type AuthInfo = {
  token?: string;
  userId?: string;
  payload?: JwtPayload;
};

