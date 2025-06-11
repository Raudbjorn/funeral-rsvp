#!/bin/bash

# Automated Deployment Script for Funeral Service App
# Usage: ./deploy.sh [server_ip] [ssh_user]

set -euo pipefail

# Configuration
SERVER_IP=${1:-"${SERVER_IP:-YOUR_SERVER_IP}"}
SSH_USER=${2:-"${SSH_USER:-root}"}
APP_NAME="funeral-service"
DEPLOY_DIR="/opt/${APP_NAME}"
DOMAIN_NAME="${DOMAIN_NAME:-YOUR_DOMAIN}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v ssh &> /dev/null; then
        log_error "SSH client not found. Please install OpenSSH client."
        exit 1
    fi
    
    if ! command -v rsync &> /dev/null; then
        log_warn "rsync not found. Will use scp instead (slower)."
        USE_RSYNC=false
    else
        USE_RSYNC=true
    fi
    
    if [[ ! -f ".env.production" ]]; then
        log_error ".env.production file not found. Please create it with your environment variables."
        exit 1
    fi
    
    log_info "Prerequisites check completed."
}

# Test SSH connection
test_ssh_connection() {
    log_info "Testing SSH connection to ${SSH_USER}@${SERVER_IP}..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "${SSH_USER}@${SERVER_IP}" exit 2>/dev/null; then
        log_info "SSH connection successful."
    else
        log_error "Cannot connect to server. Please check:"
        echo "  1. Server IP: ${SERVER_IP}"
        echo "  2. SSH user: ${SSH_USER}"
        echo "  3. SSH key authentication is set up"
        echo "  4. Server is running and accessible"
        exit 1
    fi
}

# Install Docker on server
install_docker() {
    log_info "Installing Docker on server..."
    
    ssh "${SSH_USER}@${SERVER_IP}" << 'EOF'
# Update system
apt-get update

# Install prerequisites
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Docker Compose standalone
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Verify installation
docker --version
docker-compose --version
EOF
    
    log_info "Docker installation completed."
}

# Prepare server environment
prepare_server() {
    log_info "Preparing server environment..."
    
    ssh "${SSH_USER}@${SERVER_IP}" << EOF
# Create application directory
mkdir -p ${DEPLOY_DIR}
cd ${DEPLOY_DIR}

# Create required directories
mkdir -p data nginx/sites nginx/ssl certbot crowdsec promtail tailscale public/uploads

# Set proper permissions
chmod 755 ${DEPLOY_DIR}
chown -R 1000:1000 ${DEPLOY_DIR}/data ${DEPLOY_DIR}/public

# Install firewall rules
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Install fail2ban for additional security
apt-get update
apt-get install -y fail2ban

# Configure fail2ban
cat > /etc/fail2ban/jail.local << 'FAIL2BAN_EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
FAIL2BAN_EOF

systemctl enable fail2ban
systemctl restart fail2ban
EOF
    
    log_info "Server environment prepared."
}

# Upload application files
upload_files() {
    log_info "Uploading application files..."
    
    # Create temporary directory for deployment files
    TEMP_DIR=$(mktemp -d)
    
    # Copy necessary files
    cp -r . "${TEMP_DIR}/"
    cd "${TEMP_DIR}"
    
    # Remove unnecessary files
    rm -rf node_modules .next .git .claude
    
    # Upload files
    if [[ "${USE_RSYNC}" == "true" ]]; then
        rsync -avz --delete \
            --exclude 'node_modules' \
            --exclude '.next' \
            --exclude '.git' \
            --exclude '.claude' \
            . "${SSH_USER}@${SERVER_IP}:${DEPLOY_DIR}/"
    else
        scp -r . "${SSH_USER}@${SERVER_IP}:${DEPLOY_DIR}/"
    fi
    
    # Clean up
    rm -rf "${TEMP_DIR}"
    
    log_info "Files uploaded successfully."
}

# Configure Nginx
configure_nginx() {
    log_info "Configuring Nginx..."
    
    ssh "${SSH_USER}@${SERVER_IP}" << EOF
cd ${DEPLOY_DIR}

# Create main nginx configuration
cat > nginx/nginx.conf << 'NGINX_MAIN_EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;
    
    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Security
    server_tokens off;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;
    
    # Include site configurations
    include /etc/nginx/sites-available/*.conf;
}
NGINX_MAIN_EOF

# Create site configuration
cat > nginx/sites/${DOMAIN_NAME}.conf << 'NGINX_SITE_EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name joi.taxi www.joi.taxi;
    
    # Allow Certbot challenges
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name joi.taxi www.joi.taxi;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/joi.taxi/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/joi.taxi/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # Block admin endpoints unless coming from Tailscale
    location /admin {
        # Check for Tailscale headers or localhost access
        set \$allowed 0;
        
        # Allow if coming from Tailscale (has specific headers)
        if (\$http_x_tailscale_user) {
            set \$allowed 1;
        }
        
        # Allow localhost for development
        if (\$remote_addr = "127.0.0.1") {
            set \$allowed 1;
        }
        
        # Block if not allowed
        if (\$allowed = 0) {
            return 403 "Admin access restricted to Tailscale network";
        }
        
        proxy_pass http://app:3000/admin;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Proxy to Next.js app
    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
    
    # API rate limiting
    location /api/ {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Stricter rate limiting for API
        limit_req zone=api burst=10 nodelay;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        proxy_pass http://app:3000;
        proxy_cache_valid 200 1d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_SITE_EOF

EOF
    
    log_info "Nginx configuration created."
}

# Configure CrowdSec
configure_crowdsec() {
    log_info "Configuring CrowdSec..."
    
    ssh "${SSH_USER}@${SERVER_IP}" << EOF
cd ${DEPLOY_DIR}

# Create CrowdSec acquisition configuration
cat > crowdsec/acquis.yaml << 'CROWDSEC_EOF'
filenames:
  - /var/log/nginx/*log
labels:
  type: nginx
---
filenames:
  - /var/log/auth.log
labels:
  type: syslog
CROWDSEC_EOF

EOF
    
    log_info "CrowdSec configuration created."
}

# Configure Certbot
configure_certbot() {
    log_info "Configuring Certbot..."
    
    ssh "${SSH_USER}@${SERVER_IP}" << EOF
cd ${DEPLOY_DIR}

# Create Porkbun credentials file
cat > certbot/porkbun.ini << 'CERTBOT_EOF'
dns_porkbun_api_key = \$(grep PORKBUN_API_KEY .env.production | cut -d= -f2)
dns_porkbun_secret_key = \$(grep PORKBUN_SECRET_KEY .env.production | cut -d= -f2)
CERTBOT_EOF

chmod 600 certbot/porkbun.ini

EOF
    
    log_info "Certbot configuration created."
}

# Configure Tailscale
configure_tailscale() {
    log_info "Configuring Tailscale..."
    
    ssh "${SSH_USER}@${SERVER_IP}" << EOF
cd ${DEPLOY_DIR}

# Create Tailscale serve configuration
cat > tailscale/serve.json << 'TAILSCALE_EOF'
{
  "TCP": {
    "443": {
      "HTTPS": true
    },
    "80": {
      "HTTP": true
    }
  },
  "Web": {
    "memorial-admin.cougar-cloud.ts.net:443": {
      "Handlers": {
        "/admin": {
          "Proxy": "http://app:3000/admin"
        },
        "/crowdsec": {
          "Proxy": "http://crowdsec-dashboard:3000"
        },
        "/redis": {
          "Proxy": "http://redis-commander:8081"
        },
        "/monitoring": {
          "Proxy": "http://127.0.0.1:19999"
        },
        "/containers": {
          "Proxy": "http://portainer:9000"
        },
        "/logs": {
          "Proxy": "http://dozzle:8080"
        },
        "/files": {
          "Proxy": "http://filebrowser:80"
        }
      }
    }
  }
}
TAILSCALE_EOF

EOF
    
    log_info "Tailscale configuration created."
}

# Configure admin services
configure_admin_services() {
    log_info "Configuring admin services..."
    
    ssh "${SSH_USER}@${SERVER_IP}" << EOF
cd ${DEPLOY_DIR}

# Create filebrowser configuration
cat > filebrowser.json << 'FILEBROWSER_EOF'
{
  "port": 80,
  "baseURL": "",
  "address": "",
  "log": "stdout",
  "database": "/database.db",
  "root": "/srv"
}
FILEBROWSER_EOF

# Create directory structure for admin services
mkdir -p backups
chmod 755 backups

EOF
    
    log_info "Admin services configured."
}

# Configure split DNS nginx
configure_split_dns_nginx() {
    local tailscale_ip="$1"
    log_info "Configuring split DNS nginx for Tailscale IP: $tailscale_ip"
    
    ssh "${SSH_USER}@${SERVER_IP}" << EOF
cd ${DEPLOY_DIR}

# Create split DNS nginx site configuration
cat > nginx/sites/split-dns.conf << 'SPLIT_DNS_EOF'
# Split DNS configuration for admin subdomains
# These resolve to Tailscale IPs only within the tailnet

server {
    listen 443 ssl http2;
    server_name admin.joi.taxi files.joi.taxi logs.joi.taxi redis.joi.taxi crowdsec.joi.taxi containers.joi.taxi monitoring.joi.taxi;
    
    # SSL configuration (same as main domain)
    ssl_certificate /etc/letsencrypt/live/joi.taxi/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/joi.taxi/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Route based on server name
    location / {
        # Verify request comes from Tailscale network
        set \$allowed 0;
        
        # Allow Tailscale IP ranges
        if (\$remote_addr ~ "^100\.64\.") {
            set \$allowed 1;
        }
        if (\$remote_addr ~ "^100\.100\.") {
            set \$allowed 1;
        }
        if (\$remote_addr = "127.0.0.1") {
            set \$allowed 1;
        }
        
        if (\$allowed = 0) {
            return 403 "Access restricted to Tailscale network";
        }
        
        # Route to appropriate service based on subdomain
        if (\$server_name = "admin.joi.taxi") {
            proxy_pass http://app:3000/admin;
        }
        if (\$server_name = "files.joi.taxi") {
            proxy_pass http://filebrowser:80;
        }
        if (\$server_name = "logs.joi.taxi") {
            proxy_pass http://dozzle:8080;
        }
        if (\$server_name = "redis.joi.taxi") {
            proxy_pass http://redis-commander:8081;
        }
        if (\$server_name = "crowdsec.joi.taxi") {
            proxy_pass http://crowdsec-dashboard:3000;
        }
        if (\$server_name = "containers.joi.taxi") {
            proxy_pass http://portainer:9000;
        }
        if (\$server_name = "monitoring.joi.taxi") {
            proxy_pass http://127.0.0.1:19999;
        }
        
        # Default proxy headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=10 nodelay;
    }
}

# HTTP redirect for admin subdomains
server {
    listen 80;
    server_name admin.joi.taxi files.joi.taxi logs.joi.taxi redis.joi.taxi crowdsec.joi.taxi containers.joi.taxi monitoring.joi.taxi;
    
    # Allow Certbot challenges
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
SPLIT_DNS_EOF

EOF
    
    log_info "Split DNS nginx configuration created"
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."
    
    ssh "${SSH_USER}@${SERVER_IP}" << EOF
cd ${DEPLOY_DIR}

# Load environment variables
export \$(cat .env.production | xargs)

# Stop existing containers
docker-compose down --remove-orphans || true

# Build and start services
docker-compose up --build -d

# Wait for services to start
sleep 30

# Generate CrowdSec API keys
BOUNCER_KEY=\$(docker-compose exec -T crowdsec cscli bouncers add nginx-bouncer -o raw)
DASHBOARD_KEY=\$(docker-compose exec -T crowdsec cscli bouncers add dashboard -o raw)
echo "CROWDSEC_BOUNCER_API_KEY=\${BOUNCER_KEY}" >> .env.production
echo "CROWDSEC_DASHBOARD_API_KEY=\${DASHBOARD_KEY}" >> .env.production

# Restart services with the new keys
docker-compose restart crowdsec-nginx-bouncer crowdsec-dashboard

# Detect Tailscale IP and configure split DNS
sleep 10  # Wait for Tailscale to be ready
TAILSCALE_IP=\$(docker-compose exec -T tailscale tailscale ip -4 | head -1 | tr -d '\r\n')
if [[ -n "\$TAILSCALE_IP" && "\$TAILSCALE_IP" =~ ^100\.64\. ]]; then
    echo "TAILSCALE_IP=\$TAILSCALE_IP" >> .env.production
    log_info "Detected Tailscale IP: \$TAILSCALE_IP"
    
    # Configure split DNS nginx config
    if grep -q "ENABLE_SPLIT_DNS=true" .env.production; then
        configure_split_dns_nginx "\$TAILSCALE_IP"
    fi
else
    log_warn "Could not detect Tailscale IP or not in expected range"
fi

# Initialize SSL certificate
CERT_DOMAINS="-d ${DOMAIN_NAME} -d www.${DOMAIN_NAME}"

# Add admin subdomains if split DNS is enabled
if grep -q "ENABLE_SPLIT_DNS=true" .env.production; then
    SUBDOMAINS=\$(grep ADMIN_SUBDOMAINS .env.production | cut -d= -f2 | tr ',' ' ')
    for subdomain in \$SUBDOMAINS; do
        CERT_DOMAINS="\$CERT_DOMAINS -d \$subdomain.${DOMAIN_NAME}"
    done
    log_info "Including admin subdomains in SSL certificate: \$SUBDOMAINS"
fi

docker-compose run --rm certbot certonly \
    --dns-porkbun \
    --dns-porkbun-credentials /etc/certbot/porkbun.ini \
    --email admin@${DOMAIN_NAME} \
    --agree-tos \
    --non-interactive \
    \$CERT_DOMAINS

# Reload nginx with SSL
docker-compose restart nginx

EOF
    
    log_info "Application deployed successfully."
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for services to be ready
    sleep 60
    
    if curl -f -s "http://${SERVER_IP}" > /dev/null; then
        log_info "✅ HTTP endpoint is accessible"
    else
        log_warn "❌ HTTP endpoint is not accessible"
    fi
    
    if curl -f -s -k "https://${DOMAIN_NAME}" > /dev/null; then
        log_info "✅ HTTPS endpoint is accessible"
    else
        log_warn "❌ HTTPS endpoint is not accessible"
    fi
    
    ssh "${SSH_USER}@${SERVER_IP}" << EOF
cd ${DEPLOY_DIR}

echo "🔍 Container Status:"
docker-compose ps

echo ""
echo "📊 Service Health:"
docker-compose exec -T app curl -f http://localhost:3000/api/health || echo "App health check failed"
docker-compose exec -T redis redis-cli ping || echo "Redis health check failed"
docker-compose exec -T nginx nginx -t || echo "Nginx config test failed"

EOF
}

# Main deployment flow
main() {
    log_info "Starting deployment to ${SERVER_IP}..."
    
    check_prerequisites
    test_ssh_connection
    install_docker
    prepare_server
    upload_files
    configure_nginx
    configure_crowdsec
    configure_certbot
    configure_tailscale
    configure_admin_services
    deploy_application
    health_check
    
    log_info "🎉 Deployment completed successfully!"
    log_info "Your application should be available at:"
    log_info "  HTTP:  http://${SERVER_IP}"
    log_info "  HTTPS: https://${DOMAIN_NAME}"
    log_info ""
    log_info "🔒 Admin interfaces (Tailscale only):"
    log_info "  App Admin:    https://memorial-admin.cougar-cloud.ts.net/admin"
    log_info "  CrowdSec:     https://memorial-admin.cougar-cloud.ts.net/crowdsec"
    log_info "  Redis:        https://memorial-admin.cougar-cloud.ts.net/redis"
    log_info "  Monitoring:   https://memorial-admin.cougar-cloud.ts.net/monitoring"
    log_info "  Containers:   https://memorial-admin.cougar-cloud.ts.net/containers"
    log_info "  Logs:         https://memorial-admin.cougar-cloud.ts.net/logs"
    log_info "  Files:        https://memorial-admin.cougar-cloud.ts.net/files"
    
    log_info "Next steps:"
    echo "  1. Update your DNS records to point ${DOMAIN_NAME} to ${SERVER_IP}"
    echo "  2. Join your Tailscale network to access admin features"
    echo "  3. For split DNS admin domains, run: ./scripts/setup-split-dns.sh"
    echo "  4. Monitor logs with: ssh ${SSH_USER}@${SERVER_IP} 'cd ${DEPLOY_DIR} && docker-compose logs -f'"
}

# Run main function
main "$@"