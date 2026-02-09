#!/bin/bash
# Test content moderation phase only.
# Uses OpenAI's free omni-moderation API.
# Cost: $0 (moderation API is free)
#
# Usage:
#   ./scripts/test-moderate.sh

set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Moderation Phase Test ==="
source .env 2>/dev/null || true

export SCRAPER_PHASE=moderate
export SCRAPER_RESUME=true
export SCRAPER_SKIP_DISCORD=true
export SCRAPER_SKIP_ENRICH=true
export SCRAPER_SKIP_EMBED=true
export SCRAPER_SKIP_AUDIO=true
export SCRAPER_SKIP_PODCAST=true
export SCRAPER_MAX_ARTICLES=${SCRAPER_MAX_ARTICLES:-10}
export SCRAPER_TEST_MODE=true
export SCRAPER_VERBOSE=true
export ELATA_DATA_DIR=${ELATA_DATA_DIR:-./data}
export CHECKPOINT_DIR=${CHECKPOINT_DIR:-./data/checkpoints}

echo "Max articles: $SCRAPER_MAX_ARTICLES"
echo ""

npm run build 2>&1 | tail -1
echo "Running moderation..."
node dist/index.js
