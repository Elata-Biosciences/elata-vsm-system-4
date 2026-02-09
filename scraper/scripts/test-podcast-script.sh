#!/bin/bash
# Test podcast SCRIPT generation only (GPT, no ElevenLabs).
# Cost: ~$0.01 OpenAI
#
# Usage:
#   ./scripts/test-podcast-script.sh
#   ./scripts/test-podcast-script.sh --articles-file data/checkpoint/2025-01-01_gpt.json

set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Podcast Script Test ==="
echo "Loading environment..."
source .env 2>/dev/null || true

# Build first
echo "Building..."
npm run build 2>&1 | tail -1

# Run script-only mode
echo ""
echo "Generating script..."
npx tsx scripts/run-podcast.ts --script-only "$@"

echo ""
echo "Output saved to data/podcast/script-test.json"
echo "Review the script, then run test-podcast.sh for audio generation."
