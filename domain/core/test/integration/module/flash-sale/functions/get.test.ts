import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDbClient } from '../../../../../src/db/client';
import { createProduct } from '../../../../../src/modules/product/functions/create';
import { createFlashSale } from '../../../../../src/modules/flash-sale/functions/create';
import { getFlashSaleByProductId, getOverlappingProductFlashSales } from '../../../../../src/modules/flash-sale/functions/get';
import { startTestDb, stopTestDb } from '../../../container';
import { applyMigrations } from '../../../utils/migrations';

let connectionString: string;

describe('domain-core integration: flash-sale get functions', () => {
  beforeAll(async () => {
    connectionString = await startTestDb();
    await applyMigrations(connectionString);
  }, 120_000);

  afterAll(async () => {
    await stopTestDb();
  }, 120_000);

  it('gets flash sale by product id', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const product = await createProduct(db, { productData: { name: `fs_get_${Date.now()}`, quantity: 10 } });
      const now = new Date();
      const startDate = new Date(now.getTime() + 60_000);
      const endDate = new Date(now.getTime() + 10 * 60_000);
      const sale = await createFlashSale(db, {
        flashSaleData: {
          name: `sale_get_${Date.now()}`,
          description: 'Get by product id',
          productId: product.id,
          startDate,
          endDate,
        },
      });

      const found = await getFlashSaleByProductId(db, { productId: product.id });
      expect(found?.id).toBe(sale.id);
      expect(found?.productId).toBe(product.id);
    } finally {
      await queryClient.end();
    }
  });

  it('returns overlapping flash sales for given window and product', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const productA = await createProduct(db, { productData: { name: `fs_overlap_A_${Date.now()}`, quantity: 10 } });
      const productB = await createProduct(db, { productData: { name: `fs_overlap_B_${Date.now()}`, quantity: 10 } });

      const now = new Date();
      const aStart = new Date(now.getTime() + 60_000);
      const aEnd = new Date(now.getTime() + 10 * 60_000);
      await createFlashSale(db, {
        flashSaleData: {
          name: `sale_A_${Date.now()}`,
          description: 'Overlap A',
          productId: productA.id,
          startDate: aStart,
          endDate: aEnd,
        },
      });

      // Non-overlapping window for product A (after A ends)
      const nonOverlap = await getOverlappingProductFlashSales(db, {
        productId: productA.id,
        startDate: new Date(aEnd.getTime() + 60_000),
        endDate: new Date(aEnd.getTime() + 120_000),
      });
      expect(nonOverlap.length).toBe(0);

      // Overlapping window for product A (inside A)
      const overlapInside = await getOverlappingProductFlashSales(db, {
        productId: productA.id,
        startDate: new Date(aStart.getTime() + 30_000),
        endDate: new Date(aEnd.getTime() - 30_000),
      });
      expect(overlapInside.length).toBeGreaterThan(0);

      // Ensure filter by product: same window for product B should be empty
      const bOverlap = await getOverlappingProductFlashSales(db, {
        productId: productB.id,
        startDate: new Date(aStart.getTime() + 30_000),
        endDate: new Date(aEnd.getTime() - 30_000),
      });
      expect(bOverlap.length).toBe(0);
    } finally {
      await queryClient.end();
    }
  });
});

