import type { AuthInfo } from '.';

declare global {
  namespace Express {
    // Augment Express Request with our auth info
    interface Request {
      auth?: AuthInfo;
    }
  }
}

export {};
