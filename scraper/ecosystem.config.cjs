module.exports = {
  apps: [
    {
      name: "elata-newsbot-scraper",
      script: "./dist/index.js",
      watch: false,
      instances: 1,
      autorestart: false,
      cron_restart: "0 12 * * *",
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
