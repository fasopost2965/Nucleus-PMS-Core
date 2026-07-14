#!/bin/bash
set -e

echo "=== Nucleus PMS Core - Build Script ==="

echo "[1/4] Installing dependencies..."
npm install

echo "[2/4] Generating Prisma Client..."
cd apps/backend
npx prisma generate
cd ../..

echo "[3/4] Building backend..."
cd apps/backend
npm run build
cd ../..

echo "=== Build Complete ==="
echo "To deploy to Hostinger, use 'pm2 start apps/backend/ecosystem.config.js --env production'"
