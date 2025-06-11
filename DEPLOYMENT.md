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

### 🔒 Admin Interfaces (Tailscale Only)
- **App Admin**: https://memorial-admin.cougar-cloud.ts.net/admin
- **CrowdSec Security**: https://memorial-admin.cougar-cloud.ts.net/crowdsec
- **Redis Database**: https://memorial-admin.cougar-cloud.ts.net/redis  
- **System Monitoring**: https://memorial-admin.cougar-cloud.ts.net/monitoring
- **Container Management**: https://memorial-admin.cougar-cloud.ts.net/containers
- **Live Logs**: https://memorial-admin.cougar-cloud.ts.net/logs
- **File Manager**: https://memorial-admin.cougar-cloud.ts.net/files

## DNS Configuration

Point your domain to the server:
```
A    your-domain.com       YOUR_SERVER_IP
A    www.your-domain.com   YOUR_SERVER_IP
```

## 🔐 Security Features

### Admin Access Protection
- All admin interfaces are **only accessible via Tailscale**
- Public access to `/admin` paths is **automatically blocked** by nginx
- Requires joining your Tailscale network to access any admin features

### What Each Admin Interface Provides
- **App Admin**: RSVP management, content moderation
- **CrowdSec Security**: Real-time threat monitoring, IP bans, attack statistics
- **Redis Database**: View cache, rate limiting data, session management
- **System Monitoring**: CPU, memory, disk, network usage with real-time graphs
- **Container Management**: Start/stop/restart containers, view container stats
- **Live Logs**: Real-time streaming logs from all services
- **File Manager**: Browse uploaded photos, data files, backups with web interface

## 🌐 Split DNS Option (Alternative Admin Access)

For cleaner domain names, you can optionally use split DNS:

### Setup Split DNS
```bash
./scripts/setup-split-dns.sh
```

This provides alternative admin URLs:
- **admin.your-domain.com** → App Admin Panel
- **files.your-domain.com** → File Manager  
- **logs.your-domain.com** → Live Logs
- **redis.your-domain.com** → Redis Database
- **crowdsec.your-domain.com** → Security Dashboard
- **containers.your-domain.com** → Container Management
- **monitoring.your-domain.com** → System Monitoring

### How Split DNS Works
1. **Tailscale IP auto-detected** during deployment (e.g., 100.64.x.x)
2. **SSL certificates generated** for all admin subdomains
3. **Nginx configured** to route subdomains to services
4. **DNS records added** to Tailscale (manual step)
5. **Access restricted** to Tailscale IP ranges only

### Security Benefits
- **Zero public DNS pollution** - domains don't exist publicly
- **Tailscale-only resolution** - complete network isolation
- **Automatic SSL certificates** via Let's Encrypt
- **IP range validation** at nginx level