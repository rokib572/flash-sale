import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { getDbClient } from '../../../../../src/db/client';
import { createProduct } from '../../../../../src/modules/product/functions/create';
import { getProductById } from '../../../../../src/modules/product/functions/get';
import { startTestDb, stopTestDb } from '../../../container';
import { applyMigrations } from '../../../utils/migrations';

let connectionString: string;

describe('domain-core integration: getProductById', () => {
  beforeAll(async () => {
    connectionString = await startTestDb();
    await applyMigrations(connectionString);
  }, 120_000);

  afterAll(async () => {
    await stopTestDb();
  }, 120_000);

  it('returns a product by id when enabled', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const name = `get_by_id_${Date.now()}`;
      const created = await createProduct(db, { productData: { name, quantity: 3 } });

      const found = await getProductById(db, { productId: created.id });
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(name);
    } finally {
      await queryClient.end();
    }
  });

  it('returns undefined for missing id and for disabled when not included', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const missing = await getProductById(db, { productId: 'product_000000000000000000000000' });
      expect(missing).toBeUndefined();

      const name = `disabled_${Date.now()}`;
      const disabled = await createProduct(db, {
        productData: { name, quantity: 1, disabled: true as any },
      });
      const notFound = await getProductById(db, { productId: disabled.id });
      expect(notFound).toBeUndefined();
    } finally {
      await queryClient.end();
    }
  });

  it('returns disabled product when includeDisabled=true', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const name = `disabled_included_${Date.now()}`;
      const disabled = await createProduct(db, {
        productData: { name, quantity: 2, disabled: true as any },
      });

      const found = await getProductById(db, { productId: disabled.id }, { includeDisabled: true });
      expect(found?.id).toBe(disabled.id);
      expect(found?.disabled).toBe(true);
    } finally {
      await queryClient.end();
    }
  });
});
