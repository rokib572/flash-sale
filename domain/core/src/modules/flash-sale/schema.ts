import { sql } from 'drizzle-orm';
import { index, timestamp, unique, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { coreSchema, primaryKey } from '../../db/base';

export const flashSales = coreSchema.table(
  'flash_sales',
  {
    id: primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 512 }).notNull(),
    productId: varchar('product_id', { length: 256 }).notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    unique().on(table.name),
    index().on(table.productId),
    index().on(table.productId, table.startDate, table.endDate),
  ],
);

const _selectSchema = createSelectSchema(flashSales).strict();
export type FlashSaleDbo = ReturnType<(typeof _selectSchema)['parse']>;

const _insertSchema = createInsertSchema(flashSales).omit({ id: true }).strict();
export type FlashSalePayload = ReturnType<(typeof _insertSchema)['parse']>;
export const validateFlashSalePayload = (payload: FlashSalePayload) => _insertSchema.parse(payload);
