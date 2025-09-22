import { getDbClient } from '@flash-sale/domain-core';
import { createProduct } from '@flash-sale/domain-core/src/modules/product/functions/create';
import { createFlashSale } from '@flash-sale/domain-core/src/modules/flash-sale/functions/create';
import { createUser } from '@flash-sale/domain-core/src/modules/user/functions/create';

export const seedData = async (dbUrl: string, opts: { users: number; productId?: string }) => {
  const { users } = opts;
  const { db, queryClient } = getDbClient(dbUrl, { ssl: false, logQueries: false });
  try {
    // Product
    const product = await createProduct(db, {
      productData: { name: `stress-prod-${Date.now()}`, quantity: 1_000_000 },
    });
    // Flash sale (active for 1 hour)
    const now = new Date();
    await createFlashSale(db, {
      flashSaleData: {
        name: `stress-sale-${Date.now()}`,
        description: 'stress test window',
        productId: product.id,
        startDate: new Date(now.getTime() - 60_000),
        endDate: new Date(now.getTime() + 60 * 60_000),
      },
    });

    // Users
    const base = Date.now();
    for (let i = 0; i < users; i++) {
      const email = `stress_${base}_${i}@example.com`;
      await createUser(db, {
        userData: {
          email,
          givenName: 'Stress',
          familyName: `User${i}`,
          password: 'Password123!',
        },
      });
    }

    return { productId: product.id };
  } finally {
    await queryClient.end();
  }
};

