FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Create public/uploads directory structure
RUN mkdir -p public/uploads/temp public/uploads/chunks

EXPOSE 3001

CMD ["npm", "run", "start"]
