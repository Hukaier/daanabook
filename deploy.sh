#!/bin/bash

# 答案之书一键部署脚本
# 适用于Ubuntu/Debian系统

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_DIR="/var/www/daanabook"
REPO_URL="https://github.com/Hukaier/daanabook.git"
APP_NAME="wisdom-book"
APP_PORT=3000

echo -e "${GREEN}🚀 开始部署答案之书项目...${NC}"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用sudo运行此脚本${NC}"
    exit 1
fi

# 1. 更新系统
echo -e "${YELLOW}📦 更新系统包...${NC}"
apt update && apt upgrade -y

# 2. 安装必要的软件
echo -e "${YELLOW}📦 安装Git, Node.js, Nginx...${NC}"
apt install -y git curl nginx

# 3. 安装Node.js
echo -e "${YELLOW}📦 安装Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# 4. 创建项目目录
echo -e "${YELLOW}📁 创建项目目录...${NC}"
mkdir -p /var/www
cd /var/www

# 5. 克隆或更新项目
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}🔄 更新项目...${NC}"
    cd "$PROJECT_DIR"
    git pull origin main
else
    echo -e "${YELLOW}📥 克隆项目...${NC}"
    git clone "$REPO_URL" daanabook
    cd "$PROJECT_DIR"
fi

# 6. 安装依赖
echo -e "${YELLOW}📦 安装项目依赖...${NC}"
npm install
cd client && npm install
cd ..

# 7. 构建前端
echo -e "${YELLOW}🔨 构建前端项目...${NC}"
cd client
npm run build
cd ..

# 8. 安装PM2
echo -e "${YELLOW}📦 安装PM2...${NC}"
npm install -g pm2

# 9. 创建PM2配置
echo -e "${YELLOW}⚙️ 创建PM2配置...${NC}"
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'demo.js',
    cwd: '$PROJECT_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $APP_PORT
    }
  }]
};
EOF

# 10. 启动应用
echo -e "${YELLOW}🚀 启动应用...${NC}"
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 11. 配置Nginx
echo -e "${YELLOW}⚙️ 配置Nginx...${NC}"
cat > /etc/nginx/sites-available/daanabook << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 启用Nginx站点
ln -sf /etc/nginx/sites-available/daanabook /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx

# 12. 配置防火墙
echo -e "${YELLOW}🔥 配置防火墙...${NC}"
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow $APP_PORT
ufw --force enable

# 13. 设置权限
echo -e "${YELLOW}🔐 设置文件权限...${NC}"
chown -R www-data:www-data "$PROJECT_DIR"
chmod -R 755 "$PROJECT_DIR"

# 获取服务器IP
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "localhost")

echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}🌐 访问地址: http://$SERVER_IP${NC}"
echo -e "${GREEN}📊 PM2状态: pm2 status${NC}"
echo -e "${GREEN}📝 查看日志: pm2 logs $APP_NAME${NC}"
echo -e "${GREEN}🔄 重启应用: pm2 restart $APP_NAME${NC}"

echo -e "${YELLOW}📋 有用的命令:${NC}"
echo -e "pm2 status          # 查看应用状态"
echo -e "pm2 logs $APP_NAME  # 查看日志"
echo -e "pm2 restart $APP_NAME # 重启应用"
echo -e "systemctl status nginx # 查看Nginx状态"