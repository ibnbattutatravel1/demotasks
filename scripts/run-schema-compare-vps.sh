#!/bin/bash
# Run Schema Comparison Tool on VPS
# This script runs the database schema comparison inside the Docker container

set -e

echo "🔍 Running Database Schema Comparison..."

# Run the comparison tool inside the container
docker exec -it taskara-web npm run db:compare

echo ""
echo "✅ Comparison complete!"
echo ""
echo "📁 Generated files (inside container):"
echo "  - /app/scripts/schema-comparison-report.md"
echo "  - /app/scripts/migration-sync.sql"
echo ""
echo "📥 To copy files from container to host:"
echo "  docker cp taskara-web:/app/scripts/schema-comparison-report.md ./schema-comparison-report.md"
echo "  docker cp taskara-web:/app/scripts/migration-sync.sql ./migration-sync.sql"
