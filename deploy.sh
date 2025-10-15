#!/bin/bash

# 像素拼图墙部署脚本

set -e  # 遇到错误立即退出

PROJECT_DIR="/home/ubuntu/pixel-art-wall"
SERVICE_NAME="pixel-art-wall"

echo "=========================================="
echo "开始部署像素拼图墙"
echo "=========================================="

# 1. 创建项目目录（如果不存在）
if [ ! -d "$PROJECT_DIR" ]; then
    echo "✅ 创建项目目录: $PROJECT_DIR"
    mkdir -p "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# 2. 安装 Python 依赖
echo "✅ 安装 Python 依赖..."
pip3 install --upgrade pip
pip3 install -r requirements.txt

# 3. 创建必要的目录
echo "✅ 创建上传目录..."
mkdir -p static/uploads/{heart,plane,balloon}

# 4. 初始化数据库
echo "✅ 初始化数据库..."
python3 src/app.py &
sleep 3
pkill -f "python3 src/app.py" || true

# 5. 创建 systemd 服务文件
echo "✅ 创建 systemd 服务..."
sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=Pixel Art Wall Flask Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/python3 $PROJECT_DIR/src/app.py
Restart=always
RestartSec=3
Environment="PYTHONUNBUFFERED=1"

[Install]
WantedBy=multi-user.target
EOF

# 6. 重载 systemd 并启动服务
echo "✅ 启动服务..."
sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}
sudo systemctl restart ${SERVICE_NAME}

# 7. 检查服务状态
sleep 2
if sudo systemctl is-active --quiet ${SERVICE_NAME}; then
    echo ""
    echo "=========================================="
    echo "✅ 部署成功！"
    echo "=========================================="
    echo "服务名称: ${SERVICE_NAME}"
    echo "服务状态: $(sudo systemctl is-active ${SERVICE_NAME})"
    echo "访问地址: http://$(hostname -I | awk '{print $1}'):5000"
    echo ""
    echo "常用命令："
    echo "  查看日志: sudo journalctl -u ${SERVICE_NAME} -f"
    echo "  重启服务: sudo systemctl restart ${SERVICE_NAME}"
    echo "  停止服务: sudo systemctl stop ${SERVICE_NAME}"
    echo "  查看状态: sudo systemctl status ${SERVICE_NAME}"
    echo "=========================================="
else
    echo ""
    echo "❌ 部署失败！服务未能正常启动"
    echo "查看日志: sudo journalctl -u ${SERVICE_NAME} -n 50"
    exit 1
fi

