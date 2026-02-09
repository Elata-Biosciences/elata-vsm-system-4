#!/bin/bash
# Test embedding generation phase only.
# Uses OpenAI text-embedding-3-small.
# Cost: ~$0.002 per 1M tokens (~$0.001 for 10 articles)
#
# Usage:
#   ./scripts/test-embed.sh

set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Embedding Phase Test ==="
source .env 2>/dev/null || true

export SCRAPER_PHASE=embed
export SCRAPER_RESUME=true
export SCRAPER_SKIP_DISCORD=true
export SCRAPER_SKIP_ENRICH=true
export SCRAPER_SKIP_MODERATE=true
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
echo "Running embedding generation..."
node dist/index.js
