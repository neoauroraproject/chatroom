# SecureChat - Secure Local Chatroom

A beautiful, secure, and feature-rich local chatroom application built with React and TypeScript. Perfect for private team communications, local networks, or secure messaging environments.

## 🌟 Features

### 🔐 **Security First**
- **Offline-first** - No internet connection required
- **Local storage only** - All data stays in browser
- **Multi-level access control** (Admin/Room/Public)
- **Password protection** for rooms and admin access
- **No external dependencies** for core functionality

### 💬 **Rich Messaging**
- **Real-time messaging** with beautiful UI
- **Message reactions** with emoji support
- **Reply to messages** with threading
- **Edit messages** (users can edit their own)
- **Pin important messages** (admin only)
- **Message expiration** with configurable retention
- **Text-to-emoji shortcuts** (`:)` → 😊, `<3` → ❤️)

### 👥 **User Management**
- **Session persistence** - users keep history when returning
- **Online status indicators**
- **Direct messaging** between users
- **User color coding** for easy identification
- **Admin privileges** for room management

### 🏠 **Room System**
- **Create private/public rooms** with passwords
- **Room-specific access control**
- **Custom message retention** per room
- **Room descriptions** and member management
- **Activity tracking** and last seen indicators

### 🎨 **Beautiful Design**
- **Telegram-inspired** modern interface
- **Gradient backgrounds** and smooth animations
- **Responsive design** for all screen sizes
- **Dark/light theme support**
- **Micro-interactions** and hover effects

## 🚀 Quick Start

### Option 1: Automated Installation (Ubuntu)

```bash
# Download and run the installation script
curl -fsSL https://raw.githubusercontent.com/your-repo/securechat/main/install.sh | bash

# Or download first and review
wget https://raw.githubusercontent.com/your-repo/securechat/main/install.sh
chmod +x install.sh
./install.sh
```

### Option 2: Manual Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/securechat.git
cd securechat

# Install dependencies
npm install

# Build the application
npm run build

# Start the development server
npm run dev
```

## 🔧 System Requirements

- **Ubuntu 18.04+** (for automated installation)
- **Node.js 16+**
- **npm 7+**
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🔐 Access Levels

### 🌍 **Public Access**
- Master password: `SecureChat2024` (configurable)
- Access to general chat and public rooms
- Can create and join rooms
- Direct messaging with other users

### 🏠 **Room Access**
- Room-specific password
- Access only to that specific room
- Cannot access general chat or other rooms
- Limited to room members only

### 👑 **Admin Access**
- Username: `admin`
- Custom password (set on first login)
- Full access to all rooms and features
- Can delete messages and manage users
- Configure system settings

## 🛠️ Management Commands

After installation, use these commands to manage SecureChat:

```bash
# Service management
securechat-start     # Start the service
securechat-stop      # Stop the service
securechat-restart   # Restart the service
securechat-status    # Check service status
securechat-logs      # View live logs

# System service commands
sudo systemctl status securechat
sudo systemctl restart securechat
sudo journalctl -u securechat -f
```

## 📁 File Structure

```
securechat/
├── src/
│   ├── components/          # React components
│   │   ├── ChatHeader.tsx   # Header with user info and settings
│   │   ├── ChatInput.tsx    # Message input with emoji support
│   │   ├── ChatMessage.tsx  # Message display with reactions
│   │   ├── ChatRoomsList.tsx # Room management sidebar
│   │   ├── LoginForm.tsx    # Authentication form
│   │   └── UsersList.tsx    # Online users sidebar
│   ├── hooks/
│   │   └── useChat.ts       # Main chat logic hook
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── storage.ts       # Local storage management
│   │   └── time.ts          # Time formatting utilities
│   └── App.tsx              # Main application component
├── install.sh               # Ubuntu installation script
└── README.md               # This file
```

## 🔧 Configuration

### Master Password
The master password can be configured in three ways:
1. **During installation** - Set when running install.sh
2. **Environment variable** - Set `MASTER_PASSWORD` environment variable
3. **Code modification** - Edit `src/utils/auth.ts`

### Admin Settings
- **Message retention** - Configure how long messages are kept
- **Room permissions** - Control who can create rooms
- **User limits** - Set maximum users per room

### Room Settings
- **Private/Public** - Control room visibility
- **Password protection** - Secure room access
- **Message retention** - Custom retention per room
- **Member management** - Add/remove room members

## 🌐 Network Access

By default, SecureChat is accessible on:
- **Local machine**: http://localhost
- **Local network**: http://[server-ip]
- **Custom domain**: Configure in Nginx settings

## 🔒 Security Considerations

### ✅ **Secure by Design**
- All data stored locally in browser
- No external API calls or data transmission
- Password-protected access at multiple levels
- Session management with automatic cleanup

### ⚠️ **Important Notes**
- Data is stored in browser localStorage
- Clearing browser data will remove all messages
- No data recovery mechanism (by design)
- Access limited to local network only

## 🐛 Troubleshooting

### Service Issues
```bash
# Check service status
securechat-status

# View logs
securechat-logs

# Restart service
securechat-restart
```

### Common Problems

**Service won't start:**
```bash
# Check port availability
sudo netstat -tlnp | grep :3000

# Check service logs
sudo journalctl -u securechat -n 50
```

**Can't access from network:**
```bash
# Check firewall
sudo ufw status

# Check Nginx configuration
sudo nginx -t
```

**Permission issues:**
```bash
# Fix file permissions
sudo chown -R securechat:securechat /opt/securechat
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS
- Icons from Lucide React
- Inspired by Telegram's beautiful design

---

**SecureChat** - Secure, Beautiful, Local Chatroom 🚀✨