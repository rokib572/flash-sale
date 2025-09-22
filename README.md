# High‑Throughput Flash Sale System

This monorepo contains a production‑style implementation of a simple flash‑sale platform designed for high throughput and correctness under contention. It includes a Node/Express API, React UI, Postgres domain layer (Drizzle), Redis caching and queueing infrastructure, an optional order worker, and a stress‑test harness.

The core invariants are enforced server‑side:

- Flash sale window: orders accepted only between start and end (UTC).
- Limited stock: product quantity is never oversold (oversell‑safe decrement).
- One item per user: unique order per user/flash sale.

## Overview

- API (Express + TypeScript):
  - Flash sales: create, list (active/upcoming), sale status by product.
  - Orders: submit order (direct or enqueue), check secured status, list orders.
  - Products: create, list, get.
  - Auth: simple email/password with unsigned JWT for demo.
- Domain (Drizzle + Postgres):
  - Validations, transactions, and data access for products, flash sales, and orders.
  - Stock decrement uses a guarded UPDATE to prevent oversell.
- Redis:
  - Response caching for hot GETs (flash sales list, orders list/checks).
  - Optional BullMQ queue for write ingestion (orders worker).
- UI (React + Vite):
  - Create/list flash sales and products; place orders; view orders.
  - Sale window calculations use a shared helper and UTC semantics.
- Stress test (autocannon):
  - Drives concurrent POST /orders/:productId/order to validate throughput and correctness.

## Architecture

- Client (React) → API (Express) → Postgres (Drizzle) → Redis (cache + optional queue)
- Optional Worker consumes queued orders, writes to DB, and logs outcomes.

![Architecture](docs/architecture.png)

## Repository Structure

- `apps/app-api`: Express API (TypeScript)
- `apps/app-ui`: React UI (Vite)
- `apps/order-worker`: Optional BullMQ worker for orders
- `domain/core`: Domain layer (Drizzle ORM + Postgres)
- `packages/redis`: Redis client and Express response cache
- `packages/queue`: BullMQ queue/worker helper
- `packages/shared`: Logger, error utilities, and date helpers
- `packages/stress-test`: Autocannon‑based stress harness
- `database/core`: Migrations and seeds (drizzle‑kit)

## Running the Application

Prerequisites:

- Node 20+, pnpm 9
  - `corepack enable && corepack prepare pnpm@9.0.0 --activate`
- Docker (for local Postgres/Redis and compose workflows)

Install deps:

- `pnpm install`

Run in docker (recommended)
- `pnpm start:docker`

Integration Test
- `pnpm integration:test`

Unit Test
- `pnpm test`

Stress Test
- `pnpm -F @flash-sale/stress-test run:full`
- `pnpm -F @flash-sale/stress-test run:same-user`

### Option A: Docker Compose (recommended)

- Development/stress profile:
  - `docker compose up --build`
  - API at `http://localhost:4000`, UI at `http://localhost:3000`
- Production‑like profile:
  - `docker compose -f docker-compose.prod.yml up --build`

Environment variables for compose are read from `.env.local` at repo root and service‑specific defaults.

### Option B: Local processes

1. Start infrastructure:

- Postgres: `docker compose up -d postgres`
- Redis: `docker compose up -d redis`

2. Run migrations:

- `pnpm -F @flash-sale/domain-core test:integration` (or run the drizzle push from database/core)

3. Start API and UI:

- API: `pnpm -F @flash-sale/api dev`
- UI: `pnpm -F @flash-sale/web dev` (Vite dev server)

## Application Flow (UTC)

- UI uses local datetime‑local inputs, converts to UTC ISO before POSTing creates.
- API validates sale windows using UTC timestamptz columns; status uses the same logic as the UI via a shared helper.
- Orders:
  - If `ORDERS_USE_QUEUE=true`, API enqueues (202 Accepted), worker writes to DB.
  - Otherwise, API writes directly with an oversell‑safe transaction.

## Redis Implementation Logic

- Response Caching (GET): `packages/redis/src/express/response-cache.ts`
  - Key derivation per route, configurable TTL and negative TTL.
  - Optional cache stampede protection with short lock.
- Queue Backpressure:
  - `apps/app-api/src/routes/order/validate.queue.backpressure.ts` checks BullMQ depth and returns a structured error `{ error: 'queue_busy', retryAfterSeconds }`.
  - API maps this to HTTP 503 with `Retry-After` header; UI shows a friendly toast.

## Stress Testing

- Location: `packages/stress-test`
- Modes:
  - `STRESS_MODE=same-user` (hammer a single user)
  - `STRESS_MODE=distinct` (multiple users)
- Full flow (docker + seed + run):
  - `pnpm -F @flash-sale/stress-test start -- --full`
- Manual run (API must be up):
  - `pnpm -F @flash-sale/stress-test run:same-user`
  - `pnpm -F @flash-sale/stress-test run:distinct`
- Env (examples):
  - `URL=http://localhost:4000`
  - `PRODUCT_ID=01ABC...` (if not using `--full`)
  - `CONNECTIONS=200`, `DURATION=30`
  - `STRESS_MODE=distinct`, `USERS_FILE=./users.txt`

Results:

- Prints status histograms and writes a CSV summary of non‑2xx responses.
- Queries DB after the run to assert no duplicate orders per user per sale.

## Sample .env

Top‑level `.env.local` (examples – adjust to your environment):

```
# API
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5433/flash-sale
REDIS_URL=redis://localhost:6379

# Auth
AUTH_TOKEN_TTL_SECONDS=3600

# Orders
ORDERS_USE_QUEUE=true
ORDERS_QUEUE_MAX_QUEUED=100000
ORDERS_QUEUE_RETRY_AFTER_SECONDS=2
ORDERS_WORKER_CONCURRENCY=50

# Rate Limits (read-only)
RL_DISABLED=false
RL_GLOBAL_CAPACITY=5000
RL_GLOBAL_REFILL=2000
RL_IP_CAPACITY=200
RL_IP_REFILL=50

# UI
VITE_API_URL=http://localhost:4000

# Node/Container TZ (keep UTC recommended)
TZ=UTC
```

## Commands

Build all:

- `pnpm build`

API (Express):

- Dev: `pnpm -F @flash-sale/api dev`
- Build: `pnpm -F @flash-sale/api build`
- Test routes (unit‑style): `pnpm -F @flash-sale/api test`

UI (React):

- Dev: `pnpm -F @flash-sale/web dev`
- Build: `pnpm -F @flash-sale/web build`
- Test pages (SSR unit checks): `pnpm -F @flash-sale/web test`

Domain (integration tests with containers):

- `pnpm -F @flash-sale/domain-core test:integration`

Stress test:

- Full: `pnpm -F @flash-sale/stress-test start -- --full`
- Same user: `pnpm -F @flash-sale/stress-test run:same-user`
- Distinct users: `pnpm -F @flash-sale/stress-test run:distinct`

## Implementation Highlights

- UTC Everywhere:
  - Flash sale start/end are timestamptz in DB.
  - UI converts local inputs to UTC ISO on submit.
  - Shared `getSaleStatus({ start, end })` helper used across UI/API/domain.

- Oversell‑Safe Stock Decrement:
  - Single guarded UPDATE in a transaction:
    - `UPDATE products SET quantity = quantity - 1 WHERE id = $id AND quantity > 0 RETURNING *`.
  - Unique constraint on `(userId, flashSaleId)` enforces one item per user.

- Backpressure & Resilience:
  - Queue depth guard before enqueuing orders, returning 503 with `Retry-After` when busy.
  - Optional softening of 429 to 202 for stress scenarios.

## Notes

- Default container timezone is UTC; DB times are persisted as UTC (timestamptz). Avoid comparing local strings across services.
- For real deployments, add observability (metrics/tracing), idempotency keys for clients, and stronger authentication.

## License

Proprietary / for assessment use only (no license specified).
