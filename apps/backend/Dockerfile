FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm --registry=https://registry.npmmirror.com

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

RUN npm install -g pnpm --registry=https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/backend ./apps/backend

RUN pnpm install --production

COPY --from=builder /app/apps/backend/dist ./dist

RUN mkdir -p public/uploads/temp public/uploads/chunks

EXPOSE 3001

CMD ["node", "dist/index.js"]
