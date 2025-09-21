import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDbClient } from '../../../../../src/db/client';
import { createProduct } from '../../../../../src/modules/product/functions/create';
import { createFlashSale } from '../../../../../src/modules/flash-sale/functions/create';
import { getFlashSalesList } from '../../../../../src/modules/flash-sale/functions/list';
import { startTestDb, stopTestDb } from '../../../container';
import { applyMigrations } from '../../../utils/migrations';

let connectionString: string;

describe('domain-core integration: getFlashSalesList', () => {
  beforeAll(async () => {
    connectionString = await startTestDb();
    await applyMigrations(connectionString);
  }, 120_000);

  afterAll(async () => {
    await stopTestDb();
  }, 120_000);

  it('returns empty array when there are no flash sales', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const list = await getFlashSalesList(db);
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBe(0);
    } finally {
      await queryClient.end();
    }
  });

  it('lists flash sales ordered by startDate ascending', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      // Seed product
      const product = await createProduct(db, { productData: { name: `fs_list_${Date.now()}`, quantity: 10 } });

      const now = new Date();
      // Use non-overlapping windows to satisfy validation
      const windows = [
        { offsetStart: 1, offsetEnd: 3 },
        { offsetStart: 5, offsetEnd: 8 },
        { offsetStart: 10, offsetEnd: 12 },
      ];

      // Create three flash sales with different windows
      for (const [i, w] of windows.entries()) {
        await createFlashSale(db, {
          flashSaleData: {
            name: `list_sale_${i}_${Date.now()}`,
            description: 'List order test',
            productId: product.id,
            startDate: new Date(now.getTime() + w.offsetStart * 60_000),
            endDate: new Date(now.getTime() + w.offsetEnd * 60_000),
          },
        });
      }

      const list = await getFlashSalesList(db);
      expect(list.length).toBe(3);
      // Ensure ascending by startDate
      const starts = list.map((s) => new Date(s.startDate).getTime());
      const sorted = [...starts].sort((a, b) => a - b);
      expect(starts).toEqual(sorted);
    } finally {
      await queryClient.end();
    }
  });
});
