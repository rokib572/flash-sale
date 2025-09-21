import { DomainError } from '@flash-sale/shared';
import type { DbClient } from '../../../db/client';
import { getUserOrder } from './get';

export const validateUserOrder = async (
  db: DbClient,
  query: { userId: string; flashSaleId: string },
) => {
  const { userId, flashSaleId } = query;
  const userOrder = await getUserOrder(db, { userId, flashSaleId });

  if (userOrder) {
    throw DomainError.makeError({
      message: 'user_already_has_order',
      code: 'BAD_REQUEST',
      clientSafeMessage: "You're not allowed to order twice for the same flash sale.",
    });
  }
};
