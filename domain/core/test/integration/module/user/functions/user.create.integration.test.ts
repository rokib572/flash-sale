import { getDbClient } from '../../../../../src/db/client';
import { createUser } from '../../../../../src/modules/user/functions/create';
import { DomainError } from '@flash-sale/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startTestDb, stopTestDb } from '../../../container';
import { applyMigrations } from '../../../utils/migrations';

let connectionString: string;

describe('domain-core integration: createUser', () => {
  beforeAll(async () => {
    connectionString = await startTestDb();
    await applyMigrations(connectionString);
  }, 120_000);

  afterAll(async () => {
    await stopTestDb();
  }, 120_000);

  it('creates a user and applies defaults', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const email = `create_${Date.now()}@example.com`;
      const user = await createUser(db, {
        userData: {
          email,
          givenName: 'Create',
          familyName: 'User',
          password: 'Password123!',
        },
      });

      expect(user.id).toBeTruthy();
      expect(user.email).toBe(email);
      expect(user.givenName).toBe('Create');
      expect(user.familyName).toBe('User');
      expect(user.disabled).toBe(false);
      expect(user.deleted).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
    } finally {
      await queryClient.end();
    }
  });

  it('rejects duplicate email with DomainError BAD_REQUEST', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const email = `dup_${Date.now()}@example.com`;
      const base = {
        givenName: 'Dup',
        familyName: 'User',
        password: 'Password123!',
      };

      const first = await createUser(db, { userData: { email, ...base } });
      expect(first.email).toBe(email);

      await expect(createUser(db, { userData: { email, ...base } })).rejects.toSatisfy(
        (err: unknown) => {
          return err instanceof DomainError && err.code === 'BAD_REQUEST';
        },
      );
    } finally {
      await queryClient.end();
    }
  });
});
