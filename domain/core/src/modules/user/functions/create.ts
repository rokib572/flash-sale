import { DomainError } from '@flash-sale/shared';
import { parseDatabaseError } from '../../../db/error';
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
    // Detect unique violation robustly (drizzle wraps errors under `cause`)
    const dbErr = parseDatabaseError(error);
    if (dbErr?.cause?.code === '23505') {
      throw DomainError.makeError({
        message: dbErr.cause.detail || 'unique_violation',
        code: 'BAD_REQUEST',
        clientSafeMessage: 'User email already used.',
      });
    }

    throw error;
  }
};
