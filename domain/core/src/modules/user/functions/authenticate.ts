import { DomainError } from '@flash-sale/shared';
import type { DbClient } from '../../../db/client';
import { getUserByEmail } from './get';
import type { UserDbo } from '../schema';
import { verifyPasswordScrypt } from './user-password-hash';

export const authenticateUser = async (
  db: DbClient,
  payload: { email: string; password: string },
): Promise<UserDbo> => {
  const { email, password } = payload;
  const user = await getUserByEmail(db, { email });
  if (!user || user.deleted || user.disabled) {
    throw DomainError.makeError({
      message: 'invalid_credentials',
      code: 'UNAUTHORISED',
      clientSafeMessage: 'Invalid email or password.',
    });
  }

  const ok = await verifyPasswordScrypt(password, user.passwordHash);
  if (!ok) {
    throw DomainError.makeError({
      message: 'invalid_credentials',
      code: 'UNAUTHORISED',
      clientSafeMessage: 'Invalid email or password.',
    });
  }

  return user;
};
