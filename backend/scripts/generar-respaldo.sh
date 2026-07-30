#!/usr/bin/env bash
set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-manos_oaxaca_final}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/../backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTPUT="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

if ! command -v mysqldump >/dev/null 2>&1; then
  echo "Error: mysqldump no está instalado o no está en el PATH." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

if [[ -n "$DB_PASSWORD" ]]; then
  export MYSQL_PWD="$DB_PASSWORD"
fi

if mysqldump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --no-tablespaces \
  --default-character-set=utf8mb4 \
  "$DB_NAME" > "$OUTPUT"; then
  unset MYSQL_PWD 2>/dev/null || true
  echo "Respaldo generado: $OUTPUT"
else
  unset MYSQL_PWD 2>/dev/null || true
  rm -f "$OUTPUT"
  echo "Error: no se pudo generar el respaldo." >&2
  exit 1
fi
