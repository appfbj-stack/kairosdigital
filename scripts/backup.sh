#!/usr/bin/env bash
# Backup automático do Postgres do Hermes OS
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/hermes}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

CONTAINER="${POSTGRES_CONTAINER:-hermes-postgres}"
DB="${POSTGRES_DB:-hermes_os}"
USER="${POSTGRES_USER:-hermes}"

echo "📦 Backup $DB → $BACKUP_DIR/$TIMESTAMP.sql.gz"
docker exec -t "$CONTAINER" pg_dump -U "$USER" "$DB" | gzip > "$BACKUP_DIR/hermes-$TIMESTAMP.sql.gz"

# Backup também do DB evolution
docker exec -t "$CONTAINER" pg_dump -U "$USER" evolution | gzip > "$BACKUP_DIR/evolution-$TIMESTAMP.sql.gz"

# Limpa antigos
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup concluído"
