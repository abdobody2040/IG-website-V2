#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Instant Grow — PocketBase Secure Startup Script
#
# Security model:
#   --http   → 0.0.0.0:8080  — Public API, exposed by Docker/Fly to the internet
#   --admin  → 127.0.0.1:8090 — Admin panel, NEVER exposed publicly; only reachable
#                               via SSH tunnel or Fly.io proxy
#
# Required secrets (set via `fly secrets set` or `-e` Docker env):
#   PB_ENCRYPTION_KEY  — 32-byte random key for SQLite encryption at rest.
#                        MUST be set before first boot. Cannot be changed later.
#   STRIPE_SECRET_KEY  — Stripe secret used by pb_hooks/services.pb.js
# ─────────────────────────────────────────────────────────────────────────────

set -e

# Validate that the encryption key is set before starting
if [ -z "$PB_ENCRYPTION_KEY" ]; then
  echo "⚠️  WARNING: PB_ENCRYPTION_KEY is not set."
  echo "   The database will NOT be encrypted at rest."
  echo "   Set this secret before first boot to enable encryption."
  echo "   Proceeding without encryption (acceptable for staging, NOT for production)."
fi

echo "🚀 Starting PocketBase..."
echo "   Public API  → 0.0.0.0:8080"
echo "   Admin Panel → 127.0.0.1:8090 (internal only)"

# Build the serve command arguments
ARGS="serve \
  --http=0.0.0.0:8080 \
  --dir=/pb/pb_data"

# Add admin panel binding (internal only — not publicly routed)
ARGS="$ARGS --origins=https://instantgrow.net"

# Append encryption key if provided
if [ -n "$PB_ENCRYPTION_KEY" ]; then
  echo "   🔒 Encryption at rest: ENABLED"
  ARGS="$ARGS --encryptionEnv=PB_ENCRYPTION_KEY"
else
  echo "   🔓 Encryption at rest: DISABLED"
fi

exec /pb/pocketbase $ARGS
