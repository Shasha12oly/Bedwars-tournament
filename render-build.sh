#!/bin/bash

# Render build script for BedWars Tournament
echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building Next.js application..."
npm run build

echo "Build completed successfully!"

# List the output directory
echo "Output directory contents:"
ls -la out/
