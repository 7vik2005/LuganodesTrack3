#!/bin/bash
# Railway deployment script
echo "Starting Railway deployment..."

# Install dependencies
npm install

# Create cache directory if it doesn't exist
mkdir -p cache

echo "Railway deployment complete"
