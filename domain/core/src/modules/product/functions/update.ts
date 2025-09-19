import { eq } from 'drizzle-orm';

import { DomainError } from '@flash-sale/shared';
import type { DbClient } from '../../../db/client';
import { products, validateProductPayload, type ProductDbo, type ProductPayload } from '../schema';
import { validateProduct } from './update.validate-product';

export const updateProduct = async (
  db: DbClient,
  payload: { accountId: string; productId: string; productData: Partial<ProductPayload> },
): Promise<ProductDbo> => {
  const { productId, productData } = payload;

  return await db.transaction(async (tx) => {
    const product = await validateProduct(tx, { productId });

    // disable updates for disabled product unless the update is to change the disable status
    if (product.disabled && productData.disabled !== false) {
      throw DomainError.makeError({
        code: 'BAD_REQUEST',
        message: 'Unable to update disabled product',
        clientSafeMessage: 'Unable to update disabled product',
      });
    }

    // Make sure quantity can only be decreased by 1 at a time
    if (product.quantity - (productData.quantity ?? product.quantity) > 1) {
      throw DomainError.makeError({
        code: 'BAD_REQUEST',
        message: 'Product quantity can only be decreased by 1 at a time',
        clientSafeMessage: 'Product quantity can only be decreased by 1 at a time',
      });
    }

    const { id: _, ...existingProductData } = product;
    const validatedData = validateProductPayload({
      ...existingProductData,
      ...productData,
    });

    const whereClause = eq(products.id, productId);

    const [updatedProduct] = await tx
      .update(products)
      .set(validatedData)
      .where(whereClause)
      .returning();
    return updatedProduct!;
  });
};
