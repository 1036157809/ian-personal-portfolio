FROM node:20-alpine AS builder

WORKDIR /app

ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/backend ./apps/backend

RUN if [ -f apps/backend/.env.production ]; then cp apps/backend/.env.production .env; fi

RUN pnpm install
RUN pnpm run build --filter=@ianportfolio/shared
RUN pnpm run build --filter=@ianportfolio/backend

# --- Production stage ---
FROM node:20-alpine AS production

WORKDIR /app

ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/backend ./apps/backend

RUN pnpm install --prod --frozen-lockfile --node-linker=hoisted

# Build-time self-check: ensure critical modules resolve correctly
RUN node -e "require('node-cron'); require('koa'); require('@koa/router'); require('mysql2'); console.log('deps OK')"

# Copy built artifacts from builder
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Wire up workspace symlink so backend code can resolve @ianportfolio/shared
RUN mkdir -p node_modules/@ianportfolio/shared \
    && ln -s ../../packages/shared node_modules/@ianportfolio/shared

# Override root package.json so Node treats *.js as CommonJS (backend tsconfig emits CJS)
RUN printf '{"name":"@ianportfolio/backend","type":"commonjs","main":"dist/index.js"}' > package.json

RUN mkdir -p public/uploads/temp public/uploads/chunks

EXPOSE 3001

CMD ["node", "dist/index.js"]
