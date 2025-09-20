import { DomainError } from '@flash-sale/shared';
import postgres from 'postgres';
import type { DbClient } from '../../../db/client';
import { users, validateUserPayload, type UserDbo, type UserPayload } from '../schema';
import { hashPasswordScrypt } from './user-password-hash';

export const createUser = async (
  db: DbClient,
  payload: { userData: UserPayload },
): Promise<UserDbo> => {
  const { userData } = payload;
  try {
    const validatedData = validateUserPayload(userData);
    const { password } = validatedData;
    const passwordHash = await hashPasswordScrypt(password as string);
    const [user] = await db
      .insert(users)
      .values({ ...validatedData, passwordHash })
      .returning();

    return user!;
  } catch (error) {
    // see https://www.postgresql.org/docs/current/errcodes-appendix.html
    if (error instanceof postgres.PostgresError && error.code === '23505') {
      throw DomainError.makeError({
        message: error.message,
        code: 'BAD_REQUEST',
        clientSafeMessage: 'User email already used.',
      });
    }

    throw error;
  }
};
