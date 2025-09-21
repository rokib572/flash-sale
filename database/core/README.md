Database Core (Drizzle-Kit)

Scripts
- migrate:generate: Generate SQL migrations from TypeScript schemas using `database/core/local/drizzle.config.ts`.
- migrate:push: Apply the current schema to the database.
- migrate:studio: Open Drizzle Studio.

Env
- DATABASE_CONNECTION_URL: Postgres connection string for Drizzle-Kit (e.g. `postgres://user:pass@localhost:5432/flash-sale`).

Examples
pnpm --filter @flash-sale/database-core migrate:generate
pnpm --filter @flash-sale/database-core migrate:push
