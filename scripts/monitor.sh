#!/bin/bash

# Monitoring script for Memorial Service App

echo "🔍 Memorial Service App Status"
echo "================================"

# Check container status
echo ""
echo "📦 Container Status:"
docker-compose ps

# Check health endpoints
echo ""
echo "🏥 Health Checks:"
if curl -s http://localhost/api/health | jq -r '.status' 2>/dev/null | grep -q "healthy"; then
    echo "✅ App: Healthy"
else
    echo "❌ App: Unhealthy"
fi

if docker-compose exec redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo "✅ Redis: Healthy"
else
    echo "❌ Redis: Unhealthy"
fi

if docker-compose exec nginx nginx -t 2>/dev/null | grep -q "successful"; then
    echo "✅ Nginx: Configuration OK"
else
    echo "❌ Nginx: Configuration Error"
fi

# Check CrowdSec metrics
echo ""
echo "🛡️ CrowdSec Status:"
docker-compose exec crowdsec cscli metrics 2>/dev/null || echo "❌ CrowdSec not responding"

# Check disk usage
echo ""
echo "💾 Disk Usage:"
echo "Data directory: $(du -sh data 2>/dev/null || echo 'N/A')"
echo "Uploads: $(du -sh public/uploads 2>/dev/null || echo 'N/A')"
echo "Docker volumes: $(docker system df | grep Volumes || echo 'N/A')"

# Check SSL certificate expiry
echo ""
echo "🔐 SSL Certificate Status:"
if [ -f "nginx/ssl/cert.pem" ]; then
    EXPIRY=$(openssl x509 -enddate -noout -in nginx/ssl/cert.pem | cut -d= -f2)
    echo "Expires: $EXPIRY"
else
    echo "❌ No SSL certificate found"
fi

# Recent logs summary
echo ""
echo "📋 Recent Activity (last 10 lines):"
echo "--- App Logs ---"
docker-compose logs --tail=5 app 2>/dev/null || echo "No recent app logs"

echo "--- Nginx Access Logs ---"
docker-compose exec nginx tail -5 /var/log/nginx/access.log 2>/dev/null || echo "No recent access logs"

echo ""
echo "🔗 Quick Commands:"
echo "  Full logs:        docker-compose logs -f"
echo "  CrowdSec bans:    docker-compose exec crowdsec cscli decisions list"
echo "  Nginx reload:     docker-compose exec nginx nginx -s reload"
echo "  App restart:      docker-compose restart app"