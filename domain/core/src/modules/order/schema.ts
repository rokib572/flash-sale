import { sql } from 'drizzle-orm';
import { index, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { coreSchema, foreignKey, primaryKey } from '../../db/base';
import { flashSales } from '../flash-sale/schema';
import { products } from '../product';
import { users } from '../user/schema';

export const orders = coreSchema.table(
  'orders',
  {
    id: primaryKey(),
    userId: foreignKey('user_id')
      .references(() => users.id)
      .notNull(),
    flashSaleId: foreignKey('flash_sale_id').references(() => flashSales.id),
    productId: foreignKey('product_id')
      .references(() => products.id)
      .notNull(),
    quantity: integer('quantity').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    uniqueIndex().on(table.userId, table.flashSaleId),
    index().on(table.userId),
    index().on(table.flashSaleId),
  ],
);

const _selectSchema = createSelectSchema(orders).strict();
export type OrderDbo = ReturnType<(typeof _selectSchema)['parse']>;

const _insertSchema = createInsertSchema(orders).omit({ id: true }).strict();
export type OrderPayload = ReturnType<(typeof _insertSchema)['parse']>;
export const validateOrderPayload = (payload: OrderPayload) => _insertSchema.parse(payload);
