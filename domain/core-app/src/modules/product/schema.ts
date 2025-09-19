import { sql } from 'drizzle-orm';
import { boolean, integer, timestamp, unique, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { coreSchema, primaryKey } from '../../db/base';

export const products = coreSchema.table(
  'products',
  {
    id: primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    quantity: integer('quantity').notNull().default(0),
    disabled: boolean('disabled').notNull().default(false),
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [unique().on(table.name)],
);

const _selectSchema = createSelectSchema(products).strict();
export type ProductDbo = ReturnType<(typeof _selectSchema)['parse']>;

const _insertSchema = createInsertSchema(products).omit({ id: true }).strict();
export type ProductPayload = ReturnType<(typeof _insertSchema)['parse']>;
export const validateUserPayload = (payload: ProductPayload) => _insertSchema.parse(payload);
