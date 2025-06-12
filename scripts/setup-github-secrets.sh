#!/bin/bash

# GitHub Secrets Setup Script
# Helps configure GitHub repository secrets for automated deployment

set -euo pipefail

GITHUB_REPO=${1:-""}

if [[ -z "$GITHUB_REPO" ]]; then
    echo "Usage: $0 <github-repo>"
    echo "Example: $0 username/repository-name"
    exit 1
fi

echo "🔐 GitHub Secrets Setup for Repository: $GITHUB_REPO"
echo ""

echo "📋 Required GitHub Secrets:"
echo ""
echo "Go to: https://github.com/$GITHUB_REPO/settings/secrets/actions"
echo "Add these repository secrets:"
echo ""

cat << 'SECRETS_EOF'
# Server Access
SSH_PRIVATE_KEY         = [Your SSH private key content]
SSH_USER               = [YOUR_SSH_USER]
SERVER_IP              = [YOUR_SERVER_IP]

# Domain
DOMAIN_NAME            = [YOUR_DOMAIN]

# Application Secrets
REDIS_PASSWORD         = [YOUR_REDIS_PASSWORD]


# API Keys
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY     = [YOUR_GOOGLE_MAPS_API_KEY]
NEXT_PUBLIC_OPENWEATHER_API_KEY     = [YOUR_OPENWEATHER_API_KEY]
SECRETS_EOF

echo ""
echo "🔑 SSH Private Key Setup:"
echo ""
echo "1. Generate SSH key pair if you don't have one:"
echo "   ssh-keygen -t ed25519 -C 'github-actions@joi.taxi'"
echo ""
echo "2. Copy public key to server:"
echo "   ssh-copy-id -i ~/.ssh/id_ed25519.pub root@104.152.211.26"
echo ""
echo "3. Copy private key content for GitHub secret:"
echo "   cat ~/.ssh/id_ed25519"
echo "   (Copy the entire content including -----BEGIN and -----END lines)"
echo ""

echo "⚡ Automated Deployment Triggers:"
echo ""
echo "• Push to main/master branch → Automatic deployment"
echo "• Manual trigger via GitHub Actions tab → On-demand deployment"
echo ""

echo "🔍 Monitor Deployments:"
echo ""
echo "• GitHub Actions: https://github.com/$GITHUB_REPO/actions"
echo "• Live logs during deployment"
echo "• Automatic health checks and status reporting"
echo ""

echo "🛠️ Post-Deployment Setup:"
echo ""
echo "After first successful deployment:"
echo "1. Set up DNS: Add A records pointing joi.taxi to 104.152.211.26"
echo "2. Configure your domain's DNS to point to your server"
echo "3. Create basic auth credentials for admin access"
echo ""

echo "✅ Benefits of GitHub Actions Deployment:"
echo ""
echo "• 🔄 Automatic deployment on code changes"
echo "• 🔐 Secure environment variable management"
echo "• 📊 Deployment status and health checks" 
echo "• 🚀 Zero-downtime rolling updates"
echo "• 📱 Integration with GitHub notifications"
echo "• 🔍 Full deployment history and rollback capability"