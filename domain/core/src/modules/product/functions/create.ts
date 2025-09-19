import { DomainError } from '@flash-sale/shared';
import postgres from 'postgres';

import type { DbClient } from '../../../db/client';
import { products, validateProductPayload, type ProductDbo, type ProductPayload } from '../schema';

export const createProduct = async (
  db: DbClient,
  payload: { productData: ProductPayload },
): Promise<ProductDbo> => {
  const { productData } = payload;
  try {
    const validated = validateProductPayload(productData);
    const [product] = await db.insert(products).values(validated).returning();
    return product!;
  } catch (error) {
    // see https://www.postgresql.org/docs/current/errcodes-appendix.html
    if (error instanceof postgres.PostgresError && error.code === '23505') {
      throw DomainError.makeError({
        message: (error as Error).message,
        code: 'BAD_REQUEST',
        clientSafeMessage: 'Product name already used.',
      });
    }
    throw error;
  }
};
