FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/backend ./apps/backend

RUN if [ -f apps/backend/.env.production ]; then cp apps/backend/.env.production .env; fi

RUN pnpm run build --filter=@ianportfolio/backend

# --- Production stage ---
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/backend ./apps/backend
RUN pnpm install --production --no-frozen-lockfile

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/public ./public

RUN mkdir -p public/uploads/temp public/uploads/chunks

EXPOSE 3001

CMD ["node", "dist/index.js"]
