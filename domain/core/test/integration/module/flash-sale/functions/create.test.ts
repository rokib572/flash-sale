import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDbClient } from '../../../../../src/db/client';
import { createProduct } from '../../../../../src/modules/product/functions/create';
import { createFlashSale } from '../../../../../src/modules/flash-sale/functions/create';
import { DomainError } from '@flash-sale/shared';
import { startTestDb, stopTestDb } from '../../../container';
import { applyMigrations } from '../../../utils/migrations';

let connectionString: string;

describe('domain-core integration: createFlashSale', () => {
  beforeAll(async () => {
    connectionString = await startTestDb();
    await applyMigrations(connectionString);
  }, 120_000);

  afterAll(async () => {
    await stopTestDb();
  }, 120_000);

  it('creates a flash sale for a valid product and time window', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const product = await createProduct(db, { productData: { name: `fs_prod_${Date.now()}`, quantity: 100 } });
      const now = new Date();
      const startDate = new Date(now.getTime() + 60_000);
      const endDate = new Date(now.getTime() + 10 * 60_000);

      const sale = await createFlashSale(db, {
        flashSaleData: {
          name: `sale_${Date.now()}`,
          description: 'Flash sale test',
          productId: product.id,
          startDate,
          endDate,
        },
      });

      expect(sale.id).toBeTruthy();
      expect(sale.productId).toBe(product.id);
      expect(new Date(sale.startDate).getTime()).toBe(startDate.getTime());
      expect(new Date(sale.endDate).getTime()).toBe(endDate.getTime());
    } finally {
      await queryClient.end();
    }
  });

  it('rejects when product does not exist or is disabled', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const now = new Date();
      const startDate = new Date(now.getTime() + 60_000);
      const endDate = new Date(now.getTime() + 10 * 60_000);

      // Missing product
      await expect(
        createFlashSale(db, {
          flashSaleData: {
            name: `sale_missing_${Date.now()}`,
            description: 'No product',
            productId: 'product_000000000000000000000000',
            startDate,
            endDate,
          },
        }),
      ).rejects.toSatisfy((err: unknown) => err instanceof DomainError && err.code === 'NOT_FOUND');

      // Disabled product
      const disabledProduct = await createProduct(db, {
        productData: { name: `fs_disabled_${Date.now()}`, quantity: 10, disabled: true as any },
      });
      await expect(
        createFlashSale(db, {
          flashSaleData: {
            name: `sale_disabled_${Date.now()}`,
            description: 'Disabled product',
            productId: disabledProduct.id,
            startDate,
            endDate,
          },
        }),
      ).rejects.toSatisfy((err: unknown) => err instanceof DomainError && err.code === 'NOT_FOUND');
    } finally {
      await queryClient.end();
    }
  });

  it('rejects invalid time windows (end before now or start >= end)', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const product = await createProduct(db, { productData: { name: `fs_time_${Date.now()}`, quantity: 50 } });
      const now = new Date();

      // endDate before now
      await expect(
        createFlashSale(db, {
          flashSaleData: {
            name: `sale_past_${Date.now()}`,
            description: 'Past end',
            productId: product.id,
            startDate: new Date(now.getTime() - 10 * 60_000),
            endDate: new Date(now.getTime() - 5 * 60_000),
          },
        }),
      ).rejects.toSatisfy((err: unknown) => err instanceof DomainError && err.code === 'BAD_REQUEST');

      // startDate >= endDate
      const start = new Date(now.getTime() + 10 * 60_000);
      const end = new Date(now.getTime() + 5 * 60_000);
      await expect(
        createFlashSale(db, {
          flashSaleData: {
            name: `sale_invalid_${Date.now()}`,
            description: 'Start after end',
            productId: product.id,
            startDate: start,
            endDate: end,
          },
        }),
      ).rejects.toSatisfy((err: unknown) => err instanceof DomainError && err.code === 'BAD_REQUEST');
    } finally {
      await queryClient.end();
    }
  });

  it('rejects overlapping flash sales for the same product', async () => {
    const { db, queryClient } = getDbClient(connectionString, { ssl: false, logQueries: false });
    try {
      const product = await createProduct(db, { productData: { name: `fs_overlap_${Date.now()}`, quantity: 20 } });
      const now = new Date();
      const start1 = new Date(now.getTime() + 60_000);
      const end1 = new Date(now.getTime() + 10 * 60_000);
      await createFlashSale(db, {
        flashSaleData: {
          name: `sale_one_${Date.now()}`,
          description: 'First',
          productId: product.id,
          startDate: start1,
          endDate: end1,
        },
      });

      // Overlapping window
      const start2 = new Date(now.getTime() + 5 * 60_000);
      const end2 = new Date(now.getTime() + 15 * 60_000);
      await expect(
        createFlashSale(db, {
          flashSaleData: {
            name: `sale_two_${Date.now()}`,
            description: 'Overlap',
            productId: product.id,
            startDate: start2,
            endDate: end2,
          },
        }),
      ).rejects.toSatisfy((err: unknown) => err instanceof DomainError && err.code === 'BAD_REQUEST');
    } finally {
      await queryClient.end();
    }
  });
});

