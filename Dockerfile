# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Create the production image
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

# Copy production dependencies and build artifacts
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
# Ensure the uploads directory exists in the container
RUN mkdir -p uploads

EXPOSE 10000

CMD ["node", "dist/index.cjs"]
