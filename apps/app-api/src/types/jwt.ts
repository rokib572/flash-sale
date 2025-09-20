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

// Express request that is guaranteed to have auth populated
export interface AuthenticatedRequest extends Express.Request {
  auth: AuthInfo;
}
