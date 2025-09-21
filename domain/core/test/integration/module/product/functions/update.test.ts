import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DomainError } from '@flash-sale/shared';
import { getDbClient } from '../../../../../src/db/client';
import { createProduct } from '../../../../../src/modules/product/functions/create';
import { updateProduct } from '../../../../../src/modules/product/functions/update';
import { startTestDb, stopTestDb } from '../../../container';
import { applyMigrations } from '../../../utils/migrations';

let connectionString: string;

describe('domain-core integration: updateProduct', () => {
  beforeAll(async () => {
    connectionString = await startTestDb();
    await applyMigrations(connectionString);
  }, 120_000);

  afterAll(async () => {
    await stopTestDb();
  }, 120_000);

  it('updates name and increases quantity', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const created = await createProduct(db, { productData: { name: 'Prod A', quantity: 2 } });

      const updated = await updateProduct(db, {
        accountId: 'acc-1',
        productId: created.id,
        productData: { name: 'Prod A+', quantity: 5 },
      });

      expect(updated.name).toBe('Prod A+');
      expect(updated.quantity).toBe(5);
    } finally {
      await queryClient.end();
    }
  });

  it('allows decreasing quantity by exactly 1', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const created = await createProduct(db, { productData: { name: 'Prod B', quantity: 3 } });

      const updated = await updateProduct(db, {
        accountId: 'acc-1',
        productId: created.id,
        productData: { quantity: 2 },
      });

      expect(updated.quantity).toBe(2);
    } finally {
      await queryClient.end();
    }
  });

  it('rejects decreasing quantity by more than 1', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const created = await createProduct(db, { productData: { name: 'Prod C', quantity: 5 } });

      await expect(
        updateProduct(db, {
          accountId: 'acc-1',
          productId: created.id,
          productData: { quantity: 3 },
        }),
      ).rejects.toSatisfy((err: unknown) => err instanceof DomainError && err.code === 'BAD_REQUEST');
    } finally {
      await queryClient.end();
    }
  });

  it('rejects updates on disabled product unless enabling', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const created = await createProduct(db, {
        productData: { name: 'Prod D', quantity: 2, disabled: true as any },
      });

      await expect(
        updateProduct(db, {
          accountId: 'acc-1',
          productId: created.id,
          productData: { name: 'Prod D+' },
        }),
      ).rejects.toSatisfy((err: unknown) => err instanceof DomainError && err.code === 'BAD_REQUEST');

      const enabled = await updateProduct(db, {
        accountId: 'acc-1',
        productId: created.id,
        productData: { disabled: false },
      });
      expect(enabled.disabled).toBe(false);
    } finally {
      await queryClient.end();
    }
  });
});
