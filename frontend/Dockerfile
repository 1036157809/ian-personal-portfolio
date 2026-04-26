# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package*.json ./
RUN pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
