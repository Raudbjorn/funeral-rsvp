#!/bin/bash

# Memorial Service App Simple Setup Script

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

# Generate secure Redis password if not set
if [ -z "${REDIS_PASSWORD}" ]; then
    echo "🔐 Generating secure Redis password..."
    GENERATED_REDIS_PASSWORD=$(openssl rand -hex 32)
else
    GENERATED_REDIS_PASSWORD="${REDIS_PASSWORD}"
fi

# Set site URL if not provided
if [ -z "${NEXT_PUBLIC_SITE_URL}" ]; then
    HOSTNAME_VALUE=$(hostname 2>/dev/null || echo "localhost")
    GENERATED_SITE_URL="http://${HOSTNAME_VALUE}:3000"
else
    GENERATED_SITE_URL="${NEXT_PUBLIC_SITE_URL}"
fi

# Create .env file from template if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file with auto-generated values..."
    cat > .env << EOF
# Redis Configuration (auto-generated)
REDIS_PASSWORD=${GENERATED_REDIS_PASSWORD}

# Application Configuration (auto-detected)
NEXT_PUBLIC_SITE_URL=${GENERATED_SITE_URL}
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-openweather-api-key
EOF
    echo "✅ Generated .env file with:"
    echo "   - Secure Redis password (32-byte hex)"
    echo "   - Site URL: ${GENERATED_SITE_URL}"
    echo "⚠️  Please add your API keys to .env file before proceeding!"
    read -p "Press Enter when you've added your API keys..."
else
    echo "📝 .env file already exists, checking for missing values..."
    
    # Update existing .env file with generated values if they're missing
    if ! grep -q "^REDIS_PASSWORD=" .env || grep -q "^REDIS_PASSWORD=your-secure-redis-password" .env; then
        echo "🔐 Updating Redis password in existing .env..."
        if grep -q "^REDIS_PASSWORD=" .env; then
            sed -i "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=${GENERATED_REDIS_PASSWORD}/" .env
        else
            echo "REDIS_PASSWORD=${GENERATED_REDIS_PASSWORD}" >> .env
        fi
    fi
    
    if ! grep -q "^NEXT_PUBLIC_SITE_URL=" .env || grep -q "^NEXT_PUBLIC_SITE_URL=http://localhost:3000" .env; then
        echo "🌐 Updating site URL in existing .env..."
        if grep -q "^NEXT_PUBLIC_SITE_URL=" .env; then
            sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=${GENERATED_SITE_URL}|" .env
        else
            echo "NEXT_PUBLIC_SITE_URL=${GENERATED_SITE_URL}" >> .env
        fi
    fi
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data
mkdir -p public/uploads

# Set proper permissions
echo "🔒 Setting permissions..."
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
if curl -f http://localhost:3000/api/health &> /dev/null; then
    echo "✅ Application is healthy!"
else
    echo "❌ Application health check failed. Check logs:"
    echo "   docker-compose logs app"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Your memorial service app should now be running at:"
echo "   Local:  http://localhost:3000"
echo "   Admin:  http://localhost:3000/admin (requires basic auth setup)"
echo ""
echo "To set up admin access:"
echo "   1. Install apache2-utils: sudo apt-get install apache2-utils"
echo "   2. Create password file: htpasswd -c .htpasswd admin"
echo "   3. Update docker-compose.yml to mount .htpasswd in nginx"
echo ""
echo "Useful commands:"
echo "   View logs:           docker-compose logs -f"
echo "   Stop services:       docker-compose down"
echo "   Update containers:   docker-compose pull && docker-compose up -d"
echo ""