# Deployment Guide

## Quick Start

To deploy the funeral service application to your VPS, run:

```bash
./deploy.sh
```

## Server Details

- **IP Address**: Your server IP
- **Domain**: Your domain name
- **SSH User**: Your SSH user (typically root)

## Quick Commands

### Deploy Application
```bash
./deploy.sh
```

### Update Application
```bash
./scripts/quick-deploy.sh
```

### View Logs
```bash
./scripts/logs.sh [service_name]
```

### Backup Data
```bash
./scripts/backup.sh
```

## Access URLs

- **Public Site**: https://joi.taxi

### 🔒 Admin Interface
- **App Admin**: https://your-domain.com/admin (protected by basic auth)

## DNS Configuration

Point your domain to the server:
```
A    your-domain.com       YOUR_SERVER_IP
A    www.your-domain.com   YOUR_SERVER_IP
```

## 🔐 Security Features

### Admin Access Protection
- Admin interface at `/admin` is **protected by HTTP basic authentication**
- Nginx handles authentication using `.htpasswd` file
- Requires valid username/password to access admin features

### Admin Interface Features
- **App Admin**: RSVP management, content moderation
- **Photo Management**: View and delete uploaded photos
- **Carpool Management**: View driver and passenger information

## ⚙️ Environment Configuration

Before deployment, you need to set up your environment variables:

```bash
# Create .env file with required variables
cat > .env << 'EOF'
REDIS_PASSWORD=your-secure-redis-password-here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-openweather-api-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
EOF

# Generate a secure Redis password
openssl rand -hex 32
```

**Important Notes**: 
- The `REDIS_PASSWORD` is required for the app to connect to Redis. Use a strong, randomly generated password.
- The `NEXT_PUBLIC_*` variables are embedded into the app at build time and **will be visible to users in the browser**.

**Security for API Keys**:
- **Google Maps API Key**: Secure it in Google Cloud Console with HTTP referrer restrictions (e.g., `https://your-domain.com/*`)
- **OpenWeather API Key**: Currently not used (weather widget shows mock data), can be omitted
- **Site URL**: Safe to expose, used for social media previews

## 🔧 Setting Up Basic Authentication

To secure the admin interface, create a basic auth file:

```bash
# Install htpasswd utility (if not already installed)
sudo apt-get install apache2-utils

# Create .htpasswd file with admin user
htpasswd -c .htpasswd admin

# Uncomment the basic auth volume mount in docker-compose.yml:
# - ./.htpasswd:/etc/nginx/.htpasswd:ro
```

## 🔐 Setting Up SSL/TLS Certificates

To enable HTTPS, you'll need to mount your SSL certificates:

### Option 1: Using Let's Encrypt (recommended)
```bash
# Install certbot
sudo apt-get install certbot

# Obtain certificates (replace your-domain.com)
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to your project
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
sudo chown $USER:$USER ./ssl/*
```

### Option 2: Using your own certificates
```bash
# Create ssl directory
mkdir -p ssl

# Copy your certificate files
cp your-fullchain.pem ./ssl/fullchain.pem
cp your-private-key.pem ./ssl/privkey.pem
```

### Enable SSL in docker-compose.yml
Uncomment these lines in docker-compose.yml:
```yaml
volumes:
  - ./ssl:/etc/nginx/ssl:ro
  - ./.htpasswd:/etc/nginx/.htpasswd:ro
```

### Update nginx configuration
In `nginx/sites/memorial.conf`, uncomment the HTTPS server block and update the `server_name` to your domain.

The nginx configuration includes both HTTP and HTTPS server blocks with proper SSL configuration and security headers.