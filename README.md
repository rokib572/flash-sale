# High-Throughput Flash Sale System (Monorepo)

A pnpm + Turborepo monorepo implementing a simplified, high-throughput flash sale for a single product. Includes:
- API server (Express + Redis + Lua) with sale status, purchase, and result endpoints
- React frontend to demo the experience
- Stress runner script for concurrency testing

## Structure
- `apps/api`: Node/TS API using Redis for atomic purchase logic
- `apps/web`: Vite + React UI for status/buy flow
- `domain/sale`: Domain logic (types, config, Lua-backed service)
- `packages/shared`: Logger/env utilities
- `scripts/stress.ts`: Local stress script driving concurrent purchase attempts

## Design Overview
- Concurrency control uses a Redis Lua script for atomicity:
  - Validates remaining stock, enforces 1-per-user, and decrements stock in a single operation
  - Reverts user add if decrement underflows to prevent oversell
- Sale window validation happens in the API using configured start/end times
- Keys:
  - `sale:stock` (string counter)
  - `sale:buyers` (set of user IDs)
- Failure model: If script errors, API returns a conservative failure to avoid oversell

### System Diagram
- Client (Web) → API (Express) → Redis (Atomic Lua)
- Optional: add async pipelines (queue, DB) as next steps
- Mermaid source: `docs/diagram.mmd`

## Prerequisites
- Node 20+, pnpm 9 (`corepack enable && corepack prepare pnpm@9.0.0 --activate`)
- Redis (local or Docker)

## Configuration
Copy `.env.example` to `.env` and adjust:
- `REDIS_URL` (default `redis://localhost:6379`)
- `SALE_START_ISO`, `SALE_END_ISO`, `SALE_TOTAL_STOCK`
- `RESET_ON_START=1` to reseed stock and clear buyers on API start (useful for tests)

## Install
```bash
pnpm install
```

## Development
- Start Redis (e.g., `docker compose up redis -d`)
- API: `pnpm --filter @flash-sale/api dev`
- Web: `pnpm --filter @flash-sale/web dev` (uses `VITE_API_URL` or defaults to `http://localhost:4000`)

## Endpoints
- `GET /sale/status` → { status, startsAt, endsAt, totalStock, remaining }
- `POST /sale/purchase` → { ok } or { ok:false, reason: 'outside_window'|'already_purchased'|'sold_out' }
- `GET /sale/result/:userId` → { purchased: boolean }

## Build, Lint, Test
```bash
pnpm build
pnpm test
```

## Stress Test
Run after API is up and sale is active:
```bash
API_URL=http://localhost:4000 USERS=5000 CONCURRENCY=200 pnpm stress
```
Expected outcome: successes ≈ min(USERS, SALE_TOTAL_STOCK), failures include `already_purchased` (if duplicate users used) and `sold_out` after stock is exhausted. No oversell.

## Notes & Next Steps
- Add persistence (DB) and an outbox/worker to record orders asynchronously
- Rate-limit `purchase` endpoint; add idempotency keys for client retries
- Add observability: metrics, tracing, and structured logs
- Expand tests with containerized Redis in CI (via services)

## Rate Limiting & Stress Mode

- Read-only (GET/HEAD) rate limits are applied globally and per-IP to protect read-heavy endpoints without throttling writes.
- Write endpoints (e.g., order submission) are not rate-limited when queue ingestion is enabled.
- For stress testing you can “soften” 429 responses on order POSTs to 202 to avoid client-side failures.

Environment toggles (API):
- `ORDERS_USE_QUEUE=true`: Enqueue orders; worker performs DB writes.
- `ORDERS_SOFTEN_429=true` (stress only): Downgrades 429 → 202 for order POSTs.
- `RL_BYPASS_PATHS=/orders/` (stress only): Explicitly bypasses limiter on orders routes.
- `RL_GLOBAL_CAPACITY, RL_GLOBAL_REFILL`: Global read-only token bucket (capacity, refill per second).
- `RL_IP_CAPACITY, RL_IP_REFILL`: IP-scoped read-only token bucket.
- `RL_USER_DISABLED=true` (stress/dev): Disables per-user rate limits by default outside production.
- `RL_DISABLED=true`: Global off switch for all rate-limiters.

Compose presets:
- `docker-compose.yml` (local/stress): Enables queue, softens 429 by default, bypasses `/orders/`, disables user RL, and sets generous global/IP read limits.
- `docker-compose.prod.yml` (prod): Enables queue, sets conservative global/IP read limits, keeps user RL disabled unless you opt-in, and does not soften 429.
