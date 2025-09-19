import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: [
    '../../domain/core/src/db/base.ts',
    '../../domain/core/src/modules/**/schema.ts',
    '../../domain/core/src/modules/**/schema/*.ts',
    '../../domain/core/src/modules/data-migration/*.ts',
  ],
  dialect: 'postgresql',
  out: './local/migrations',
  // Provide credentials only when URL is defined to satisfy types
  dbCredentials: process.env.DATABASE_CONNECTION_URL
    ? { url: process.env.DATABASE_CONNECTION_URL }
    : undefined,
  schemaFilter: [
    'core_data',
    'audit_data',
    'auth_data',
    'meta_data',
    'subscription_data',
    'migration_data',
  ],
  verbose: true,
  strict: true,
});
