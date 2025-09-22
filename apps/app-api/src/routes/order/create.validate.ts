import type { DbClient, FlashSaleDbo } from '@flash-sale/domain-core';
import { getFlashSaleByProductId, getUserById } from '@flash-sale/domain-core';
import { DomainError } from '@flash-sale/shared';
import { getSaleStatus } from '@flash-sale/shared/date-utils';

export type OrderCreateValidation = {
  productId: string;
  userId: string;
  sale: FlashSaleDbo;
};

export const validateOrderCreate = async (
  db: DbClient,
  params: { productId?: string | null; userId?: string | null },
): Promise<OrderCreateValidation> => {
  const productId = params.productId?.trim();
  const userId = params.userId?.trim();

  if (!productId) {
    throw DomainError.makeError({
      message: 'product_id_required',
      code: 'BAD_REQUEST',
      clientSafeMessage: 'product_id_required',
    });
  }

  if (!userId) {
    throw DomainError.makeError({
      message: 'invalid_user',
      code: 'UNAUTHORISED',
      clientSafeMessage: 'invalid_user',
    });
  }

  const sale = await getFlashSaleByProductId(db, { productId });
  if (!sale) {
    throw DomainError.makeError({
      message: 'flash_sale_not_found',
      code: 'NOT_FOUND',
      clientSafeMessage: 'flash_sale_not_found',
    });
  }

  // Enforce sale window using shared status
  const status = getSaleStatus({ start: sale.startDate as any, end: sale.endDate as any });
  if (status === 'upcoming') {
    throw DomainError.makeError({
      message: 'flash_sale_not_started',
      code: 'BAD_REQUEST',
      clientSafeMessage: 'Flash sale has not started yet.',
    });
  }
  if (status === 'ended') {
    throw DomainError.makeError({
      message: 'flash_sale_ended',
      code: 'BAD_REQUEST',
      clientSafeMessage: 'Flash sale has ended.',
    });
  }

  // Validate user exists
  const user = await getUserById(db, { userId });
  if (!user) {
    throw DomainError.makeError({
      message: 'invalid_user',
      code: 'UNAUTHORISED',
      clientSafeMessage: 'invalid_user',
    });
  }

  return { productId, userId, sale };
};
