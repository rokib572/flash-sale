import { DomainError } from '@flash-sale/shared';
import { parseDatabaseError } from '../../../db/error';

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
    const dbErr = parseDatabaseError(error);
    if (dbErr?.cause?.code === '23505') {
      throw DomainError.makeError({
        message: dbErr.cause.detail || 'unique_violation',
        code: 'BAD_REQUEST',
        clientSafeMessage: 'Product name already used.',
      });
    }
    throw error;
  }
};
