import { eq } from 'drizzle-orm';

import type { DbClient } from '../../../db/client';
import { UserDbo, users } from '../schema';

export const getUserByEmail = async (
  db: DbClient,
  query: { email: string },
): Promise<UserDbo | undefined> => {
  const { email } = query;

  const whereClause = eq(users.email, email);

  const [user] = await db.select().from(users).where(whereClause).limit(1);
  return user;
};

export const getUserById = async (
  db: DbClient,
  query: { userId: string },
): Promise<UserDbo | undefined> => {
  const { userId } = query;

  const whereClause = eq(users.id, userId);

  const [user] = await db.select().from(users).where(whereClause).limit(1);
  return user;
};
