#!/bin/bash

# Split DNS Setup Script
# Generates instructions for configuring Tailscale DNS

set -euo pipefail

SERVER_IP="${SERVER_IP:-YOUR_SERVER_IP}"
SSH_USER="${SSH_USER:-root}"
DEPLOY_DIR="/opt/funeral-service"

echo "🌐 Setting up Split DNS for Tailscale..."

# Get Tailscale IP from deployed server
echo "📡 Retrieving Tailscale IP from server..."
TAILSCALE_IP=$(ssh "${SSH_USER}@${SERVER_IP}" "cd ${DEPLOY_DIR} && grep TAILSCALE_IP= .env.production | cut -d= -f2")

if [[ -z "$TAILSCALE_IP" ]]; then
    echo "❌ Could not retrieve Tailscale IP. Make sure deployment completed successfully."
    exit 1
fi

echo "✅ Tailscale IP detected: $TAILSCALE_IP"
echo ""

# Generate DNS configuration
echo "🔧 Tailscale DNS Configuration Required:"
echo ""
echo "Go to https://login.tailscale.com/admin/dns and add these A records:"
echo ""

# Read admin subdomains and domain from server
SUBDOMAINS=$(ssh "${SSH_USER}@${SERVER_IP}" "cd ${DEPLOY_DIR} && grep ADMIN_SUBDOMAINS= .env.production | cut -d= -f2" | tr ',' ' ')
DOMAIN=$(ssh "${SSH_USER}@${SERVER_IP}" "cd ${DEPLOY_DIR} && grep DOMAIN_NAME= .env.production | cut -d= -f2")

for subdomain in $SUBDOMAINS; do
    echo "A    ${subdomain}.${DOMAIN}    ${TAILSCALE_IP}"
done

echo ""
echo "📋 Step-by-step instructions:"
echo ""
echo "1. Open Tailscale Admin Console: https://login.tailscale.com/admin/dns"
echo "2. Click 'Add nameserver' or 'DNS records'"
echo "3. Add each A record above"
echo "4. Save the configuration"
echo ""
echo "🔍 Testing access:"
echo "Once DNS is configured, test from any device on your Tailscale network:"
echo ""

for subdomain in $SUBDOMAINS; do
    case $subdomain in
        "admin")
            echo "📱 App Admin:        https://${subdomain}.${DOMAIN}"
            ;;
        "files")
            echo "📁 File Manager:     https://${subdomain}.${DOMAIN}"
            ;;
        "logs")
            echo "📝 Live Logs:        https://${subdomain}.${DOMAIN}"
            ;;
        "redis")
            echo "💾 Redis Database:   https://${subdomain}.${DOMAIN}"
            ;;
        "crowdsec")
            echo "🛡️  Security Monitor: https://${subdomain}.${DOMAIN}"
            ;;
        "containers")
            echo "🐳 Container Mgmt:   https://${subdomain}.${DOMAIN}"
            ;;
        "monitoring")
            echo "📊 System Monitor:   https://${subdomain}.${DOMAIN}"
            ;;
    esac
done

echo ""
echo "🔐 Security Notes:"
echo "• These domains only resolve within your Tailscale network"
echo "• Public DNS queries for these domains will fail"
echo "• SSL certificates are automatically provided"
echo "• Access is restricted to Tailscale IP ranges"

echo ""
echo "🧪 Quick Test:"
echo "nslookup admin.${DOMAIN}  # Should return ${TAILSCALE_IP} from Tailscale devices"
echo "curl -k https://admin.${DOMAIN}  # Should work from Tailscale devices"