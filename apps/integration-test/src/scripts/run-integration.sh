#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

source "$PROJECT_ROOT/apps/backend/.env"
PORT="$PORT"

function is_port_in_use() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP -sTCP:LISTEN -P -n | grep -q ":${port} "
    return $?
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltn | awk '{print $4}' | grep -q ":${port}$"
    return $?
  fi

  return 1
}

function find_free_port() {
  local base="$1"
  local port="$base"
  while is_port_in_use "$port"; do
    port=$((port + 1))
  done
  echo "$port"
}

function stop_services() {
  if [[ -n "${WORKER_PID:-}" ]]; then
    echo "🔴 - Stopping worker..."
    kill "$WORKER_PID" || true
  fi

  if [[ -n "${BACKEND_PID:-}" ]]; then
    echo "🔴 - Stopping backend..."
    kill "$BACKEND_PID" || true
  fi

  echo "🔴 - Taking down auxiliary services..."
  if [[ -n "${COMPOSE_OVERRIDE_FILE:-}" && -f "$COMPOSE_OVERRIDE_FILE" ]]; then
    docker compose -f "$PROJECT_ROOT/docker/docker-compose.yml" -f "$COMPOSE_OVERRIDE_FILE" down
    rm -f "$COMPOSE_OVERRIDE_FILE"
  else
    docker compose -f "$PROJECT_ROOT/docker/docker-compose.yml" down
  fi
}

trap stop_services EXIT INT TERM

source "$PROJECT_ROOT/packages/database/.env"
DATABASE_URL="$DATABASE_URL"

DB_PORT="$(find_free_port 5432)"
REDIS_PORT="$(find_free_port 6379)"

COMPOSE_OVERRIDE_FILE="$(mktemp)"
cat >"$COMPOSE_OVERRIDE_FILE" <<EOF
services:
  database:
    ports:
      - "${DB_PORT}:5432"
  redis:
    ports:
      - "${REDIS_PORT}:6379"
EOF

export DATABASE_URL="postgresql://postgres:nagmani@localhost:${DB_PORT}/postgres"
export REDIS_URL="redis://localhost:${REDIS_PORT}"

echo "Starting auxiliary services (db:${DB_PORT}, redis:${REDIS_PORT})"
docker compose -f "$PROJECT_ROOT/docker/docker-compose.yml" -f "$COMPOSE_OVERRIDE_FILE" up -d --wait

echo '🟡 - Waiting for database to be ready...'
$PROJECT_ROOT/apps/integration-test/src/scripts/wait-for-it.sh "localhost:${DB_PORT}" -- echo "database has started"

echo '🟡 - Waiting for redis to be ready...'
$PROJECT_ROOT/apps/integration-test/src/scripts/wait-for-it.sh "localhost:${REDIS_PORT}" -- echo "redis has started"

echo "Applying migration"
cd $PROJECT_ROOT/packages/database && npx prisma@6.3.0 migrate dev --name init --schema "$PROJECT_ROOT/packages/database/prisma/schema.prisma"

echo "Generate Client"
cd $PROJECT_ROOT/packages/database && npx prisma@6.3.0 generate --schema "$PROJECT_ROOT/packages/database/prisma/schema.prisma"

echo '🟡 - Starting backend server...'
cd $PROJECT_ROOT/apps/backend && pnpm run dev &
BACKEND_PID=$!

echo "backend pid $BACKEND_PID"

echo '🟡 - Starting worker...'
cd $PROJECT_ROOT/apps/worker && pnpm run dev &
WORKER_PID=$!

echo "worker pid $WORKER_PID"

echo '🟡 - Waiting for backend to be ready...'
$PROJECT_ROOT/apps/integration-test/src/scripts/wait-for-it.sh localhost:3001 -- echo "backend has started"

echo "Run integration test"
cd $PROJECT_ROOT/apps/integration-test && vitest --run
