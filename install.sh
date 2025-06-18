#!/bin/bash

# SecureChat Installation Script for Ubuntu
# Maintained by Neo Aurora | https://github.com/neoauroraproject/chatroom

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
    echo -e "${YELLOW}⚠️ Warning: You are running this script as root. Proceeding with caution.${NC}"
    echo -e "${YELLOW}ℹ️  It's recommended to use a non-root user with sudo privileges.${NC}"
    sleep 2
fi

# Check for sudo
if ! command -v sudo &> /dev/null; then
    echo -e "${RED}❌ sudo is required but not installed${NC}"
    exit 1
fi

# Check Ubuntu
if ! lsb_release -d | grep -q "Ubuntu"; then
    echo -e "${RED}❌ This script is for Ubuntu only${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ubuntu detected${NC}"

# Update packages
echo -e "${YELLOW}📦 Updating system...${NC}"
sudo apt update

# Install packages
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
sudo apt install -y curl wget gnupg2 software-properties-common nginx ufw

# Install Node.js if not available
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Node.js 18...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo -e "${GREEN}✅ Node: $(node -v), npm: $(npm -v)${NC}"

# Create service user
if ! id "$SERVICE_USER" &>/dev/null; then
    echo -e "${YELLOW}👤 Creating user $SERVICE_USER...${NC}"
    sudo useradd --system --shell /bin/false --home-dir $APP_DIR --create-home $SERVICE_USER
else
    echo -e "${GREEN}✅ User $SERVICE_USER exists${NC}"
fi

# Copy files
echo -e "${YELLOW}📁 Copying application files...${NC}"
sudo mkdir -p $APP_DIR
sudo cp -r . $APP_DIR/
sudo chown -R $SERVICE_USER:$SERVICE_USER $APP_DIR

# Install dependencies
cd $APP_DIR
sudo -u $SERVICE_USER npm install
sudo -u $SERVICE_USER npm run build || true

# Configure master key
echo ""
echo -e "${BLUE}🔐 Master Password Configuration${NC}"
echo ""

while true; do
    echo -e "${BLUE}Choose an option:${NC}"
    echo "1) Set master password now"
    echo "2) Use default password (SecureChat2024)"
    echo "3) Configure on first run"
    echo ""
    read -p "Enter choice (1-3): " choice

    case $choice in
        1)
            while true; do
                read -s -p "Enter master password: " master_password
                echo ""
                [ ${#master_password} -lt 8 ] && echo -e "${RED}Password too short!${NC}" && continue
                read -s -p "Confirm password: " confirm
                echo ""
                [ "$master_password" != "$confirm" ] && echo -e "${RED}Passwords do not match!${NC}" && continue
                break
            done
            sudo sed -i "s/const MASTER_PASSWORD = 'SecureChat2024';/const MASTER_PASSWORD = '$master_password';/" $APP_DIR/src/utils/auth.ts
            sudo -u $SERVICE_USER npm run build
            break
            ;;
        2)
            echo -e "${GREEN}Using default password: SecureChat2024${NC}"
            break
            ;;
        3)
            echo -e "${YELLOW}Configure on first run${NC}"
            break
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            ;;
    esac
done

# Create systemd service
echo -e "${YELLOW}⚙️  Creating systemd service...${NC}"
sudo tee /etc/systemd/system/$APP_NAME.service > /dev/null <<EOF
[Unit]
Description=SecureChat Local Server
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port $SERVICE_PORT
Restart=always
Environment=NODE_ENV=production
SyslogIdentifier=$APP_NAME

[Install]
WantedBy=multi-user.target
EOF

# Nginx reverse proxy
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
sudo tee $NGINX_AVAILABLE/$APP_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name localhost $(hostname -I | awk '{print $1}');

    location / {
        proxy_pass http://127.0.0.1:$SERVICE_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

sudo ln -sf $NGINX_AVAILABLE/$APP_NAME $NGINX_ENABLED/
sudo rm -f $NGINX_ENABLED/default
sudo nginx -t && sudo systemctl reload nginx

# UFW config
echo -e "${YELLOW}🔥 Setting up firewall...${NC}"
sudo ufw --force enable
sudo ufw allow 22
sudo ufw allow 80

# Start services
sudo systemctl daemon-reload
sudo systemctl enable $APP_NAME
sudo systemctl start $APP_NAME

# Management scripts
echo -e "${YELLOW}🛠 Creating management commands...${NC}"
for action in start stop restart status logs; do
  sudo tee /usr/local/bin/securechat-$action > /dev/null <<EOF
#!/bin/bash
sudo systemctl $action $APP_NAME
EOF
  sudo chmod +x /usr/local/bin/securechat-$action
done

# Output
SERVER_IP=$(hostname -I | awk '{print $1}')
echo ""
echo -e "${GREEN}✅ Installation Complete${NC}"
echo ""
echo -e "${BLUE}📍 Access URLs:${NC}"
echo "   http://localhost"
echo "   http://$SERVER_IP"
echo ""
echo -e "${BLUE}🔧 Commands:${NC}"
echo "   securechat-start, securechat-stop, securechat-restart, securechat-status, securechat-logs"
echo ""
echo -e "${GREEN}🎉 SecureChat is now running!${NC}"
