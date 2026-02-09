#!/bin/bash
# Test content enrichment phase only.
# Loads GPT checkpoint and runs enrichment (content scraping + AI summaries).
# Cost: ~$0.05 OpenAI for 5 articles
#
# Usage:
#   ./scripts/test-enrich.sh
#   SCRAPER_MAX_ARTICLES=10 ./scripts/test-enrich.sh

set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Enrichment Phase Test ==="
source .env 2>/dev/null || true

export SCRAPER_PHASE=enrich
export SCRAPER_RESUME=true
export SCRAPER_DRY_RUN=${SCRAPER_DRY_RUN:-false}
export SCRAPER_SKIP_DISCORD=true
export SCRAPER_SKIP_MODERATE=true
export SCRAPER_SKIP_EMBED=true
export SCRAPER_SKIP_AUDIO=true
export SCRAPER_SKIP_PODCAST=true
export SCRAPER_MAX_ARTICLES=${SCRAPER_MAX_ARTICLES:-5}
export SCRAPER_TEST_MODE=true
export SCRAPER_VERBOSE=true
export ELATA_DATA_DIR=${ELATA_DATA_DIR:-./data}
export CHECKPOINT_DIR=${CHECKPOINT_DIR:-./data/checkpoints}

echo "Max articles: $SCRAPER_MAX_ARTICLES"
echo "Data dir: $ELATA_DATA_DIR"
echo "Checkpoint dir: $CHECKPOINT_DIR"
echo ""

npm run build 2>&1 | tail -1
echo "Running enrichment..."
node dist/index.js
