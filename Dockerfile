# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy built app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/migrations ./src/migrations

COPY drizzle.config.docker.js ./drizzle.config.js

# Expose API port
EXPOSE 3000

# Start command
CMD ["node", "dist/app.js"]