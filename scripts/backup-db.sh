#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Instant Grow — PocketBase Daily Backup Script
#
# Usage:
#   Run manually:    sh scripts/backup-db.sh
#   Run via cron:    0 2 * * * /path/to/scripts/backup-db.sh >> /var/log/pb-backup.log 2>&1
#
# On Fly.io (via SSH into the machine):
#   fly ssh console -a instantgrow-pocketbase
#   sh /pb/backup.sh
#
# Required env vars:
#   PB_DATA_DIR   — Path to pb_data directory (default: /pb/pb_data)
#   BACKUP_DIR    — Where to store backups       (default: /pb/backups)
#   BACKUP_KEEP   — How many backups to keep     (default: 30 days)
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ── Configuration (override via env vars) ──────────────────────────────────
PB_DATA_DIR="${PB_DATA_DIR:-/pb/pb_data}"
BACKUP_DIR="${BACKUP_DIR:-/pb/backups}"
BACKUP_KEEP="${BACKUP_KEEP:-30}"  # days to retain backups
DB_FILE="$PB_DATA_DIR/data.db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/data_${TIMESTAMP}.db"

# ── Pre-flight checks ───────────────────────────────────────────────────────
if [ ! -f "$DB_FILE" ]; then
  echo "❌ ERROR: Database file not found at $DB_FILE"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# ── Backup using SQLite's .backup command (safe for live databases) ─────────
echo "📦 Backing up PocketBase database..."
echo "   Source:      $DB_FILE"
echo "   Destination: $BACKUP_FILE"
echo "   Timestamp:   $TIMESTAMP"

# Use SQLite's online backup (safe while PocketBase is running)
sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'"

if [ $? -eq 0 ]; then
  echo "✅ Backup successful: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
else
  echo "❌ Backup FAILED"
  exit 1
fi

# ── Cleanup old backups ─────────────────────────────────────────────────────
echo "🧹 Removing backups older than $BACKUP_KEEP days..."
find "$BACKUP_DIR" -name "data_*.db" -mtime +"$BACKUP_KEEP" -delete
REMAINING=$(find "$BACKUP_DIR" -name "data_*.db" | wc -l)
echo "   Backups retained: $REMAINING"

echo "✅ Done."
