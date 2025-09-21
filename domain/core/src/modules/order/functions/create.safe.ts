import { DomainError } from '@flash-sale/shared';
import type { DbClient } from '../../../db/client';
import type { OrderDbo, OrderPayload } from '../schema';
import { createOrder } from './create';

export type CreateOrderErrorCode =
  | 'ALREADY_ORDERED'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'INTERNAL_ERROR';

export type CreateOrderResult =
  | { ok: true; order: OrderDbo }
  | { ok: false; code: CreateOrderErrorCode; message: string };

export const createOrderSafe = async (
  db: DbClient,
  payload: { orderData: OrderPayload },
): Promise<CreateOrderResult> => {
  try {
    const order = await createOrder(db, payload);
    return { ok: true, order };
  } catch (err) {
    if (err instanceof DomainError) {
      const msg = err.clientSafeMessage || 'Bad request';
      if (msg.toLowerCase().includes('only place a single')) {
        return { ok: false, code: 'ALREADY_ORDERED', message: msg };
      }
      if (err.code === 'NOT_FOUND') {
        return { ok: false, code: 'NOT_FOUND', message: msg };
      }
      return { ok: false, code: 'BAD_REQUEST', message: msg };
    }
    return { ok: false, code: 'INTERNAL_ERROR', message: 'Unexpected error' };
  }
};

