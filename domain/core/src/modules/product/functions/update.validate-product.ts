import { DomainError } from '@flash-sale/shared';
import type { DbClient } from '../../../db/client';
import { type ProductDbo } from '../schema';
import { getProductById } from './get';

export const validateProduct = async (
  db: DbClient,
  query: { productId: string },
): Promise<ProductDbo> => {
  const { productId } = query;
  const product = await getProductById(db, { productId }, { includeDisabled: true });
  if (!product) {
    throw DomainError.makeError({
      message: 'Product not found.',
      code: 'NOT_FOUND',
      clientSafeMessage: 'Product not found.',
    });
  }

  return product;
};
