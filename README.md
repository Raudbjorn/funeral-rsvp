# Funeral Service RSVP & Carpool App

A secure web application for organizing RSVPs, carpool coordination, and photo sharing for a funeral service.

## 🚀 Quick Deploy Options

### Option 1: Direct VPS Deployment
```bash
./deploy.sh
```

### Option 2: GitHub Actions (Recommended)
```bash
# Setup GitHub secrets
./scripts/setup-github-secrets.sh username/repository-name

# Push to trigger deployment
git push origin main
```

## ✨ Features

- **RSVP System**: Guest count tracking with optional messages
- **Carpool Coordination**: Driver registration and passenger matching  
- **Photo Album**: Share memories with upload functionality
- **Security**: Rate limiting, spam detection, geographic restrictions
- **Admin Dashboard**: Complete management interface via Tailscale
- **Internationalization**: English/Icelandic support
- **Mobile Optimized**: Touch-friendly responsive design

## 🛡️ Security & Admin Features

### Admin Interfaces (Tailscale-only access)
- **App Admin**: RSVP & content management
- **CrowdSec Dashboard**: Real-time security monitoring
- **Redis Commander**: Database management
- **System Monitoring**: Performance metrics (Netdata)
- **Container Management**: Docker administration (Portainer)
- **Live Logs**: Real-time log streaming (Dozzle)
- **File Manager**: Upload/backup management

### Access Methods
1. **Native Tailscale**: `memorial-admin.cougar-cloud.ts.net/*`
2. **Split DNS**: `admin.joi.taxi`, `files.joi.taxi`, etc. (requires Tailscale DNS setup)

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## 📦 Production Stack

- **Next.js 15**: React application framework
- **Redis**: Rate limiting and session storage
- **Nginx**: Reverse proxy with SSL
- **CrowdSec**: Intrusion detection/prevention
- **Tailscale**: Secure admin network access
- **Docker Compose**: Container orchestration
- **Certbot**: Automatic SSL certificates
- **Monitoring**: Netdata, Portainer, Dozzle

## 🌐 Deployment Targets

- **VPS**: Your server IP address
- **Domain**: Your domain name
- **Admin Access**: Tailscale network required

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md) - Complete setup instructions
- [GitHub Actions Setup](scripts/setup-github-secrets.sh) - Automated deployment
- [Split DNS Setup](scripts/setup-split-dns.sh) - Alternative admin access

## 🔍 Quick Commands

```bash
# Deploy to VPS
./deploy.sh

# Update existing deployment  
./scripts/quick-deploy.sh

# View logs
./scripts/logs.sh [service-name]

# Backup data
./scripts/backup.sh

# Setup GitHub automation
./scripts/setup-github-secrets.sh username/repo
```

## 🆘 Support & Monitoring

- **Health Check**: `curl https://your-domain.com/api/health`
- **Container Status**: `docker-compose ps`
- **Live Logs**: Admin dashboard or `./scripts/logs.sh`
- **SSH Access**: `ssh your-user@your-server-ip`

---

Built with ❤️ for remembering those we've lost.