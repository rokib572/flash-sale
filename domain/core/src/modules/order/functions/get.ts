import { and, eq } from 'drizzle-orm';

import type { DbClient } from '../../../db/client';
import { OrderDbo, orders } from '../schema';

export const getUserOrder = async (
  db: DbClient,
  query: { userId: string; flashSaleId?: string },
): Promise<OrderDbo | undefined> => {
  const { userId, flashSaleId } = query;

  const condition = [eq(orders.userId, userId)];
  if (flashSaleId) condition.push(eq(orders.flashSaleId, flashSaleId));

  const whereClause = and(...condition);
  const [order] = await db.select().from(orders).where(whereClause).limit(1);
  return order;
};
