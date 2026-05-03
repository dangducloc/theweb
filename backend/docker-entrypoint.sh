#!/bin/sh
set -e

echo "═══════════════════════════════════════"
echo "  Inventory Backend - Startup"
echo "═══════════════════════════════════════"

# ── 1. Validate DATABASE_URL ──────────────────────────────
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

# ── 2. Parse DATABASE_URL ─────────────────────────────────
# Support cả 2 format:
#   postgresql://user:pass@host:port/dbname  (có port)
#   postgresql://user:pass@host/dbname       (không có port → default 5432)

_url=$(echo "$DATABASE_URL" | sed 's|^postgresql://||;s|^postgres://||')

DB_USER=$(echo "$_url" | cut -d':' -f1)
DB_PASS=$(echo "$_url" | cut -d':' -f2 | cut -d'@' -f1)
DB_HOST=$(echo "$_url" | cut -d'@' -f2 | cut -d':' -f1 | cut -d'/' -f1)
DB_NAME=$(echo "$_url" | rev | cut -d'/' -f1 | rev)

# Port: nếu URL không có :port thì default 5432
_hostpart=$(echo "$_url" | cut -d'@' -f2)
if echo "$_hostpart" | grep -q ':'; then
  DB_PORT=$(echo "$_hostpart" | cut -d':' -f2 | cut -d'/' -f1)
else
  DB_PORT=5432
fi

echo "  Host : $DB_HOST"
echo "  Port : $DB_PORT"
echo "  User : $DB_USER"
echo "  DB   : $DB_NAME"

# ── 3. Wait for DB ────────────────────────────────────────
echo "Waiting for database..."

MAX_RETRIES=30
RETRY=0

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; do
  RETRY=$((RETRY + 1))
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "ERROR: Database not ready after ${MAX_RETRIES} retries. Exiting."
    exit 1
  fi
  echo "  Retry ${RETRY}/${MAX_RETRIES} - waiting 2s..."
  sleep 2
done

echo "Database is ready"

# ── 4. Run migrations ─────────────────────────────────────
echo "Running migrations..."
npx prisma migrate deploy
echo "Migrations done"

# ── 5. Seed ONLY WHEN DB is empty ─────────────────────────
echo "Checking if seed needed..."

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

# ── 6. Start server ───────────────────────────────────────
echo "Starting server on port ${PORT:-3000}..."
echo "═══════════════════════════════════════"
exec npm start