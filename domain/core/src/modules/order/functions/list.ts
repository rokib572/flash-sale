import { and, desc, eq } from 'drizzle-orm';

import type { DbClient } from '../../../db/client';
import { type OrderDbo, orders } from '../schema';

export const listOrdersByUserId = async (
  db: DbClient,
  query: {
    userId: string;
    flashSaleId?: string;
    productId?: string;
    limit?: number;
    offset?: number;
  },
): Promise<OrderDbo[]> => {
  const { userId, flashSaleId, productId } = query;
  const limit = Math.max(1, Math.min(1000, Number(query.limit ?? 50)));
  const offset = Math.max(0, Number(query.offset ?? 0));

  const conditions = [eq(orders.userId, userId)];
  if (flashSaleId) conditions.push(eq(orders.flashSaleId, flashSaleId));
  if (productId) conditions.push(eq(orders.productId, productId));

  const rows = await db
    .select()
    .from(orders)
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);
  return rows as OrderDbo[];
};

