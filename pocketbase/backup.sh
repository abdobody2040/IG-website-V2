#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Instant Grow — PocketBase Daily Backup Script (Container Version)
#
# Usage:
#   This script is bundled into the Docker/Fly.io image at /pb/backup.sh
#   Run manually:    fly ssh console -a instantgrow-pocketbase -C "/pb/backup.sh"
#   Run via cron:    Add to host cron or run via a sidecar/cron service
#
# Retains 30 days of backups in /pb/backups.
# ─────────────────────────────────────────────────────────────────────────────

set -e

PB_DATA_DIR="${PB_DATA_DIR:-/pb/pb_data}"
BACKUP_DIR="${BACKUP_DIR:-/pb/backups}"
BACKUP_KEEP="${BACKUP_KEEP:-30}"  # days to retain backups
DB_FILE="$PB_DATA_DIR/data.db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/data_${TIMESTAMP}.db"

if [ ! -f "$DB_FILE" ]; then
  echo "❌ ERROR: Database file not found at $DB_FILE"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "📦 Backing up PocketBase database..."
echo "   Source:      $DB_FILE"
echo "   Destination: $BACKUP_FILE"

# Use SQLite's online backup (safe while PocketBase is running)
sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'"

if [ $? -eq 0 ]; then
  echo "✅ Backup successful: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
else
  echo "❌ Backup FAILED"
  exit 1
fi

echo "🧹 Removing backups older than $BACKUP_KEEP days..."
find "$BACKUP_DIR" -name "data_*.db" -mtime +"$BACKUP_KEEP" -delete
REMAINING=$(find "$BACKUP_DIR" -name "data_*.db" | wc -l)
echo "   Backups retained: $REMAINING"

echo "✅ Done."
