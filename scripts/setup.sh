#!/bin/bash

# Memorial Service App Setup Script

set -e

echo "🚀 Setting up Memorial Service App with Docker"

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file from template if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.docker .env
    echo "⚠️  Please edit .env file with your actual configuration before proceeding!"
    echo "   - Set your domain name"
    echo "   - Add Porkbun API credentials"
    echo "   - Set secure passwords"
    read -p "Press Enter when you've configured .env file..."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data
mkdir -p public/uploads
mkdir -p nginx/ssl

# Set proper permissions
echo "🔒 Setting permissions..."
chmod 700 certbot/porkbun.ini
chmod -R 755 data
chmod -R 755 public/uploads

# Build and start services
echo "🐳 Building and starting Docker containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if app is healthy
echo "🏥 Checking application health..."
if curl -f http://localhost/api/health &> /dev/null; then
    echo "✅ Application is healthy!"
else
    echo "❌ Application health check failed. Check logs:"
    echo "   docker-compose logs app"
fi

# Initial SSL certificate setup
echo "🔐 Setting up SSL certificates..."
read -p "Do you want to obtain SSL certificates now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    source .env
    docker-compose run --rm certbot certbot certonly \
        --dns-porkbun \
        --dns-porkbun-credentials /etc/certbot/porkbun.ini \
        -d $DOMAIN_NAME \
        --agree-tos \
        --email admin@$DOMAIN_NAME
    
    # Reload nginx to pick up certificates
    docker-compose restart nginx
fi

# Setup CrowdSec bouncer
echo "🛡️  Setting up CrowdSec bouncer..."
echo "Getting bouncer API key..."
BOUNCER_KEY=$(docker-compose exec crowdsec cscli bouncers add nginx-bouncer --output raw 2>/dev/null || echo "")
if [ ! -z "$BOUNCER_KEY" ]; then
    echo "CrowdSec bouncer key: $BOUNCER_KEY"
    echo "Add this to your .env file as CROWDSEC_BOUNCER_API_KEY"
else
    echo "⚠️  Could not generate bouncer key automatically. Please run:"
    echo "   docker-compose exec crowdsec cscli bouncers add nginx-bouncer"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Your memorial service app should now be running at:"
echo "   HTTP:  http://localhost"
echo "   HTTPS: https://$DOMAIN_NAME (after SSL setup)"
echo ""
echo "Useful commands:"
echo "   View logs:           docker-compose logs -f"
echo "   Stop services:       docker-compose down"
echo "   Update containers:   docker-compose pull && docker-compose up -d"
echo "   CrowdSec status:     docker-compose exec crowdsec cscli metrics"
echo ""