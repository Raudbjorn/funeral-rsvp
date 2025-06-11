# 🚀 Production Deployment Guide

This guide covers deploying the Memorial Service app with Docker Compose, including Nginx reverse proxy, SSL certificates, and security features.

## 📋 Prerequisites

- Docker and Docker Compose installed
- A domain name pointed to your server
- Porkbun domain registrar account (for DNS-01 SSL challenges)
- Server with at least 2GB RAM and 10GB storage

## 🛠️ Quick Setup

1. **Clone and configure**:
   ```bash
   git clone <your-repo>
   cd memorial-service-app
   ./scripts/setup.sh
   ```

2. **Follow the prompts** to configure your environment and SSL certificates.

## 📝 Manual Setup

### 1. Environment Configuration

Copy the environment template and configure it:

```bash
cp .env.docker .env
```

Edit `.env` with your settings:

```bash
# Your domain name
DOMAIN_NAME=memorial.yourdomain.com

# Secure Redis password
REDIS_PASSWORD=your-very-secure-redis-password

# Porkbun API credentials (from https://porkbun.com/account/api)
PORKBUN_API_KEY=pk1_your_api_key
PORKBUN_SECRET_KEY=sk1_your_secret_key

# Google Maps API key (optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 2. SSL Certificate Setup

Configure Porkbun credentials:

```bash
# Edit certbot/porkbun.ini
dns_porkbun_api_key = pk1_your_api_key
dns_porkbun_secret_key = sk1_your_secret_key

# Secure the file
chmod 600 certbot/porkbun.ini
```

### 3. Start Services

```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps
```

### 4. Obtain SSL Certificates

```bash
# Replace with your domain
docker-compose run --rm certbot certbot certonly \
  --dns-porkbun \
  --dns-porkbun-credentials /etc/certbot/porkbun.ini \
  -d your-domain.com \
  --agree-tos \
  --email admin@your-domain.com

# Restart nginx to load certificates
docker-compose restart nginx
```

### 5. Configure CrowdSec Bouncer

```bash
# Generate bouncer API key
BOUNCER_KEY=$(docker-compose exec crowdsec cscli bouncers add nginx-bouncer --output raw)
echo "Bouncer key: $BOUNCER_KEY"

# Add the key to your .env file
echo "CROWDSEC_BOUNCER_API_KEY=$BOUNCER_KEY" >> .env

# Restart services to apply
docker-compose down && docker-compose up -d
```

## 🏗️ Architecture Overview

```
Internet → Nginx (80/443) → Next.js App (3000)
                ↓
            CrowdSec ← Redis
                ↓
            Certbot (SSL)
```

### Services Included:

- **app**: Next.js application
- **nginx**: Reverse proxy with SSL termination
- **redis**: Rate limiting and session storage
- **certbot**: Automatic SSL certificate management
- **crowdsec**: Intrusion detection and prevention
- **crowdsec-nginx-bouncer**: Nginx integration for CrowdSec
- **watchtower**: Automatic container updates
- **promtail**: Log aggregation

## 🔒 Security Features

### Rate Limiting
- **RSVP/Carpool APIs**: 3-5 requests per 5 minutes
- **Photo uploads**: 10 uploads per hour
- **General requests**: 30 requests per 15 minutes
- **Geographic limiting**: Stricter for non-Iceland IPs

### CrowdSec Protection
- Real-time threat detection
- Automatic IP banning
- Community threat intelligence
- Nginx integration

### SSL/TLS
- Let's Encrypt certificates via DNS-01 challenge
- Modern TLS configuration (TLS 1.2+)
- HSTS headers
- Perfect Forward Secrecy

### Content Security Policy
- Restricts resource loading
- Prevents XSS attacks
- Allows Google Maps integration

## 📊 Monitoring

### Health Checks
```bash
# Quick status check
./scripts/monitor.sh

# View all logs
docker-compose logs -f

# Check specific service
docker-compose logs app
```

### CrowdSec Monitoring
```bash
# View metrics
docker-compose exec crowdsec cscli metrics

# List current bans
docker-compose exec crowdsec cscli decisions list

# View scenarios
docker-compose exec crowdsec cscli scenarios list
```

### SSL Certificate Status
```bash
# Check certificate expiry
openssl x509 -enddate -noout -in /etc/letsencrypt/live/your-domain.com/fullchain.pem
```

## 🔧 Maintenance

### Backups
```bash
# Create backup
./scripts/backup.sh

# Backups include:
# - Application data
# - Uploaded photos
# - Redis data
# - SSL certificates
# - Configuration files
```

### Updates
```bash
# Update all containers
docker-compose pull
docker-compose up -d

# Or let Watchtower handle it automatically
```

### Log Rotation
Logs are automatically rotated by Docker. To manually clean:

```bash
# Clean old logs
docker system prune

# View log sizes
docker system df
```

## 🚨 Troubleshooting

### Common Issues

**SSL Certificate Issues**:
```bash
# Check DNS propagation
dig your-domain.com

# Test certificate manually
docker-compose run --rm certbot certbot certonly --dry-run \
  --dns-porkbun --dns-porkbun-credentials /etc/certbot/porkbun.ini \
  -d your-domain.com
```

**App Not Responding**:
```bash
# Check app health
curl http://localhost/api/health

# View app logs
docker-compose logs app

# Restart app
docker-compose restart app
```

**CrowdSec Issues**:
```bash
# Check CrowdSec status
docker-compose exec crowdsec cscli metrics

# Restart CrowdSec
docker-compose restart crowdsec
```

**High Memory Usage**:
```bash
# Check container resource usage
docker stats

# Restart services if needed
docker-compose restart
```

### Emergency Procedures

**Disable CrowdSec (if blocking legitimate traffic)**:
```bash
# Temporarily stop CrowdSec
docker-compose stop crowdsec crowdsec-nginx-bouncer
docker-compose restart nginx
```

**Remove all bans**:
```bash
docker-compose exec crowdsec cscli decisions delete --all
```

**Emergency app restart**:
```bash
docker-compose restart app nginx
```

## 📱 Post-Deployment Checklist

- [ ] App accessible via HTTPS
- [ ] SSL certificate valid and auto-renewing
- [ ] Rate limiting working (test with multiple requests)
- [ ] CrowdSec collecting logs and blocking threats
- [ ] Backups configured and tested
- [ ] Monitoring alerts set up
- [ ] Domain DNS properly configured
- [ ] Google Maps integration working (if configured)
- [ ] Photo uploads working
- [ ] RSVP and carpool forms functional

## 🔗 Useful Commands

```bash
# View real-time logs
docker-compose logs -f

# Check SSL certificate
curl -I https://your-domain.com

# Test rate limiting
for i in {1..10}; do curl https://your-domain.com/api/rsvp; done

# CrowdSec status
docker-compose exec crowdsec cscli hub list

# Nginx configuration test
docker-compose exec nginx nginx -t

# Redis connection test
docker-compose exec redis redis-cli ping
```