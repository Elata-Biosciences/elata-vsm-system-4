# Elata News Scraper & API

A specialized news aggregation system that scrapes, processes, and serves news related to computational neuroscience, precision psychiatry, and emerging mental health fields for Elata Biosciences.

## System Overview

The system consists of two main components:

1. **News Scraper**: Aggregates and processes news articles
2. **API Server**: Serves processed news data via JSON endpoints

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Process Manager**: PM2
- **APIs**: NewsAPI, OpenAI
- **Scheduling**: pm2
- **Storage**: JSON files in `data/` directory in server

## Prerequisites

- Node.js v18+
- PM2 installed globally (`npm install -g pm2`)
- API keys for:
  - NewsAPI
  - OpenAI
  - Discord (for notifications)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Build the TypeScript project:

```bash
npm run build
```

## Environment Variables

```env
NEWS_API_KEY=your_newsapi_key
OPENAI_API_KEY=your_openai_key
DISCORD_WEBHOOK_URL=your_webhook_url
OPENAI_ORG_ID=your_org_id
PORT=2345  # API server port
```

## Running the Scraper

This will run the scrapper, and query the NewsAPI for the latest news, then store the results in `data/current.json`.
Then, it will use ChatGPT to scrape selected websites for news related to our mission, and store the results in `data/scraped/`.
Finally, it will combine the two results, and store the final results in `data/current.json`.

```bash
npm run start
```

## Running the API Server

This will start the API server, which will serve the processed news data via JSON endpoints.

This is needed to view the news data in the web app.

```bash
npm run serve
```

## PM2 Setup

The system uses PM2 for process management and scheduling. Configuration is in `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "elata-scraper",
      script: "dist/index.js",
      cron_restart: "0 */4 * * *", // Runs every 4 hours
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "elata-api",
      script: "dist/server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 2345,
      },
    },
  ],
};
```

### PM2 Management Commands

```bash
# Initial setup
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Monitoring
pm2 list                 # View process list
pm2 monit               # Process monitoring
pm2 logs elata-scraper  # Scraper logs
pm2 logs elata-api      # API logs

# Maintenance
pm2 reload all          # Zero-downtime reload
pm2 restart all         # Hard restart
```

## Data Structure

### Storage Location

```
scraper/data/
├── current.json                # Latest news
├── summary_2025-01-01.json     # Daily archives
├── scraped/                    # Raw scraped data
├─────────── 2025-01-01.json    # Daily archives
```

## API Endpoints

### Get Current News

```
GET http://localhost:2345/data
```

### Get News by Date

```
GET http://localhost:2345/data?date=2025-01-01
```

### Health Check

```
GET http://localhost:2345/health
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check API health
curl http://localhost:2345/health

# View logs
pm2 logs elata-newsbot-scraper
pm2 logs elata-newsbot-api

# Monitor processes
pm2 monit
```
