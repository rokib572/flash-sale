import { sql } from 'drizzle-orm';
import { boolean, integer, timestamp, unique, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { coreSchema, primaryKey } from '../../db/base';

export const products = coreSchema.table(
  'products',
  {
    id: primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    quantity: integer('quantity').notNull(),
    disabled: boolean('disabled').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [unique().on(table.name)],
);

const _selectSchema = createSelectSchema(products).strict();
export type ProductDbo = ReturnType<(typeof _selectSchema)['parse']>;

const _insertSchema = createInsertSchema(products)
  .omit({ id: true })
  .strict()
  .refine((product) => product.quantity >= 0, { message: 'quantity must be >= 0' })
  .refine((product) => product.name.trim().length > 0, { message: 'name required' });

export type ProductPayload = ReturnType<(typeof _insertSchema)['parse']>;
export const validateProductPayload = (payload: ProductPayload) => _insertSchema.parse(payload);
