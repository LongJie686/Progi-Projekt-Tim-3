# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (includes tsx for prisma.config.ts)
RUN npm ci

# Copy prisma files and config
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine AS runner

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files and install all dependencies (need tsx for runtime)
COPY package*.json ./
RUN npm ci

# Copy prisma files and config for runtime
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma client in production
RUN npx prisma generate

# Copy source code (needed for tsx)
COPY src ./src

# Copy built files
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8080

# Start server with tsx
CMD ["npx", "tsx", "src/index.ts"]
