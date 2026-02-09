#!/bin/bash
# deploy.sh — Run on the DigitalOcean server to deploy latest code
# Usage: ssh newsbot 'bash /root/elata-vsm-system-4/scraper/scripts/deploy.sh'
# Or invoked automatically by the GitHub Actions deploy workflow.

set -euo pipefail

REPO_DIR="/root/elata-vsm-system-4"
LOG_FILE="/var/log/elata-deploy.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "=== Deploy started ==="

cd "$REPO_DIR"
log "Pulling latest from main..."
git fetch origin main
git reset --hard origin/main

log "Building shared-types..."
cd shared-types
npm ci --production=false
npm run build

log "Building scraper..."
cd "$REPO_DIR/scraper"
npm ci --production=false
npm run build

log "Restarting PM2 processes..."
pm2 restart ecosystem.config.cjs --env production
pm2 save

# Install log rotation if not already installed
pm2 describe pm2-logrotate > /dev/null 2>&1 || {
  log "Installing pm2-logrotate..."
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 50M
  pm2 set pm2-logrotate:retain 7
  pm2 set pm2-logrotate:compress true
}

log "=== Deploy completed ==="
pm2 list
