#!/bin/bash
# Test article audio (TTS) generation phase only.
# Uses OpenAI TTS-1 ($0.015 per 1K characters).
# Cost: ~$0.10 for 3 articles
#
# Usage:
#   ./scripts/test-audio.sh

set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Audio Generation Phase Test ==="
source .env 2>/dev/null || true

export SCRAPER_PHASE=audio
export SCRAPER_RESUME=true
export SCRAPER_SKIP_DISCORD=true
export SCRAPER_SKIP_ENRICH=true
export SCRAPER_SKIP_MODERATE=true
export SCRAPER_SKIP_EMBED=true
export SCRAPER_SKIP_PODCAST=true
export SCRAPER_MAX_ARTICLES=${SCRAPER_MAX_ARTICLES:-3}
export SCRAPER_TEST_MODE=true
export SCRAPER_VERBOSE=true
export ELATA_DATA_DIR=${ELATA_DATA_DIR:-./data}
export CHECKPOINT_DIR=${CHECKPOINT_DIR:-./data/checkpoints}

echo "Max articles: $SCRAPER_MAX_ARTICLES"
echo ""

npm run build 2>&1 | tail -1
echo "Running audio generation..."
node dist/index.js
