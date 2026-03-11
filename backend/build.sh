#!/bin/bash
# Railway build script
echo "Building for Railway..."

# Install dependencies
npm ci --only=production

# Create cache directory
mkdir -p cache

echo "Railway build complete"
