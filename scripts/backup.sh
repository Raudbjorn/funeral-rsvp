#!/bin/bash

# Backup script for production data
# Usage: ./scripts/backup.sh

set -euo pipefail

SERVER_IP="${SERVER_IP:-YOUR_SERVER_IP}"
SSH_USER="${SSH_USER:-root}"
DEPLOY_DIR="/opt/funeral-service"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

echo "💾 Creating backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Download data files
echo "📥 Downloading data files..."
scp -r "${SSH_USER}@${SERVER_IP}:${DEPLOY_DIR}/data/" "$BACKUP_DIR/"

# Download uploaded photos
echo "📸 Downloading photos..."
scp -r "${SSH_USER}@${SERVER_IP}:${DEPLOY_DIR}/public/uploads/" "$BACKUP_DIR/"

echo "✅ Backup completed: $BACKUP_DIR"