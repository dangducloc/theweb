#!/bin/sh
set -e

echo "═══════════════════════════════════════"
echo "  Inventory Backend - Startup"
echo "═══════════════════════════════════════"

# ── 1. Wait for DB ────────────────────────────────────────
# Use pg_isready instead of prisma db execute - faster and more reliable
# Requires postgresql-client to be installed in the Dockerfile
echo "Waiting for database..."

MAX_RETRIES=30
RETRY=0

until pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USER:-linh}" > /dev/null 2>&1; do
  RETRY=$((RETRY + 1))
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "Database not ready after ${MAX_RETRIES} retries. Exiting."
    exit 1
  fi
  echo "  Retry ${RETRY}/${MAX_RETRIES} - waiting 2s..."
  sleep 2
done

echo "Database is ready"

# ── 2. Run migrations ─────────────────────────────────────
echo "Running migrations..."
npx prisma migrate deploy
echo "Migrations done"

# ── 3. Seed ONLY WHEN DB is empty ──────────────────────────
# Root issue: seed always ran → duplicate errors when restarting container
# Fix: check COUNT before seeding
echo "Checking if seed needed..."

# Get current user count from DB
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count()
  .then(n => { process.stdout.write(String(n)); return prisma.\$disconnect(); })
  .catch(() => { process.stdout.write('0'); return prisma.\$disconnect(); });
" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
  echo "No data found - running seed..."
  node prisma/seed.js
  echo "Seed completed"
else
  echo "Data exists (${USER_COUNT} users) - skipping seed"
fi

# ── 4. Start server ───────────────────────────────────────
echo "Starting server on port ${PORT:-3000}..."
echo "═══════════════════════════════════════"

# Use exec instead of npm start so the process receives SIGTERM directly
exec npm start