import { sql } from 'drizzle-orm';
import { index, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { coreSchema, foreignKey, primaryKey } from '../../db/base';
import { users } from '../user/schema';

export const orders = coreSchema.table(
  'orders',
  {
    id: primaryKey(),
    userId: foreignKey('user_id')
      .references(() => users.id)
      .notNull(),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [unique().on(table.userId), index().on(table.userId)],
);

const _selectSchema = createSelectSchema(orders).strict();
export type OrderDbo = ReturnType<(typeof _selectSchema)['parse']>;

const _insertSchema = createInsertSchema(orders).omit({ id: true }).strict();
export type OrderPayload = ReturnType<(typeof _insertSchema)['parse']>;
export const validateUserPayload = (payload: OrderPayload) => _insertSchema.parse(payload);
