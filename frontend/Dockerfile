# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Accept build arguments
ARG VITE_TIANDITU_TOKEN
ARG VITE_API_BASE_URL

# Set environment variables for build
ENV VITE_TIANDITU_TOKEN=$VITE_TIANDITU_TOKEN
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install pnpm
RUN npm install -g pnpm

COPY package*.json ./
RUN pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm run build:prod

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
