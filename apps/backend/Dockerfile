FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

COPY . .

RUN if [ -f .env.production ]; then cp .env.production .env; fi

RUN pnpm run build

# --- Production stage ---
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --production --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

RUN mkdir -p public/uploads/temp public/uploads/chunks

EXPOSE 3001

CMD ["node", "dist/index.js"]
