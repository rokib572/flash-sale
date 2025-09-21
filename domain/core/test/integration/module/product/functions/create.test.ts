import { DomainError } from '@flash-sale/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDbClient } from '../../../../../src/db/client';
import { createProduct } from '../../../../../src/modules/product/functions/create';
import { startTestDb, stopTestDb } from '../../../container';
import { applyMigrations } from '../../../utils/migrations';

let connectionString: string;

describe('domain-core integration: createProduct', () => {
  beforeAll(async () => {
    connectionString = await startTestDb();
    await applyMigrations(connectionString);
  }, 120_000);

  afterAll(async () => {
    await stopTestDb();
  }, 120_000);

  it('creates a product and applies defaults', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const name = `product_${Date.now()}`;
      const product = await createProduct(db, {
        productData: {
          name,
          quantity: 10,
        },
      });

      expect(product.id).toBeTruthy();
      expect(product.name).toBe(name);
      expect(product.quantity).toBe(10);
      expect(product.disabled).toBe(false);
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    } finally {
      await queryClient.end();
    }
  });

  it('rejects duplicate name with DomainError BAD_REQUEST', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const name = `dup_product_${Date.now()}`;
      const base = { quantity: 5 } as const;

      const first = await createProduct(db, { productData: { name, ...base } });
      expect(first.name).toBe(name);

      await expect(createProduct(db, { productData: { name, ...base } })).rejects.toSatisfy(
        (err: unknown) => err instanceof DomainError && err.code === 'BAD_REQUEST',
      );
    } finally {
      await queryClient.end();
    }
  });

  it('rejects invalid quantity (< 0) with validation error', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const name = `invalid_qty_${Date.now()}`;
      await expect(
        createProduct(db, { productData: { name, quantity: -1 } as any }),
      ).rejects.toThrow(/quantity/i);
    } finally {
      await queryClient.end();
    }
  });
});
