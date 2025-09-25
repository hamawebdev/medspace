# ----------------------------
# Base image
# ----------------------------
FROM node:18-alpine AS base

# Build-time args for NEXT_PUBLIC vars
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_DISABLE_CREDENTIALS

# Pass them into build env
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_DISABLE_CREDENTIALS=${NEXT_PUBLIC_DISABLE_CREDENTIALS}

# ----------------------------
# Dependencies stage
# ----------------------------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ----------------------------
# Builder stage
# ----------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ----------------------------
# Runner stage (no standalone)
# ----------------------------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package.json & lockfile
COPY package.json package-lock.json* ./

# Install only production deps
RUN npm ci --only=production

# Copy build output + public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Use Next.js built-in start
CMD ["npm", "run", "start"]
