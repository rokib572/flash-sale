import { DomainError } from '@flash-sale/shared';
import type { DbClient } from '../../../db/client';
import { getUserById } from '../../user/functions/get';
import { OrderPayload } from '../schema';
import { validateUserOrder } from './validate-user-order';

export const validateOrder = async (db: DbClient, query: { orderData: OrderPayload }) => {
  const { orderData } = query;
  const { userId, flashSaleId } = orderData;

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
};
