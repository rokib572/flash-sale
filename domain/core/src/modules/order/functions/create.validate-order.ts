import { DomainError } from '@flash-sale/shared';
import { getSaleStatus } from '@flash-sale/shared/date-utils';
import type { DbClient } from '../../../db/client';
import { getFlashSaleById } from '../../flash-sale/functions/get';
import { getUserById } from '../../user/functions/get';
import { OrderPayload } from '../schema';
import { validateUserOrder } from './validate-user-order';

export const validateOrder = async (db: DbClient, query: { orderData: OrderPayload }) => {
  const { orderData } = query;
  const { userId, flashSaleId, productId } = orderData;

  // Check if quantity is valid
  if (orderData.quantity <= 0 || (flashSaleId && orderData.quantity > 1)) {
    throw DomainError.makeError({
      message: 'Order Quantity cannot be zero or more than one.',
      code: 'NOT_FOUND',
      clientSafeMessage: 'Order Quantity cannot be 0 (zero) or more than 1 (one).',
    });
  }

  const user = await getUserById(db, { userId });
  // Check if user exists
  if (!user) {
    throw DomainError.makeError({
      message: 'User not found.',
      code: 'NOT_FOUND',
      clientSafeMessage: 'User not found.',
    });
  }

  // Check if user already has an order for the flash sale
  if (flashSaleId) await validateUserOrder(db, { userId, flashSaleId });

  // Validate flash sale exists and is active, and product matches
  if (flashSaleId) {
    const sale = await getFlashSaleById(db, { id: flashSaleId });
    if (!sale) {
      throw DomainError.makeError({
        message: 'Flash sale not found.',
        code: 'NOT_FOUND',
        clientSafeMessage: 'Flash sale not found.',
      });
    }

    if (productId && sale.productId !== productId) {
      throw DomainError.makeError({
        message: 'Product does not match flash sale.',
        code: 'BAD_REQUEST',
        clientSafeMessage: 'Invalid product for this flash sale.',
      });
    }

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
  }
};
