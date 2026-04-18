FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# Create public/uploads directory structure
RUN mkdir -p public/uploads/temp public/uploads/chunks

EXPOSE 3001

CMD ["pnpm", "run", "start"]
