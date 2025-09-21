import { eq } from 'drizzle-orm';

import type { DbClient } from '../../../db/client';
import { products, type ProductDbo } from '../schema';

export const listProducts = async (db: DbClient): Promise<ProductDbo[]> => {
  const productsData = await db
    .select()
    .from(products)
    .where(eq(products.disabled, false))
    .orderBy(products.name);
  return productsData;
};
