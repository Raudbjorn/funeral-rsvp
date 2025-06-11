#!/bin/bash

# Test GitHub Actions deployment locally
# Simulates the GitHub Actions workflow for testing

set -euo pipefail

SERVER_IP="${SERVER_IP:-YOUR_SERVER_IP}"
SSH_USER="${SSH_USER:-root}"
DEPLOY_DIR="/opt/funeral-service"

echo "🧪 Testing GitHub Actions deployment workflow..."
echo ""

# Check if we have the GitHub Actions SSH key
if [[ ! -f ~/.ssh/github_actions_ed25519 ]]; then
    echo "❌ GitHub Actions SSH key not found. Run ./scripts/setup-vps-for-github.sh first"
    exit 1
fi

echo "📡 Testing SSH connection with GitHub Actions key..."
if ssh -i ~/.ssh/github_actions_ed25519 "${SSH_USER}@${SERVER_IP}" exit; then
    echo "✅ SSH connection successful"
else
    echo "❌ SSH connection failed"
    exit 1
fi

echo ""
echo "📦 Simulating file deployment..."

# Create temporary deployment directory
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Copy files (excluding what GitHub Actions excludes)
rsync -avz --delete \
    --exclude '.git' \
    --exclude '.github' \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.claude' \
    --exclude '.env*' \
    ./ "$TEMP_DIR/"

echo "✅ Files prepared for deployment"

# Test rsync to server
echo ""
echo "📤 Testing file transfer to server..."
rsync -avz --delete \
    -e "ssh -i ~/.ssh/github_actions_ed25519" \
    "$TEMP_DIR/" "${SSH_USER}@${SERVER_IP}:${DEPLOY_DIR}/"

echo "✅ File transfer successful"

# Test environment file creation
echo ""
echo "🔧 Testing environment file creation..."
ssh -i ~/.ssh/github_actions_ed25519 "${SSH_USER}@${SERVER_IP}" << 'EOF'
cd /opt/funeral-service

# Create test environment file
cat > .env.test << 'ENV_EOF'
# Test Environment Variables
DOMAIN_NAME=your-domain.com
REDIS_PASSWORD=test-password-123
TAILSCALE_AUTHKEY=test-key-123
PORKBUN_API_KEY=test-api-key
PORKBUN_SECRET_KEY=test-secret-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=test-maps-key
NEXT_PUBLIC_OPENWEATHER_API_KEY=test-weather-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
GID=1000

# CrowdSec API Keys (will be generated during setup)
CROWDSEC_BOUNCER_API_KEY=
CROWDSEC_DASHBOARD_API_KEY=

# Redis Configuration
REDIS_URL=redis://:test-password-123@redis:6379

# Split DNS Configuration (optional)
ENABLE_SPLIT_DNS=true
ADMIN_SUBDOMAINS=admin,files,logs,redis,crowdsec,containers,monitoring

# Tailscale IP (auto-detected during deployment)
TAILSCALE_IP=
ENV_EOF

echo "✅ Environment file created successfully"

# Test Docker commands
echo "🐳 Testing Docker availability..."
docker --version
docker-compose --version
echo "✅ Docker is available"

# Test directory creation
echo "📁 Testing directory structure..."
mkdir -p data nginx/sites nginx/ssl certbot crowdsec promtail tailscale public/uploads backups
echo "✅ Directory structure created"

# Cleanup test file
rm .env.test
EOF

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "🎉 GitHub Actions deployment test completed successfully!"
echo ""
echo "✅ All components verified:"
echo "   - SSH access with GitHub Actions key"
echo "   - File transfer via rsync"
echo "   - Environment file creation"
echo "   - Docker availability"
echo "   - Directory structure creation"
echo ""
echo "🚀 Your VPS is ready for GitHub Actions deployment!"
echo ""
echo "📝 Next steps:"
echo "1. Push your code to GitHub repository"
echo "2. Configure GitHub Secrets"
echo "3. GitHub Actions will automatically deploy on push to main/master"