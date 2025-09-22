# syntax=docker/dockerfile:1.5

FROM node:20-alpine AS builder
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
ENV NODE_ENV=production
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store-v3 \
    pnpm install \
      --filter @flash-sale/api... \
      --filter @flash-sale/domain-core... \
      --filter @flash-sale/shared... \
      --filter @flash-sale/redis... \
      --no-frozen-lockfile --prod --no-optional

# Bundle the API to a single JS file using pnpm dlx (no devDep needed)
RUN pnpm dlx esbuild apps/app-api/src/index.ts \
    --bundle --platform=node --format=cjs --target=node20 \
    --outfile=apps/app-api/dist/server.cjs

# --- Runtime image ---
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only the bundled artifact
COPY --from=builder /app/apps/app-api/dist ./dist

# Drop privileges (the official Node image already provides user/group 'node')
RUN chown -R node:node /app
USER node

# Runtime configuration
ENV NODE_ENV=production
EXPOSE 4000

# Basic healthcheck hitting the /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
  CMD node -e "require('http').request({host:'127.0.0.1',port:process.env.PORT||4000,path:'/health'}).on('response',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1)).end()"

# Start compiled app (no tsx)
CMD ["node", "dist/server.cjs"]
