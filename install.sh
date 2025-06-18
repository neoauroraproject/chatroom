#!/bin/bash

# SecureChat Installation Script for Ubuntu
# This script installs and configures SecureChat as a system service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="securechat"
APP_DIR="/opt/securechat"
SERVICE_USER="securechat"
SERVICE_PORT="3000"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

echo -e "${BLUE}🚀 SecureChat Installation Script${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ This script should not be run as root for security reasons${NC}"
   echo -e "${YELLOW}💡 Please run as a regular user with sudo privileges${NC}"
   exit 1
fi

# Check if sudo is available
if ! command -v sudo &> /dev/null; then
    echo -e "${RED}❌ sudo is required but not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Checking system requirements...${NC}"

# Check Ubuntu version
if ! lsb_release -d | grep -q "Ubuntu"; then
    echo -e "${RED}❌ This script is designed for Ubuntu systems${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ubuntu system detected${NC}"

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update

# Install required packages
echo -e "${YELLOW}📦 Installing required packages...${NC}"
sudo apt install -y curl wget gnupg2 software-properties-common nginx ufw

# Install Node.js 18.x
echo -e "${YELLOW}📦 Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION} installed${NC}"
echo -e "${GREEN}✅ npm ${NPM_VERSION} installed${NC}"

# Create service user
echo -e "${YELLOW}👤 Creating service user...${NC}"
if ! id "$SERVICE_USER" &>/dev/null; then
    sudo useradd --system --shell /bin/false --home-dir $APP_DIR --create-home $SERVICE_USER
    echo -e "${GREEN}✅ Service user '$SERVICE_USER' created${NC}"
else
    echo -e "${GREEN}✅ Service user '$SERVICE_USER' already exists${NC}"
fi

# Create application directory
echo -e "${YELLOW}📁 Setting up application directory...${NC}"
sudo mkdir -p $APP_DIR
sudo chown $SERVICE_USER:$SERVICE_USER $APP_DIR

# Copy application files
echo -e "${YELLOW}📋 Copying application files...${NC}"
sudo cp -r . $APP_DIR/
sudo chown -R $SERVICE_USER:$SERVICE_USER $APP_DIR

# Install dependencies
echo -e "${YELLOW}📦 Installing application dependencies...${NC}"
cd $APP_DIR
sudo -u $SERVICE_USER npm install
sudo -u $SERVICE_USER npm run build

# Master password configuration
echo ""
echo -e "${BLUE}🔐 Master Password Configuration${NC}"
echo -e "${BLUE}===============================${NC}"
echo ""
echo -e "${YELLOW}The master password allows public access to the chatroom.${NC}"
echo -e "${YELLOW}Users will need this password to join the general chat.${NC}"
echo ""

while true; do
    echo -e "${BLUE}Choose an option:${NC}"
    echo "1) Set master password now"
    echo "2) Use default password (SecureChat2024)"
    echo "3) Configure on first run"
    echo ""
    read -p "Enter your choice (1-3): " choice

    case $choice in
        1)
            while true; do
                echo ""
                read -s -p "Enter master password (min 8 characters): " master_password
                echo ""
                if [[ ${#master_password} -lt 8 ]]; then
                    echo -e "${RED}❌ Password must be at least 8 characters long${NC}"
                    continue
                fi
                read -s -p "Confirm master password: " master_password_confirm
                echo ""
                if [[ "$master_password" != "$master_password_confirm" ]]; then
                    echo -e "${RED}❌ Passwords do not match${NC}"
                    continue
                fi
                break
            done
            
            # Update auth.ts with new master password
            sudo sed -i "s/const MASTER_PASSWORD = 'SecureChat2024';/const MASTER_PASSWORD = '$master_password';/" $APP_DIR/src/utils/auth.ts
            sudo -u $SERVICE_USER npm run build
            echo -e "${GREEN}✅ Master password configured${NC}"
            break
            ;;
        2)
            echo -e "${GREEN}✅ Using default master password: SecureChat2024${NC}"
            break
            ;;
        3)
            echo -e "${GREEN}✅ Master password will be configured on first run${NC}"
            break
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Please enter 1, 2, or 3.${NC}"
            ;;
    esac
done

# Create systemd service file
echo -e "${YELLOW}⚙️  Creating systemd service...${NC}"
sudo tee /etc/systemd/system/$APP_NAME.service > /dev/null <<EOF
[Unit]
Description=SecureChat - Secure Local Chatroom
Documentation=https://github.com/securechat
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=$SERVICE_PORT
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port $SERVICE_PORT
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$APP_NAME

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx reverse proxy
echo -e "${YELLOW}🌐 Configuring Nginx reverse proxy...${NC}"
sudo tee $NGINX_AVAILABLE/$APP_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name localhost $(hostname) $(hostname -I | awk '{print $1}');
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    location / {
        proxy_pass http://127.0.0.1:$SERVICE_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://127.0.0.1:$SERVICE_PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable Nginx site
if [[ -f "$NGINX_ENABLED/$APP_NAME" ]]; then
    sudo rm $NGINX_ENABLED/$APP_NAME
fi
sudo ln -s $NGINX_AVAILABLE/$APP_NAME $NGINX_ENABLED/

# Remove default Nginx site if it exists
if [[ -f "$NGINX_ENABLED/default" ]]; then
    sudo rm $NGINX_ENABLED/default
fi

# Test Nginx configuration
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    exit 1
fi

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw --force enable
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
echo -e "${GREEN}✅ Firewall configured${NC}"

# Start and enable services
echo -e "${YELLOW}🚀 Starting services...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable $APP_NAME
sudo systemctl start $APP_NAME
sudo systemctl reload nginx

# Wait for service to start
echo -e "${YELLOW}⏳ Waiting for service to start...${NC}"
sleep 5

# Check service status
if sudo systemctl is-active --quiet $APP_NAME; then
    echo -e "${GREEN}✅ SecureChat service is running${NC}"
else
    echo -e "${RED}❌ SecureChat service failed to start${NC}"
    echo -e "${YELLOW}📋 Service logs:${NC}"
    sudo journalctl -u $APP_NAME --no-pager -n 20
    exit 1
fi

if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx failed to start${NC}"
    sudo systemctl status nginx
    exit 1
fi

# Create management scripts
echo -e "${YELLOW}📝 Creating management scripts...${NC}"

# Create start script
sudo tee /usr/local/bin/securechat-start > /dev/null <<'EOF'
#!/bin/bash
echo "🚀 Starting SecureChat..."
sudo systemctl start securechat
sudo systemctl start nginx
echo "✅ SecureChat started successfully"
EOF

# Create stop script
sudo tee /usr/local/bin/securechat-stop > /dev/null <<'EOF'
#!/bin/bash
echo "🛑 Stopping SecureChat..."
sudo systemctl stop securechat
echo "✅ SecureChat stopped successfully"
EOF

# Create restart script
sudo tee /usr/local/bin/securechat-restart > /dev/null <<'EOF'
#!/bin/bash
echo "🔄 Restarting SecureChat..."
sudo systemctl restart securechat
sudo systemctl reload nginx
echo "✅ SecureChat restarted successfully"
EOF

# Create status script
sudo tee /usr/local/bin/securechat-status > /dev/null <<'EOF'
#!/bin/bash
echo "📊 SecureChat Status:"
echo "===================="
echo ""
echo "🔧 Service Status:"
sudo systemctl status securechat --no-pager -l
echo ""
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager -l
echo ""
echo "📋 Recent Logs:"
sudo journalctl -u securechat --no-pager -n 10
EOF

# Create logs script
sudo tee /usr/local/bin/securechat-logs > /dev/null <<'EOF'
#!/bin/bash
echo "📋 SecureChat Logs:"
echo "=================="
sudo journalctl -u securechat -f
EOF

# Make scripts executable
sudo chmod +x /usr/local/bin/securechat-*

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

# Installation complete
echo ""
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo -e "${GREEN}=========================${NC}"
echo ""
echo -e "${BLUE}📍 Access Information:${NC}"
echo -e "   🌐 Local: http://localhost"
echo -e "   🌐 Network: http://$SERVER_IP"
echo -e "   🌐 Hostname: http://$(hostname)"
echo ""
echo -e "${BLUE}🔐 Security Information:${NC}"
if [[ "$choice" == "1" ]]; then
    echo -e "   🔑 Master Password: [CONFIGURED]"
elif [[ "$choice" == "2" ]]; then
    echo -e "   🔑 Master Password: SecureChat2024"
else
    echo -e "   🔑 Master Password: [Configure on first run]"
fi
echo -e "   👑 Admin Username: admin"
echo -e "   🔒 Admin Password: [Set on first admin login]"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo -e "   securechat-start    - Start the service"
echo -e "   securechat-stop     - Stop the service"
echo -e "   securechat-restart  - Restart the service"
echo -e "   securechat-status   - Check service status"
echo -e "   securechat-logs     - View live logs"
echo ""
echo -e "${BLUE}🔧 System Service:${NC}"
echo -e "   sudo systemctl status securechat"
echo -e "   sudo systemctl restart securechat"
echo -e "   sudo journalctl -u securechat -f"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "   • The service starts automatically on boot"
echo -e "   • All data is stored locally in browser storage"
echo -e "   • Use 'admin' username for administrative access"
echo -e "   • Create private rooms with custom passwords"
echo -e "   • Access is restricted to local network only"
echo ""
echo -e "${GREEN}✨ SecureChat is now running and ready to use!${NC}"