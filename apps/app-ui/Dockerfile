FROM node:20-alpine AS build
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy root manifests for efficient install layer caching
COPY package.json pnpm-lock.yaml .npmrc* pnpm-workspace.yaml turbo.json tsconfig.base.json ./

# Copy only the UI package manifest first to maximize install cache
RUN mkdir -p apps/app-ui
COPY apps/app-ui/package.json ./apps/app-ui/package.json

# Install only what the web app needs (cached unless manifests change)
RUN pnpm install --filter @flash-sale/web... --no-frozen-lockfile

# Now copy the rest of the UI sources
# Copy UI sources and shared workspace sources used at build time
COPY apps/app-ui ./apps/app-ui
COPY packages/shared ./packages/shared
COPY packages/tsconfig ./packages/tsconfig

# Build-time config for Vite (no secrets baked)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the web app
RUN pnpm -F @flash-sale/web build

# --- Runtime image ---
FROM nginx:1.27-alpine AS runner

# Copy SPA nginx config
COPY apps/app-ui/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets
COPY --from=build /app/apps/app-ui/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
