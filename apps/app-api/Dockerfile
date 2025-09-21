# syntax=docker/dockerfile:1.5

FROM node:20-alpine AS base
WORKDIR /app

# Enable pnpm via corepack
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy root manifests for efficient install layer caching
COPY package.json pnpm-lock.yaml .npmrc* pnpm-workspace.yaml turbo.json tsconfig.base.json ./

# Copy sources (manifests + code) so workspace resolution is correct
COPY packages ./packages
COPY domain ./domain
COPY database ./database
COPY apps/app-api ./apps/app-api

# Install only what the API needs (including its workspace deps)
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store-v3 \
    pnpm install \
      --filter @flash-sale/api... \
      --filter @flash-sale/domain-core... \
      --filter @flash-sale/shared... \
      --filter @flash-sale/redis... \
      --filter @flash-sale/database-core... \
      --frozen-lockfile

# Drop privileges (the official Node image already provides user/group 'node')
RUN chown -R node:node /app
USER node

# Runtime configuration
ENV NODE_ENV=production
EXPOSE 4000

# Basic healthcheck hitting the /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
  CMD node -e "require('http').request({host:'127.0.0.1',port:process.env.PORT||4000,path:'/health'}).on('response',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1)).end()"

# Optional seeding controlled by SEED_ON_START env var (default off)
# SEED_ON_START=true to enable seeding on container start
CMD ["sh", "-lc", "if [ \"$SEED_ON_START\" = \"true\" ]; then pnpm tsx database/core/seed/seed-data.ts; fi; pnpm --filter @flash-sale/api start"]
