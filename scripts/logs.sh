#!/bin/bash

# Log viewing script
# Usage: ./scripts/logs.sh [service_name]

SERVER_IP="${SERVER_IP:-YOUR_SERVER_IP}"
SSH_USER="${SSH_USER:-root}"
DEPLOY_DIR="/opt/funeral-service"
SERVICE=${1:-""}

if [[ -z "$SERVICE" ]]; then
    echo "📋 Available services:"
    ssh "${SSH_USER}@${SERVER_IP}" "cd ${DEPLOY_DIR} && docker-compose ps --services"
    echo ""
    echo "📊 All logs:"
    ssh "${SSH_USER}@${SERVER_IP}" "cd ${DEPLOY_DIR} && docker-compose logs --tail=50 -f"
else
    echo "📊 Logs for $SERVICE:"
    ssh "${SSH_USER}@${SERVER_IP}" "cd ${DEPLOY_DIR} && docker-compose logs --tail=50 -f $SERVICE"
fi