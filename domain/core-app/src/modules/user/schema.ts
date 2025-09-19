import { sql } from 'drizzle-orm';
import { boolean, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { coreSchema, lowerCase, primaryKey } from '../../db/base';

export const users = coreSchema.table(
  'users',
  {
    id: primaryKey(),
    email: varchar('username', { length: 512 }).notNull(),
    givenName: varchar('given_name', { length: 512 }).notNull(),
    familyName: varchar('family_name', { length: 512 }).notNull(),
    disabled: boolean('disabled').default(false).notNull(),
    deleted: boolean('deleted').default(false).notNull(),
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [uniqueIndex('users_unique_email_idx').on(lowerCase(table.email))],
);

const _selectSchema = createSelectSchema(users).strict();
export type UserDbo = ReturnType<(typeof _selectSchema)['parse']>;

const _insertSchema = createInsertSchema(users).omit({ id: true }).strict();
export type UserPayload = ReturnType<(typeof _insertSchema)['parse']>;
export const validateUserPayload = (payload: UserPayload) => _insertSchema.parse(payload);
