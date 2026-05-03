# ── Stage 1: Builder ──────────────────────────────────────
FROM node:20-alpine3.19 AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY . .

# ── Stage 2: Production ───────────────────────────────────
FROM node:20-alpine3.19 AS production

WORKDIR /app

# openssl: required by Prisma
# wget: healthcheck
# postgresql-client: provides pg_isready used in the entrypoint
RUN apk add --no-cache openssl wget postgresql-client

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules        ./node_modules
COPY --from=builder /app/prisma              ./prisma
COPY --from=builder /app/src                 ./src
COPY --from=builder /app/package.json        ./
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD wget -qO- http://localhost:3000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
