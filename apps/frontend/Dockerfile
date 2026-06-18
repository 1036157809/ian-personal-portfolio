# Build stage
FROM node:20-alpine as builder

WORKDIR /app

RUN npm install -g pnpm

# Copy full monorepo for build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/frontend ./apps/frontend

RUN pnpm install
RUN pnpm run build --filter=@ianportfolio/frontend

# Production stage
FROM nginx:alpine

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
