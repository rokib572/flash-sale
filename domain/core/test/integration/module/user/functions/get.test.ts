import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { getDbClient } from '../../../../../src/db/client';
import { createUser } from '../../../../../src/modules/user/functions/create';
import { getUserByEmail, getUserById } from '../../../../../src/modules/user/functions/get';
import { startTestDb, stopTestDb } from '../../../container';
import { applyMigrations } from '../../../utils/migrations';

let connectionString: string;

beforeAll(async () => {
  connectionString = await startTestDb();
  await applyMigrations(connectionString);
}, 120_000);

afterAll(async () => {
  await stopTestDb();
}, 120_000);

describe('domain-core integration: getUser', () => {

  it('gets user by email and id', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const email = `get_${Date.now()}@example.com`;
      const created = await createUser(db, {
        userData: {
          email,
          givenName: 'Get',
          familyName: 'User',
          password: 'Password123!',
        },
      });

      const byEmail = await getUserByEmail(db, { email });
      expect(byEmail?.id).toBe(created.id);
      expect(byEmail?.email).toBe(email);

      const byId = await getUserById(db, { userId: created.id });
      expect(byId?.email).toBe(email);
    } finally {
      await queryClient.end();
    }
  });

  it('returns undefined for missing user', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const missingEmail = `missing_${Date.now()}@example.com`;
      const byEmail = await getUserByEmail(db, { email: missingEmail });
      expect(byEmail).toBeUndefined();

      const byId = await getUserById(db, { userId: 'user_000000000000000000000000' });
      expect(byId).toBeUndefined();
    } finally {
      await queryClient.end();
    }
  });
});
