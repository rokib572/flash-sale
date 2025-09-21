import { DomainError } from '@flash-sale/shared';
import type { DbClient } from '../../../db/client';
import { getProductById } from '../../product/functions/get';
import { FlashSalePayload } from '../schema';
import { getOverlappingProductFlashSales } from './get';

export const validateFlashSale = async (
  db: DbClient,
  query: { flashSaleData: FlashSalePayload },
) => {
  const { flashSaleData } = query;
  const { startDate, endDate, productId } = flashSaleData;
  const now = new Date();

  // Check if startDate and endDate are valid
  if (startDate >= endDate || endDate < now) {
    throw DomainError.makeError({
      message: 'startDate must be before endDate and endDate must be after current date.',
      code: 'BAD_REQUEST',
      clientSafeMessage: 'Invalid flash sale time window.',
    });
  }

  const product = await getProductById(db, { productId });
  // Check if the product exists
  if (!product || product.disabled) {
    throw DomainError.makeError({
      message: 'Product not found.',
      code: 'NOT_FOUND',
      clientSafeMessage: 'Product not found.',
    });
  }

  // Check if there is an existing flash sale for the product
  const flashSale = await getOverlappingProductFlashSales(db, { productId, startDate, endDate });
  if (flashSale && flashSale.length > 0) {
    throw DomainError.makeError({
      message: 'Flash sale exist for the product within the date range.',
      code: 'BAD_REQUEST',
      clientSafeMessage: 'There is a flash sale within the date range exist for the product.',
    });
  }
};
