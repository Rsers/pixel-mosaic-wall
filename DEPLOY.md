# 🚀 部署指南

## 方式一：Vercel 部署（推荐）

### 优点
- ✅ 免费托管
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署（Git push 即部署）
- ✅ 零配置

### 步骤

1. **Fork 仓库**
   - 访问 [GitHub 仓库](https://github.com/你的用户名/pixel-mosaic-wall)
   - 点击右上角 "Fork"

2. **导入到 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 选择你 Fork 的仓库
   - 点击 "Deploy"

3. **完成！**
   - 几分钟后即可访问
   - 获得形如 `https://你的项目名.vercel.app` 的域名

### ⚠️ 注意事项

**Vercel 限制：**
- 无服务器环境（Serverless）
- 每次部署会清空上传的图片
- 适合演示和测试

**解决方案：**
如需持久化存储，请集成云存储：
- Cloudinary（免费 25GB）
- AWS S3
- 阿里云 OSS

---

## 方式二：VPS 服务器部署

### 优点
- ✅ 完全控制
- ✅ 图片持久化存储
- ✅ 适合生产环境
- ✅ 可自定义域名

### 前置要求
- Ubuntu 20.04+ 或 CentOS 7+
- Python 3.8+
- 至少 512MB 内存

### 自动部署（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/你的用户名/pixel-mosaic-wall.git
cd pixel-mosaic-wall

# 2. 执行部署脚本
bash deploy.sh
```

脚本会自动：
- ✅ 安装 Python 依赖
- ✅ 创建上传目录
- ✅ 初始化数据库
- ✅ 配置 systemd 服务
- ✅ 启动应用（端口 5000）

### 手动部署

```bash
# 1. 安装依赖
pip3 install -r requirements.txt

# 2. 创建目录
mkdir -p static/uploads/{heart,plane,balloon}

# 3. 运行应用
cd src
python3 app.py
```

### 服务管理

```bash
# 查看状态
sudo systemctl status pixel-art-wall

# 启动服务
sudo systemctl start pixel-art-wall

# 停止服务
sudo systemctl stop pixel-art-wall

# 重启服务
sudo systemctl restart pixel-art-wall

# 查看日志
sudo journalctl -u pixel-art-wall -f
```

### Nginx 反向代理（可选）

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static {
        alias /home/ubuntu/pixel-mosaic-wall/static;
    }
}
```

---

## 方式三：Docker 部署

### Dockerfile

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p static/uploads/{heart,plane,balloon}

EXPOSE 5000

CMD ["python", "src/app.py"]
```

### 构建和运行

```bash
# 构建镜像
docker build -t pixel-mosaic-wall .

# 运行容器
docker run -d \
  --name pixel-wall \
  -p 5000:5000 \
  -v $(pwd)/static/uploads:/app/static/uploads \
  pixel-mosaic-wall
```

---

## 方式四：Railway 部署

1. 访问 [railway.app](https://railway.app)
2. 连接 GitHub 仓库
3. 自动检测 Python 应用
4. 点击 Deploy

**配置环境变量：**
```
FLASK_ENV=production
PORT=5000
```

---

## 环境变量配置

创建 `.env` 文件（可选）：

```bash
# Flask 配置
FLASK_ENV=production
SECRET_KEY=your-secret-key-here

# 文件上传限制（字节）
MAX_CONTENT_LENGTH=5242880  # 5MB

# 端口
PORT=5000

# 数据库（可选，默认 SQLite）
DATABASE_URL=sqlite:///pixels.db
```

---

## 性能优化

### 生产环境推荐使用 Gunicorn

```bash
# 安装 Gunicorn
pip install gunicorn

# 运行（4个worker）
gunicorn -w 4 -b 0.0.0.0:5000 src.app:app
```

### systemd 配置示例

```ini
[Unit]
Description=Pixel Mosaic Wall
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/pixel-mosaic-wall
ExecStart=/usr/bin/gunicorn -w 4 -b 0.0.0.0:5000 src.app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 故障排查

### 常见问题

**1. 端口被占用**
```bash
# 查找占用端口的进程
sudo lsof -i :5000

# 杀死进程
sudo kill -9 <PID>
```

**2. 权限问题**
```bash
# 给上传目录添加写权限
chmod -R 755 static/uploads
```

**3. 依赖安装失败**
```bash
# 升级 pip
pip3 install --upgrade pip

# 使用国内镜像
pip3 install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

**4. 数据库初始化失败**
```bash
# 删除旧数据库
rm pixels.db

# 重新运行应用（会自动创建）
python3 src/app.py
```

---

## 监控和日志

### 查看实时日志

```bash
# systemd 服务日志
sudo journalctl -u pixel-art-wall -f

# 直接运行时的日志
python3 src/app.py 2>&1 | tee app.log
```

### 日志轮转（可选）

创建 `/etc/logrotate.d/pixel-art-wall`：

```
/var/log/pixel-art-wall/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

---

## 备份策略

### 备份数据库

```bash
# 备份
cp pixels.db pixels_backup_$(date +%Y%m%d).db

# 自动备份（cron）
0 2 * * * cd /home/ubuntu/pixel-mosaic-wall && cp pixels.db backups/pixels_$(date +\%Y\%m\%d).db
```

### 备份上传的图片

```bash
# 压缩备份
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz static/uploads/

# 上传到云存储（示例）
# aws s3 cp uploads_backup.tar.gz s3://your-bucket/
```

---

## 下一步

部署完成后，你可以：

1. 🎨 自定义图案模板（修改 `src/templates_data.py`）
2. 🔒 添加用户认证
3. 📊 添加数据统计面板
4. 🌍 集成云存储服务
5. 🚀 优化性能和缓存

---

**需要帮助？** 提交 [Issue](https://github.com/你的用户名/pixel-mosaic-wall/issues)

