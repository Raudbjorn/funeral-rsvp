#!/bin/bash

# Backup script for Memorial Service App

set -e

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in $BACKUP_DIR"

# Backup data files
echo "💾 Backing up application data..."
cp -r data "$BACKUP_DIR/"
cp -r public/uploads "$BACKUP_DIR/"

# Backup Redis data
echo "🔴 Backing up Redis data..."
docker-compose exec redis redis-cli --rdb /data/dump.rdb
docker cp memorial-redis:/data/dump.rdb "$BACKUP_DIR/"

# Backup SSL certificates
echo "🔐 Backing up SSL certificates..."
docker cp memorial-certbot:/etc/letsencrypt "$BACKUP_DIR/"

# Backup configuration
echo "⚙️ Backing up configuration..."
cp .env "$BACKUP_DIR/"
cp -r nginx "$BACKUP_DIR/"
cp -r crowdsec "$BACKUP_DIR/"

# Create archive
echo "🗜️ Creating compressed archive..."
tar -czf "$BACKUP_DIR.tar.gz" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")"
rm -rf "$BACKUP_DIR"

echo "✅ Backup complete: $BACKUP_DIR.tar.gz"
echo "💾 Size: $(du -h "$BACKUP_DIR.tar.gz" | cut -f1)"