#!/bin/bash
set -e

DB_HOST="${DB_HOST:-mysql}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-${MYSQL_ROOT_PASSWORD:-root}}"
DB_NAME="${DB_NAME:-grader_dev}"
FORCE_INIT="${FORCE_INIT:-false}"

export MYSQL_PWD="$DB_PASSWORD"

echo "==> [db-migrator] Waiting for MySQL server at ${DB_HOST}:${DB_PORT} to be ready..."
until mysqladmin ping -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --silent; do
  sleep 2
done

echo "==> [db-migrator] MySQL server is ready!"

echo "==> [db-migrator] Ensuring database '${DB_NAME}' exists..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# Check if tables already exist in the database
TABLE_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -sN -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${DB_NAME}';")

if [ "$TABLE_COUNT" -eq 0 ] || [ "$FORCE_INIT" = "true" ]; then
  echo "==> [db-migrator] Applying init.sql to database '${DB_NAME}'..."
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" < /app/init.sql
  echo "==> [db-migrator] Database '${DB_NAME}' initialized successfully!"
else
  echo "==> [db-migrator] Database '${DB_NAME}' already contains ${TABLE_COUNT} table(s). Skipping initialization."
  echo "==> [db-migrator] (Set FORCE_INIT=true to force re-running init.sql)"
fi

echo "==> [db-migrator] Migration finished."
