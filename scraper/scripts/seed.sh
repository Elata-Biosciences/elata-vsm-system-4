#!/bin/bash
# seed.sh — Run a lightweight scrape to populate the site with initial data
# Usage: cd scraper && bash scripts/seed.sh
#
# This runs the scraper with limited articles and skips expensive phases
# (audio, podcast, embeddings) to produce a small current.json quickly.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRAPER_DIR="$(dirname "$SCRIPT_DIR")"

cd "$SCRAPER_DIR"

echo "=== Seed started at $(date) ==="
echo "Building scraper..."
npm run build

echo "Running scraper in seed mode (limited articles, skip expensive phases)..."
SCRAPER_TEST_MODE=true \
ARTICLES_PER_CATEGORY=5 \
SKIP_AUDIO=true \
SKIP_PODCAST=true \
SKIP_EMBED=true \
node dist/index.js

echo ""
echo "=== Seed completed at $(date) ==="

# Verify output
if [ -f data/current.json ]; then
  ARTICLE_COUNT=$(node -e "const d = require('./data/current.json'); console.log(d.articles?.length ?? Object.values(d).flat().length)")
  echo "Generated data/current.json with ~${ARTICLE_COUNT} articles"
else
  echo "WARNING: data/current.json was not created"
  exit 1
fi

echo ""
echo "To serve the data locally:"
echo "  npm run serve"
echo ""
echo "Then point main-website at http://localhost:2345"
