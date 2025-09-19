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
      message: 'User already has an order.',
      code: 'BAD_REQUEST',
      clientSafeMessage: 'Users are allowed to only place a single flash sale order.',
    });
  }
};
