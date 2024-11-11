#!/bin/bash

echo "Starting setup..."

# Update package lists
sudo apt-get update

# Install Node.js and npm
echo "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installations
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"

# Install project dependencies
echo "Installing project dependencies..."
npm install

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Verify PM2 installation
echo "PM2 version: $(pm2 --version)"

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Setup PM2 to start on system boot
sudo pm2 startup systemd
pm2 start ecosystem.config.cjs

echo "Setup complete! Don't forget to create your .env file if you haven't already." 