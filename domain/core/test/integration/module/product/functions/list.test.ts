import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDbClient } from '../../../../../src/db/client';
import { createProduct } from '../../../../../src/modules/product/functions/create';
import { listProducts } from '../../../../../src/modules/product/functions/list';
import { startTestDb, stopTestDb } from '../../../container';
import { applyMigrations } from '../../../utils/migrations';

let connectionString: string;

describe('domain-core integration: listProducts', () => {
  beforeAll(async () => {
    connectionString = await startTestDb();
    await applyMigrations(connectionString);
  }, 120_000);

  afterAll(async () => {
    await stopTestDb();
  }, 120_000);

  it('lists only enabled products ordered by name', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      // Seed a few products
      const names = ['Banana', 'Apple', 'Carrot'];
      for (const name of names) {
        await createProduct(db, { productData: { name, quantity: 1 } });
      }
      // disabled one should not appear
      await createProduct(db, { productData: { name: 'Zebra', quantity: 1, disabled: true as any } });

      const list = await listProducts(db);
      const listedNames = list.map((p) => p.name);

      expect(listedNames).toEqual(['Apple', 'Banana', 'Carrot']);
      expect(list.every((p) => p.disabled === false)).toBe(true);
    } finally {
      await queryClient.end();
    }
  });
});
