import type { DbClient } from '../../../db/client';
import { OrderDbo, orders, validateOrderPayload, type OrderPayload } from '../schema';
import { validateOrder } from './create.validate-order';
import { parseDatabaseError } from '../../../db/error';
import { DomainError } from '@flash-sale/shared';

export const createOrder = async (
  db: DbClient,
  payload: { orderData: OrderPayload },
): Promise<OrderDbo> => {
  const { orderData } = payload;
  try {
    return await db.transaction(async (tx) => {
      const validatedOrderData = validateOrderPayload(orderData);
      await validateOrder(tx, { orderData: validatedOrderData });
      const [order] = await db.insert(orders).values(validatedOrderData).returning();
      return order!;
    });
  } catch (error) {
    const dbErr = parseDatabaseError(error);
    if (dbErr?.cause?.code === '23505') {
      // Unique constraint: (userId, flashSaleId)
      throw DomainError.makeError({
        message: 'User already has an order.',
        code: 'BAD_REQUEST',
        clientSafeMessage: 'Users are allowed to only place a single flash sale order.',
      });
    }
    throw error;
  }
};
