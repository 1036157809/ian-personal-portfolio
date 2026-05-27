# Build stage
FROM node:20-alpine as builder

WORKDIR /app/frontend

# Accept build arguments
ARG VITE_TIANDITU_TOKEN
ARG VITE_API_BASE_URL

# Set environment variables for build
ENV VITE_TIANDITU_TOKEN=$VITE_TIANDITU_TOKEN
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install pnpm
RUN npm install -g pnpm

# Copy frontend dependency files
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

# Copy frontend source
COPY frontend/ ./
RUN pnpm run build:prod

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
