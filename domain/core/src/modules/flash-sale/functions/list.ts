import type { DbClient } from '../../../db/client';
import { flashSales, type FlashSaleDbo } from '../schema';

export const getFlashSalesList = async (db: DbClient): Promise<FlashSaleDbo[]> => {
  const now = new Date();
  const flashSalesData = await db.select().from(flashSales).orderBy(flashSales.startDate);
  return flashSalesData;
};
