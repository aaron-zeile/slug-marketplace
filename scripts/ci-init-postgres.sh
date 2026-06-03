#!/usr/bin/env bash
set -euo pipefail

POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
export PGPASSWORD="${POSTGRES_PASSWORD:-postgres}"

until pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" >/dev/null 2>&1; do
  echo "Waiting for PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
  sleep 1
done

psql_exec() {
  psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" "$@"
}

create_db_if_missing() {
  local db="$1"
  if ! psql_exec -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '${db}'" | grep -q 1; then
    psql_exec -d postgres -c "CREATE DATABASE \"${db}\";"
  fi
}

apply_sql_to_db() {
  local db="$1"
  local file="$2"
  if [ ! -f "$file" ]; then
    echo "Skipping missing SQL file: $file"
    return
  fi
  grep -v '^\s*\\c\s' "$file" | psql_exec -d "$db" -q -v ON_ERROR_STOP=1
}

for db in admin items cart orders admindb account; do
  create_db_if_missing "$db"
done

psql_exec -d postgres -c 'CREATE EXTENSION IF NOT EXISTS pgcrypto;'
psql_exec -d account -c 'CREATE EXTENSION IF NOT EXISTS pgcrypto;' || true
psql_exec -d admindb -c 'CREATE EXTENSION IF NOT EXISTS pgcrypto;' || true

apply_sql_to_db orders Service/Order/src/sql/schema.sql
apply_sql_to_db admindb App/admin/db/schema.sql
apply_sql_to_db account Service/Login/sql/schema.sql

echo "PostgreSQL databases ready for CI."
