FROM node:20-alpine AS base
WORKDIR /app

COPY package.json pnpm-lock.yaml* .npmrc* ./
COPY ../../pnpm-workspace.yaml ../../package.json ../../turbo.json ../../tsconfig.base.json /tmp/root/

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate || true
RUN pnpm install --filter @flash-sale/api... --frozen-lockfile || true

COPY . .

CMD ["node", "dist/index.js"]

