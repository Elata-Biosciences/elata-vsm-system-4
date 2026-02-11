module.exports = {
  apps: [
    // API server — always running, auto-restarts on crash
    {
      name: "elata-api-server",
      script: "./dist/server.js",
      watch: false,
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: "512M",
      env_file: ".env",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      cwd: "./",
      interpreter: "node",
      interpreter_args: "--experimental-specifier-resolution=node",
    },
    // Scraper pipeline — runs daily at noon UTC, no auto-restart
    {
      name: "elata-scraper",
      script: "./dist/index.js",
      watch: false,
      instances: 1,
      autorestart: false,
      cron_restart: "0 12 * * *",
      stop_exit_codes: [0],
      max_memory_restart: "1G",
      env_file: ".env",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      cwd: "./",
      interpreter: "node",
      interpreter_args: "--experimental-specifier-resolution=node",
    },
  ],
};
