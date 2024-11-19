module.exports = {
    apps: [
        {
            name: "elata-newsbot-scraper",
            script: "./dist/index.js",
            watch: false,
            instances: 1,
            autorestart: false,
            cron_restart: "0 12 * * *",
            max_memory_restart: '1G',
            env_file: ".env",
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        },
        {
            name: "elata-newsbot-server",
            script: "./dist/server.js",
            watch: true,
            instances: 1,
            autorestart: true,
            max_memory_restart: '500M',
            env_file: ".env",
            env: {
                NODE_ENV: 'development',
                PORT: 2345
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 2345
            }
        }
    ]
}