import { sql } from 'drizzle-orm';
import { timestamp, unique, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { coreSchema, primaryKey } from '../../db/base';

export const flashSales = coreSchema.table(
  'flash_sales',
  {
    id: primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('start_date').notNull(),
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [unique().on(table.name)],
);

const _selectSchema = createSelectSchema(flashSales).strict();
export type FlashSaleDbo = ReturnType<(typeof _selectSchema)['parse']>;

const _insertSchema = createInsertSchema(flashSales).omit({ id: true }).strict();
export type FlashSalePayload = ReturnType<(typeof _insertSchema)['parse']>;
export const validateUserPayload = (payload: FlashSalePayload) => _insertSchema.parse(payload);
