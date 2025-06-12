#!/bin/bash

# Simplified Deployment Script for Funeral Service App
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
mkdir -p data nginx/sites public/uploads

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
apt-get install -y fail2ban apache2-utils

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

# Create basic auth file
create_basic_auth() {
    log_info "Setting up basic authentication..."
    
    ssh "${SSH_USER}@${SERVER_IP}" << EOF
cd ${DEPLOY_DIR}

# Create basic auth file
echo "Creating admin user for basic authentication..."
echo "Please enter a password for the admin user:"
htpasswd -c .htpasswd admin

chmod 644 .htpasswd

EOF
    
    log_info "Basic authentication configured."
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

EOF
    
    log_info "Application deployed successfully."
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for services to be ready
    sleep 60
    
    if curl -f -s "http://${SERVER_IP}:3000" > /dev/null; then
        log_info "✅ HTTP endpoint is accessible"
    else
        log_warn "❌ HTTP endpoint is not accessible"
    fi
    
    ssh "${SSH_USER}@${SERVER_IP}" << EOF
cd ${DEPLOY_DIR}

echo "🔍 Container Status:"
docker-compose ps

echo ""
echo "📊 Service Health:"
docker-compose exec -T app curl -f http://localhost:3000/api/health || echo "App health check failed"
docker-compose exec -T redis redis-cli -a "\$REDIS_PASSWORD" ping || echo "Redis health check failed"

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
    create_basic_auth
    deploy_application
    health_check
    
    log_info "🎉 Deployment completed successfully!"
    log_info "Your application should be available at:"
    log_info "  HTTP:  http://${SERVER_IP}:3000"
    log_info ""
    log_info "🔒 Admin interface:"
    log_info "  App Admin:    http://${SERVER_IP}:3000/admin (basic auth required)"
    
    log_info "Next steps:"
    echo "  1. Update your DNS records to point ${DOMAIN_NAME} to ${SERVER_IP}"
    echo "  2. Use the admin username/password you created to access /admin"
    echo "  3. Monitor logs with: ssh ${SSH_USER}@${SERVER_IP} 'cd ${DEPLOY_DIR} && docker-compose logs -f'"
}

# Run main function
main "$@"