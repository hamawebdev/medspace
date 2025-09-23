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
RUN npm ci --only=production

# ----------------------------
# Builder stage
# ----------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm ci
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ----------------------------
# Runner stage
# ----------------------------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Correct entrypoint for Next.js standalone build
CMD ["node", "server.js"]
