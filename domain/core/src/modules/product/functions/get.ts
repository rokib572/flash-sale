import { and, eq } from 'drizzle-orm';

import type { DbClient } from '../../../db/client';
import { ProductDbo, products } from '../schema';

export const getProductById = async (
  db: DbClient,
  query: { productId: string },
  opts?: { includeDisabled?: boolean },
): Promise<ProductDbo | undefined> => {
  const { productId } = query;
  const { includeDisabled = false } = opts ?? {};

  const condition = [eq(products.id, productId)];
  if (!includeDisabled) condition.push(eq(products.disabled, false));

  const whereClause = and(...condition);
  const [product] = await db.select().from(products).where(whereClause).limit(1);
  return product;
};
