# Usage Instructions

## 🚀 Setting Up Your Own Deployment

This repository is now configured as a template. To use it for your own funeral service:

### 1. Set Environment Variables

Before running any scripts, set these environment variables:

```bash
export SERVER_IP="your.server.ip.address"
export SSH_USER="your-ssh-user"  # typically 'root' 
export DOMAIN_NAME="your-domain.com"
```

### 2. Direct VPS Deployment

```bash
# Set your server details
export SERVER_IP="1.2.3.4"
export SSH_USER="root"
export DOMAIN_NAME="example.com"

# Run deployment
./deploy.sh
```

### 3. GitHub Actions Deployment

```bash
# Set up GitHub repository secrets
./scripts/setup-github-secrets.sh username/repository-name

# The script will guide you through setting up all required secrets
```

### 4. Required GitHub Secrets

When using GitHub Actions, configure these secrets in your repository:

- `SSH_PRIVATE_KEY` - Your SSH private key
- `SSH_USER` - SSH username (typically 'root')
- `SERVER_IP` - Your server IP address
- `DOMAIN_NAME` - Your domain name
- `REDIS_PASSWORD` - Strong password for Redis
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `NEXT_PUBLIC_OPENWEATHER_API_KEY` - OpenWeather API key

### 5. DNS Configuration

Point your domain DNS records to your server:

```
A    your-domain.com       YOUR_SERVER_IP
A    www.your-domain.com   YOUR_SERVER_IP
```

### 6. Basic Auth Setup

Secure the admin interface:

```bash
# Create basic auth credentials
htpasswd -c .htpasswd admin

# The password will be prompted
# This file should be mounted in nginx container
```

## 📝 Environment Variable Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVER_IP` | Your VPS IP address | `203.0.113.10` |
| `SSH_USER` | SSH username | `root` or `ubuntu` |
| `DOMAIN_NAME` | Your domain name | `memorial.example.com` |
| `REDIS_PASSWORD` | Strong Redis password | Generate with `openssl rand -hex 32` |

## 🔧 Customization

### Update Application Content

1. Edit text content in `src/lib/i18n.ts`
2. Update colors in `tailwind.config.ts`
3. Modify layout in `src/app/page.tsx`

### Change Domain References

The application will automatically use your `DOMAIN_NAME` environment variable. No hardcoded domains remain in the code.

### Add Languages

1. Add new language to `src/lib/i18n.ts`
2. Add translations for all text strings
3. Update language toggle component

## 🛡️ Security Notes

- All sensitive data should be in environment variables or GitHub Secrets
- Never commit API keys, passwords, or server details to version control
- Use strong passwords for Redis and other services
- Keep your basic auth credentials secure
- Store .htpasswd file safely and mount it in nginx

## 📞 Support

For issues with the template:
1. Check environment variables are set correctly
2. Verify DNS configuration
3. Ensure SSH access to your server
4. Check GitHub Actions logs for deployment issues