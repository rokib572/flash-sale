import { and, eq, gte, lte } from 'drizzle-orm';

import type { DbClient } from '../../../db/client';
import { type FlashSaleDbo, flashSales } from '../schema';

export const getFlashSaleByProductId = async (
  db: DbClient,
  query: { productId: string },
): Promise<FlashSaleDbo | undefined> => {
  const { productId } = query;

  const whereClause = eq(flashSales.productId, productId);

  const [flashSale] = await db.select().from(flashSales).where(whereClause).limit(1);
  return flashSale;
};

export const getOverlappingProductFlashSales = async (
  db: DbClient,
  query: { productId: string; startDate: Date; endDate: Date },
): Promise<FlashSaleDbo[]> => {
  const { productId, startDate, endDate } = query;

  // Overlap condition: existing.start <= new.end AND existing.end >= new.start
  const condition = [eq(flashSales.productId, productId)];
  const dateTimeClause = [lte(flashSales.startDate, endDate), gte(flashSales.endDate, startDate)];
  const whereClause = and(...condition, ...dateTimeClause);

  const rows = await db.select().from(flashSales).where(whereClause);
  return rows;
};
