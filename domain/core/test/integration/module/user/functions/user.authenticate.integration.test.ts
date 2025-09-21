import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDbClient } from '../../../../../src/db/client';
import { createUser } from '../../../../../src/modules/user/functions/create';
import { authenticateUser } from '../../../../../src/modules/user/functions/authenticate';
import { DomainError } from '@flash-sale/shared';
import { startTestDb, stopTestDb } from '../../../container';
import { applyMigrations } from '../../../utils/migrations';

let connectionString: string;

describe('domain-core integration: authenticateUser', () => {
  beforeAll(async () => {
    connectionString = await startTestDb();
    await applyMigrations(connectionString);
  }, 120_000);

  afterAll(async () => {
    await stopTestDb();
  }, 120_000);

  it('authenticates with correct credentials', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const email = `auth_ok_${Date.now()}@example.com`;
      const password = 'Password123!';
      const created = await createUser(db, {
        userData: {
          email,
          givenName: 'Auth',
          familyName: 'Ok',
          password,
        },
      });

      const authed = await authenticateUser(db, { email, password });
      expect(authed.id).toBe(created.id);
      expect(authed.email).toBe(email);
    } finally {
      await queryClient.end();
    }
  });

  it('rejects invalid password with UNAUTHORISED', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const email = `auth_badpass_${Date.now()}@example.com`;
      const password = 'Password123!';
      await createUser(db, {
        userData: {
          email,
          givenName: 'Auth',
          familyName: 'BadPass',
          password,
        },
      });

      await expect(authenticateUser(db, { email, password: 'WrongPass123!' })).rejects.toSatisfy(
        (err: unknown) => err instanceof DomainError && err.code === 'UNAUTHORISED',
      );
    } finally {
      await queryClient.end();
    }
  });

  it('rejects disabled or non-existent user with UNAUTHORISED', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const email = `auth_disabled_${Date.now()}@example.com`;
      const password = 'Password123!';
      await createUser(db, {
        userData: {
          email,
          givenName: 'Auth',
          familyName: 'Disabled',
          password,
          disabled: true,
        },
      });

      await expect(authenticateUser(db, { email, password })).rejects.toSatisfy(
        (err: unknown) => err instanceof DomainError && err.code === 'UNAUTHORISED',
      );

      // Non-existent
      await expect(
        authenticateUser(db, { email: 'missing.user@example.com', password: 'Anything123!' }),
      ).rejects.toSatisfy((err: unknown) => err instanceof DomainError && err.code === 'UNAUTHORISED');
    } finally {
      await queryClient.end();
    }
  });
});

