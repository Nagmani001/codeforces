#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

source "$PROJECT_ROOT/apps/backend/.env"
PORT="$PORT"

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
  docker compose -f "$PROJECT_ROOT/docker/docker-compose.yml" down
}

trap stop_services EXIT INT TERM

source "$PROJECT_ROOT/packages/database/.env"
DATABASE_URL="$DATABASE_URL"

echo "Starting auxilary services"
docker compose -f "$PROJECT_ROOT/docker/docker-compose.yml" up -d --wait

echo '🟡 - Waiting for database to be ready...'
$PROJECT_ROOT/apps/integration-test/src/scripts/wait-for-it.sh localhost:5432 -- echo "database has started"

echo '🟡 - Waiting for redis to be ready...'
$PROJECT_ROOT/apps/integration-test/src/scripts/wait-for-it.sh localhost:6379 -- echo "redis has started"

echo "Applying migration"
cd $PROJECT_ROOT/packages/database && pnpm dlx prisma migrate dev --name init --schema "$PROJECT_ROOT/packages/database/prisma/schema.prisma"

echo "Generate Client"
cd $PROJECT_ROOT/packages/database && pnpm dlx prisma generate --schema "$PROJECT_ROOT/packages/database/prisma/schema.prisma"

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
