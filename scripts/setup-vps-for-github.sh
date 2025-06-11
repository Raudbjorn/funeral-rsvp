#!/bin/bash

# VPS Setup Script for GitHub Actions Integration
# Run this locally to prepare your VPS for automated deployments

set -euo pipefail

SERVER_IP="${SERVER_IP:-YOUR_SERVER_IP}"
SSH_USER="${SSH_USER:-root}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo "🚀 Setting up VPS for GitHub Actions Integration"
echo "Server: ${SSH_USER}@${SERVER_IP}"
echo ""

# Step 1: Test current SSH access
log_step "1. Testing SSH connection..."
if ssh -o ConnectTimeout=10 "${SSH_USER}@${SERVER_IP}" exit 2>/dev/null; then
    log_info "✅ SSH connection successful"
else
    log_error "❌ Cannot connect to VPS. Please ensure:"
    echo "   - Server IP is correct: ${SERVER_IP}"
    echo "   - SSH user is correct: ${SSH_USER}"
    echo "   - You have SSH access configured"
    echo "   - Server is running and accessible"
    exit 1
fi

# Step 2: Generate GitHub Actions SSH key
log_step "2. Generating SSH key for GitHub Actions..."

if [[ ! -f ~/.ssh/github_actions_ed25519 ]]; then
    ssh-keygen -t ed25519 -f ~/.ssh/github_actions_ed25519 -C "github-actions@your-domain.com" -N ""
    log_info "✅ SSH key pair generated"
else
    log_warn "SSH key already exists, using existing key"
fi

# Step 3: Copy public key to server
log_step "3. Installing public key on server..."

PUBLIC_KEY=$(cat ~/.ssh/github_actions_ed25519.pub)
ssh "${SSH_USER}@${SERVER_IP}" << EOF
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add the public key to authorized_keys
echo "${PUBLIC_KEY}" >> ~/.ssh/authorized_keys

# Remove any duplicates
sort ~/.ssh/authorized_keys | uniq > ~/.ssh/authorized_keys.tmp
mv ~/.ssh/authorized_keys.tmp ~/.ssh/authorized_keys

# Set proper permissions
chmod 600 ~/.ssh/authorized_keys

echo "✅ GitHub Actions public key installed"
EOF

# Step 4: Test GitHub Actions SSH key
log_step "4. Testing GitHub Actions SSH access..."

if ssh -i ~/.ssh/github_actions_ed25519 -o ConnectTimeout=10 "${SSH_USER}@${SERVER_IP}" exit 2>/dev/null; then
    log_info "✅ GitHub Actions SSH key works"
else
    log_error "❌ GitHub Actions SSH key test failed"
    exit 1
fi

# Step 5: Prepare server environment
log_step "5. Preparing server environment..."

ssh "${SSH_USER}@${SERVER_IP}" << 'EOF'
# Update system
apt-get update

# Install required packages
apt-get install -y curl wget git rsync

# Create deployment directory
mkdir -p /opt/funeral-service
cd /opt/funeral-service

# Set proper permissions
chmod 755 /opt/funeral-service

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    rm get-docker.sh
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Configure firewall
ufw allow 22/tcp
ufw allow 80/tcp  
ufw allow 443/tcp
ufw --force enable

# Install fail2ban for security
if ! command -v fail2ban-server &> /dev/null; then
    apt-get install -y fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban
    echo "✅ fail2ban installed"
fi

echo "✅ Server environment prepared"
EOF

# Step 6: Display GitHub Secrets setup
log_step "6. GitHub Repository Secrets Setup"
echo ""
echo "🔐 Copy this private key content to GitHub Secrets as 'SSH_PRIVATE_KEY':"
echo ""
echo "---BEGIN PRIVATE KEY CONTENT---"
cat ~/.ssh/github_actions_ed25519
echo ""
echo "---END PRIVATE KEY CONTENT---"
echo ""

# Step 7: Display complete GitHub secrets list
log_step "7. Complete GitHub Secrets Configuration"
echo ""
echo "📋 Go to your GitHub repository → Settings → Secrets and Variables → Actions"
echo "Add these repository secrets:"
echo ""

cat << 'SECRETS_EOF'
SSH_PRIVATE_KEY              = [Content from step 6 above]
SSH_USER                     = root
SERVER_IP                    = [YOUR_SERVER_IP]
DOMAIN_NAME                  = [YOUR_DOMAIN]
REDIS_PASSWORD               = [YOUR_REDIS_PASSWORD]
TAILSCALE_AUTHKEY           = [YOUR_TAILSCALE_AUTHKEY]
PORKBUN_API_KEY             = [YOUR_PORKBUN_API_KEY]
PORKBUN_SECRET_KEY          = [YOUR_PORKBUN_SECRET_KEY]
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY    = [YOUR_GOOGLE_MAPS_API_KEY]
NEXT_PUBLIC_OPENWEATHER_API_KEY    = [YOUR_OPENWEATHER_API_KEY]
SECRETS_EOF

# Step 8: Final verification
log_step "8. Final Verification"
echo ""

# Test final SSH connection
if ssh -i ~/.ssh/github_actions_ed25519 "${SSH_USER}@${SERVER_IP}" 'docker --version && docker-compose --version' &>/dev/null; then
    log_info "✅ VPS is ready for GitHub Actions deployment!"
else
    log_error "❌ VPS setup verification failed"
    exit 1
fi

echo ""
log_info "🎉 VPS Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Add the private key and secrets to your GitHub repository"
echo "2. Push your code to trigger the first deployment"
echo "3. Monitor the deployment in GitHub Actions tab"
echo ""
echo "🔗 GitHub Repository Settings:"
echo "   https://github.com/[username]/[repo-name]/settings/secrets/actions"
echo ""
echo "📊 Monitor Deployment:"
echo "   https://github.com/[username]/[repo-name]/actions"
echo ""
echo "🌐 Your site will be available at:"
echo "   https://joi.taxi (after DNS is configured)"
EOF