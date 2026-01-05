# Step 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build the Next.js application
RUN npm run build

# Step 2: Run the application in production
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy necessary files from builder stage
COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Optionally copy any env/config files you need
# COPY --from=builder /app/.env .env

EXPOSE 3000

# Start Next.js in production mode
CMD ["npx", "next", "start"]
