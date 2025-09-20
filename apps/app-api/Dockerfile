FROM node:20-alpine AS base
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy root manifests for efficient install layer caching
COPY package.json pnpm-lock.yaml .npmrc* pnpm-workspace.yaml turbo.json tsconfig.base.json ./

# Copy only package manifests first (better cache) then install filtered workspace
COPY packages ./packages
COPY domain ./domain
COPY apps/app-api ./apps/app-api

# Install only what the API needs (including its workspace deps)
RUN pnpm install --filter @flash-sale/api... --frozen-lockfile

# Default command: run the API from sources using tsx (no JS emission)
CMD ["pnpm", "--filter", "@flash-sale/api", "start"]
