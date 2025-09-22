import type { DbClient } from '../../../db/client';
import {
  flashSales,
  validateFlashSalePayload,
  type FlashSaleDbo,
  type FlashSalePayload,
} from '../schema';
import { validateFlashSale } from './create.validate-flash-sale';

export const createFlashSale = async (
  db: DbClient,
  payload: { flashSaleData: FlashSalePayload },
): Promise<FlashSaleDbo> => {
  const { flashSaleData } = payload;
  return await db.transaction(async (tx) => {
    const validatedData = validateFlashSalePayload(flashSaleData);
    await validateFlashSale(tx, { flashSaleData: validatedData });

    const [created] = await tx.insert(flashSales).values(validatedData).returning();
    return created;
  });
};
