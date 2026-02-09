#!/usr/bin/env bash
#
# Quick test scraper run — 10 articles max, 3 sources, 2 queries.
# Uses local ./data directory for output.
#
# Usage:
#   ./scripts/test-scrape.sh              # Full pipeline with 10 articles
#   ./scripts/test-scrape.sh --dry-run    # Scrape + GPT but skip Discord
#   ./scripts/test-scrape.sh --phase gpt  # Only run GPT phase (resume from checkpoint)
#
# Prerequisites:
#   - .env file with NEWS_API_KEY and OPENAI_KEY
#   - npm run build (to compile TypeScript)
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Defaults (can override with flags)
PHASE="all"
DRY_RUN="true"
MAX_ARTICLES=10
SOURCES_LIMIT=3
QUERIES_LIMIT=2

# Parse flags
while [[ $# -gt 0 ]]; do
  case $1 in
    --phase)
      PHASE="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    --live)
      DRY_RUN="false"
      shift
      ;;
    --articles)
      MAX_ARTICLES="$2"
      shift 2
      ;;
    *)
      echo "Unknown flag: $1"
      echo "Usage: $0 [--phase scrape|gpt|enrich|embed|all] [--dry-run] [--live] [--articles N]"
      exit 1
      ;;
  esac
done

# Ensure data dir exists
mkdir -p ./data

echo "═══════════════════════════════════════════════════════"
echo "  Elata Test Scraper"
echo "  Phase:       $PHASE"
echo "  Dry run:     $DRY_RUN"
echo "  Max articles: $MAX_ARTICLES"
echo "  Sources:     $SOURCES_LIMIT"
echo "  Queries:     $QUERIES_LIMIT"
echo "  Data dir:    ./data"
echo "═══════════════════════════════════════════════════════"

# Build first
echo "[test-scrape] Building TypeScript..."
npm run build 2>&1

echo "[test-scrape] Starting pipeline..."

SCRAPER_TEST_MODE=true \
SCRAPER_VERBOSE=true \
SCRAPER_DRY_RUN="$DRY_RUN" \
SCRAPER_SKIP_DISCORD="$DRY_RUN" \
SCRAPER_MAX_ARTICLES="$MAX_ARTICLES" \
SCRAPER_TEST_SOURCES_LIMIT="$SOURCES_LIMIT" \
SCRAPER_TEST_QUERIES_LIMIT="$QUERIES_LIMIT" \
SCRAPER_PHASE="$PHASE" \
SCRAPER_RESUME=true \
ELATA_DATA_DIR=./data \
CHECKPOINT_DIR=./data/checkpoints \
node dist/index.js

echo ""
echo "[test-scrape] Done. Check ./data/ for output files."
ls -la ./data/*.json 2>/dev/null || echo "  (no output files yet)"
