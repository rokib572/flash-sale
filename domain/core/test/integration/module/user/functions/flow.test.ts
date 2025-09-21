import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDbClient } from '../../../../../src/db/client';
import { authenticateUser } from '../../../../../src/modules/user/functions/authenticate';
import { createUser } from '../../../../../src/modules/user/functions/create';
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

describe('domain-core integration: user flow', () => {

  it('creates and authenticates a user', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });

    try {
      const email = `user_${Date.now()}@example.com`;
      const password = 'Password123!';
      const created = await createUser(db, {
        userData: {
          email,
          givenName: 'Test',
          familyName: 'User',
          password,
          disabled: false,
          deleted: false,
        },
      });

      expect(created.email).toBe(email);

      const authed = await authenticateUser(db, { email, password });
      expect(authed.id).toBe(created.id);
    } finally {
      await queryClient.end();
    }
  });
});
