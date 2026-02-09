#!/usr/bin/env bash
#
# Start the scraper Express server pointing at local test data.
#
# Usage:
#   ./scripts/test-server.sh          # Start on port 2345
#   ./scripts/test-server.sh 3456     # Start on custom port
#
# This serves data from ./data/ so you can test the main-website
# against locally scraped data.
#
# Prerequisites:
#   - npm run build (to compile TypeScript)
#   - ./data/current.json exists (run test-scrape.sh first)
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

PORT="${1:-2345}"

# Ensure data dir and current.json exist
if [ ! -f ./data/current.json ]; then
  echo "[test-server] Warning: ./data/current.json not found."
  echo "  Run ./scripts/test-scrape.sh first, or the server will have no data."
  echo ""
fi

echo "═══════════════════════════════════════════════════════"
echo "  Elata Test Server"
echo "  Port:     $PORT"
echo "  Data dir: ./data"
echo "═══════════════════════════════════════════════════════"

# Build first
echo "[test-server] Building TypeScript..."
npm run build 2>&1

echo "[test-server] Starting Express server..."

ELATA_DATA_DIR=./data \
SERVER_PORT="$PORT" \
node dist/server.js
