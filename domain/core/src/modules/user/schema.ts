import { sql } from 'drizzle-orm';
import { boolean, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { z } from 'zod';
import { coreSchema, lowerCase, primaryKey } from '../../db/base';

export const users = coreSchema.table(
  'users',
  {
    id: primaryKey(),
    email: varchar('email', { length: 512 }).notNull(),
    givenName: varchar('given_name', { length: 512 }).notNull(),
    familyName: varchar('family_name', { length: 512 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    disabled: boolean('disabled').default(false).notNull(),
    deleted: boolean('deleted').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [uniqueIndex('users_unique_email_idx').on(lowerCase(table.email))],
);

const _selectSchema = createSelectSchema(users).strict();
export type UserDbo = ReturnType<(typeof _selectSchema)['parse']>;

// For integration simplicity and to avoid cross-instance Zod issues, define
// the payload schema explicitly instead of extending drizzle-zod's object.
const _insertSchema = z
  .object({
    email: z.string().max(512),
    givenName: z.string().max(512),
    familyName: z.string().max(512),
    password: z.string().min(8).max(128),
    disabled: z.boolean().default(false).optional(),
    deleted: z.boolean().default(false).optional(),
  })
  .strict();
export type UserPayload = ReturnType<(typeof _insertSchema)['parse']>;
export const validateUserPayload = (payload: UserPayload) => _insertSchema.parse(payload);
