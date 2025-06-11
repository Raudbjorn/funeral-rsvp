#!/bin/bash

# Quick deployment script for updates
# Usage: ./scripts/quick-deploy.sh

set -euo pipefail

SERVER_IP="${SERVER_IP:-YOUR_SERVER_IP}"
SSH_USER="${SSH_USER:-root}"
DEPLOY_DIR="/opt/funeral-service"

echo "🚀 Quick deploying updates to production..."

# Upload updated files
echo "📤 Uploading updated files..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.claude' \
    --exclude 'data' \
    . "${SSH_USER}@${SERVER_IP}:${DEPLOY_DIR}/"

# Restart application
echo "🔄 Restarting application..."
ssh "${SSH_USER}@${SERVER_IP}" << EOF
cd ${DEPLOY_DIR}

# Load environment variables
export \$(cat .env.production | xargs)

# Restart only the app container to pick up changes
docker-compose up --build -d app

# Wait for restart
sleep 10

# Check status
docker-compose ps app
docker-compose exec -T app curl -f http://localhost:3000/api/health || echo "Health check failed"
EOF

echo "✅ Quick deployment completed!"
echo "🌐 Site: https://${DOMAIN_NAME:-your-domain.com}"