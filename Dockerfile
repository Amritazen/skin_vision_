# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy full source and build
COPY . .
RUN npm run build

# Stage 2: Create the production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Render assigns PORT dynamically (default 10000); the app reads process.env.PORT
ENV PORT=10000

# Copy production dependencies and build artifacts
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 10000

CMD ["node", "dist/index.cjs"]
