# @flash-sale/stress-test

Stress test harness for POST `/orders/:productId/order`.

Environment/config:
- `URL` (default: http://localhost:4000)
- `PRODUCT_ID` (required)
- Concurrency: `CONNECTIONS` (default: 50)
- Duration: `DURATION` seconds (default: 30)
- Mode:
  - `STRESS_MODE=same-user` with `USER_ID` (single user hammered)
  - `STRESS_MODE=distinct` with `USERS_FILE` (userId per line)

Scripts:
- `pnpm -F @flash-sale/stress-test run:same-user` (set envs above)
- `pnpm -F @flash-sale/stress-test run:distinct` (set envs above)

Tokens: unsigned JWTs created client-side (header x-auth-token).
Ensure users exist in DB and flash sale is active.

