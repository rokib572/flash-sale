import { classifyDomainError, DomainError } from '@flash-sale/shared';
import { and, eq, gt, sql } from 'drizzle-orm';
import type { DbClient } from '../../../db/client';
import { parseDatabaseError } from '../../../db/error';
import { products } from '../../product/schema';
import { OrderDbo, orders, validateOrderPayload, type OrderPayload } from '../schema';
import { validateOrder } from './create.validate-order';

export const createOrder = async (
  db: DbClient,
  payload: { orderData: OrderPayload },
): Promise<OrderDbo> => {
  const { orderData } = payload;
  const { productId } = orderData;
  try {
    return await db.transaction(async (tx) => {
      const validatedOrderData = validateOrderPayload(orderData);
      await validateOrder(tx, { orderData: validatedOrderData });

      const updatedProducts = await tx
        .update(products)
        .set({ quantity: sql`${products.quantity} - 1` as any })
        .where(and(eq(products.id, productId), gt(products.quantity, 0)))
        .returning();

      if (updatedProducts.length === 0) {
        throw DomainError.makeError({
          message: 'sold_out',
          code: 'BAD_REQUEST',
          clientSafeMessage: 'Product is sold out for this flash sale.',
        });
      }

      const [order] = await tx.insert(orders).values(validatedOrderData).returning();
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

      const { code } = classifyDomainError(err);
      if (code === 'NOT_FOUND') return { ok: false, code: 'NOT_FOUND', message: msg };
      return { ok: false, code: 'BAD_REQUEST', message: msg };
    }
    return { ok: false, code: 'INTERNAL_ERROR', message: 'Unexpected error' };
  }
};
