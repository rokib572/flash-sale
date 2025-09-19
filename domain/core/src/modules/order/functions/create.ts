import type { DbClient } from '../../../db/client';
import { OrderDbo, orders, validateOrderPayload, type OrderPayload } from '../schema';
import { validateOrder } from './create.validate-order';

export const createOrder = async (
  db: DbClient,
  payload: { orderData: OrderPayload },
): Promise<OrderDbo> => {
  const { orderData } = payload;
  return await db.transaction(async (tx) => {
    const validatedOrderData = validateOrderPayload(orderData);
    await validateOrder(tx, { orderData: validatedOrderData });
    const [order] = await db.insert(orders).values(validatedOrderData).returning();
    return order!;
  });
};
