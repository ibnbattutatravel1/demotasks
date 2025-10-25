#!/bin/bash
# VPS Deployment Script for Taskara
# This script rebuilds and redeploys the backend on your VPS

set -e  # Exit on error

echo "🚀 Starting Taskara Backend Rebuild..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Stop running containers
echo -e "${YELLOW}📦 Stopping containers...${NC}"
docker compose down || docker-compose down || true

# Step 2: Pull latest code (if needed)
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main || echo "Already up to date"

# Step 3: Rebuild the web container
echo -e "${YELLOW}🔨 Building web container...${NC}"
docker compose build web || docker-compose build web

# Step 4: Start all services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose up -d || docker-compose up -d

# Step 5: Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

# Step 6: Check container status
echo -e "${YELLOW}📊 Container status:${NC}"
docker ps

# Step 7: Show web container logs
echo -e "${YELLOW}📝 Recent logs from web container:${NC}"
docker logs --tail 50 taskara-web

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Your app should be running at: https://taskara.compumacy.com${NC}"
