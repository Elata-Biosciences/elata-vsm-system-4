#!/bin/bash
# Test full podcast generation with ElevenLabs TTS.
# Cost: ~$0.50 for 3 segments (default), ~$2 for full episode
#
# Usage:
#   ./scripts/test-podcast.sh                     # 3 segments (default)
#   ./scripts/test-podcast.sh --max-segments 5    # 5 segments
#   ./scripts/test-podcast.sh --full              # full episode (all segments)

set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Podcast Generation Test ==="
echo "Loading environment..."
source .env 2>/dev/null || true

# Check required API keys
if [ -z "${OPENAI_KEY:-}" ]; then
  echo "ERROR: OPENAI_KEY is required. Set it in .env"
  exit 1
fi

if [ -z "${ELEVENLABS_API_KEY:-}" ]; then
  echo "ERROR: ELEVENLABS_API_KEY is required for audio generation."
  echo "Get one at https://elevenlabs.io"
  echo ""
  echo "To test script generation only (no audio), run:"
  echo "  ./scripts/test-podcast-script.sh"
  exit 1
fi

# Check ffmpeg
if command -v ffmpeg &>/dev/null; then
  echo "ffmpeg: found (segments will be concatenated)"
else
  echo "ffmpeg: not found (individual segments will be saved)"
  echo "  Install with: brew install ffmpeg"
fi

# Build first
echo ""
echo "Building..."
npm run build 2>&1 | tail -1

# Default to 3 segments if no args
ARGS="${@:---max-segments 3}"

# Run podcast generation
echo ""
echo "Generating podcast..."
npx tsx scripts/run-podcast.ts $ARGS

echo ""
echo "Audio files are in data/podcast/"
echo "Listen to the segments and provide feedback!"
