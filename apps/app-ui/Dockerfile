FROM node:20-alpine AS build
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy root manifests for efficient install layer caching
COPY package.json pnpm-lock.yaml .npmrc* pnpm-workspace.yaml turbo.json tsconfig.base.json ./

# Copy only the UI app sources
COPY apps/app-ui ./apps/app-ui

# Install only what the web app needs
RUN pnpm install --filter @flash-sale/web... --frozen-lockfile

# Build-time config for Vite
ARG VITE_API_URL
ARG VITE_PRODUCT_ID
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_PRODUCT_ID=${VITE_PRODUCT_ID}

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

