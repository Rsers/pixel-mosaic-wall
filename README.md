# 🎨 Pixel Mosaic Wall (像素拼图墙)

一个创意的协作像素艺术网站，用户上传的每张图片都会成为拼图中的一个"像素点"，共同组成预设的图案（爱心、飞机、气球）。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用户名/pixel-mosaic-wall)

## ✨ 功能特点

### 核心功能
- 🎨 **三种预设图案**：爱心 ❤️、飞机 ✈️、气球 🎈
- 👥 **协作创作**：多人同时上传图片，共同完成像素拼图
- ⚡ **实时展示**：上传后立即显示在拼图墙上
- 📱 **响应式设计**：适配桌面、平板、手机

### 交互功能
- 🖱️ **悬停预览**：鼠标悬停显示小预览图（75x75）
- 👆 **点击查看**：点击格子全屏查看大图（300x300）
- ⌨️ **快捷键支持**：ESC 关闭全屏查看

### 动画效果
- 🌊 **波浪扩散**：从中心向外圈扩散的波浪效果
- ➡️ **顺序流动**：从左到右，从上到下的流动效果
- ✨ **随机闪烁**：星光闪烁的随机效果
- 🔄 **翻转循环**：3D 翻转动画效果
- ⚡ **速度调节**：可调节动画速度（快/中/慢）

### 图片处理
- 🖼️ **自动生成双尺寸**：缩略图（50x50）+ 大图（300x300）
- 🎯 **智能裁剪**：自动居中裁剪为正方形
- 📊 **进度显示**：实时显示拼图完成进度

## 🚀 技术栈

### 后端
- **Flask 3.0.0** - 轻量级 Web 框架
- **SQLite** - 数据存储
- **Pillow 10.1.0** - 图片处理

### 前端
- 原生 HTML + CSS + JavaScript
- Grid 布局实现像素网格
- CSS 3D Transform 动画
- 无框架依赖，加载快速

## 📦 项目结构

```
pixel-mosaic-wall/
├── docs/                        # 文档目录
│   ├── PROJECT_PLAN.md          # 项目规划
│   ├── FEATURE-HOVER-PREVIEW.md # 悬停预览功能文档
│   └── FIX-SUMMARY-20251015.md  # Bug 修复记录
├── tasks/                       # 开发任务规范（可复用）
│   ├── task-001-backend.txt
│   ├── task-002-frontend.txt
│   ├── task-003-templates.txt
│   ├── task-004-fix-image-display.txt
│   ├── task-005-hover-preview.txt
│   ├── task-007-generate-large-images.txt
│   └── task-009-wave-animation.txt
├── src/
│   ├── app.py                   # Flask 应用主文件
│   └── templates_data.py        # 图案模板数据
├── static/
│   ├── style.css                # 样式文件
│   ├── script.js                # 前端逻辑
│   └── uploads/                 # 用户上传的图片
│       ├── heart/
│       ├── plane/
│       └── balloon/
├── templates/
│   └── index.html               # 主页面
├── requirements.txt             # Python 依赖
├── vercel.json                  # Vercel 部署配置
├── deploy.sh                    # 服务器部署脚本
└── README.md                    # 本文件
```

## 🛠️ 快速开始

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/你的用户名/pixel-mosaic-wall.git
cd pixel-mosaic-wall

# 2. 安装依赖
pip install -r requirements.txt

# 3. 创建上传目录
mkdir -p static/uploads/{heart,plane,balloon}

# 4. 运行应用
cd src
python app.py
```

访问：`http://localhost:5000`

### Vercel 部署（推荐）

1. **Fork 本仓库**到你的 GitHub 账号

2. **登录 Vercel**并导入项目：
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入你 Fork 的仓库
   - 点击 "Deploy"

3. **完成！** 
   - Vercel 会自动部署
   - 每次 push 到 GitHub 都会自动重新部署

⚠️ **注意**：Vercel 部署的图片存储是临时的（部署时会清空）。如需持久化存储，请使用云存储服务（如 Cloudinary、AWS S3）。

### 服务器部署

```bash
# 1. 上传到服务器
scp -r pixel-mosaic-wall/ user@server:~/

# 2. SSH 登录并执行部署脚本
ssh user@server
cd pixel-mosaic-wall
bash deploy.sh
```

部署脚本会自动配置 systemd 服务并启动应用。

## 🎯 使用指南

1. **选择图案**：在下拉菜单中选择想要完成的图案（爱心/飞机/气球）
2. **上传图片**：点击"选择文件"，支持批量上传
3. **查看进度**：实时显示已填充数量和完成百分比
4. **悬停预览**：鼠标悬停在已填充的格子上查看小预览图
5. **点击查看**：点击格子全屏查看大图
6. **开启动画**：勾选"启用动画效果"，选择喜欢的动画模式

## 📡 API 接口

### `GET /api/templates`
获取可用模板列表

**响应：**
```json
{
  "templates": ["heart", "plane", "balloon"]
}
```

### `POST /api/upload`
上传图片

**参数：**
- `template`: 模板名称 (heart/plane/balloon)
- `file`: 图片文件 (jpg/png/gif, 最大 5MB)

**响应：**
```json
{
  "success": true,
  "position": {"row": 5, "col": 10},
  "image_url": "/static/uploads/heart/5_10.jpg",
  "message": "图片上传成功！位置: (5, 10)"
}
```

### `GET /api/grid-status?template=heart`
获取拼图状态

**响应：**
```json
{
  "pixels": [
    {
      "row": 5,
      "col": 10,
      "image_url": "/static/uploads/heart/5_10.jpg"
    }
  ]
}
```

## 🎨 图案模板

所有图案都基于 20x20 像素网格：

| 图案 | 像素数 | 描述 |
|------|--------|------|
| ❤️ 爱心 (heart) | 128 | 经典对称爱心形状 |
| ✈️ 飞机 (plane) | 119 | 侧视图，机头朝右 |
| 🎈 气球 (balloon) | 102 | 圆形气球 + 细绳 |

## 🔧 配置说明

### 环境变量（可选）

```bash
# .env
FLASK_ENV=production
MAX_CONTENT_LENGTH=5242880  # 5MB
PORT=5000
```

### 数据库结构

```sql
CREATE TABLE pixels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT NOT NULL,
    row INTEGER NOT NULL,
    col INTEGER NOT NULL,
    image_path TEXT,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_name, row, col)
);
```

## 🌟 开发策略

本项目采用 **Cursor + DeepSeek 混合开发策略**：

- 🎯 **Cursor**：项目管理、架构设计、集成测试、部署
- 💬 **DeepSeek Chat**：简单任务（独立函数、样板代码）
- 🧠 **DeepSeek Reasoner**：复杂任务（前后端交互、Bug 修复、动画逻辑）

**成本对比**：
- 纯 Cursor 开发：约 ¥0.50
- 混合策略：约 ¥0.08
- **节省：84%**

详见 [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md)

## 📝 更新日志

### v1.2.0 (2025-10-15)
- ✨ 新增翻转循环动画效果
- ✨ 新增动画控制面板（4种动画模式）
- ✨ 新增速度调节功能
- 🐛 修复悬停预览抖动问题
- 📝 完善部署文档

### v1.1.0 (2025-10-15)
- ✨ 新增悬停预览功能（75x75 小预览图）
- ✨ 新增点击全屏查看（300x300 大图）
- ✨ 批量生成历史图片的大图版本
- 🎨 优化交互体验

### v1.0.0 (2025-10-15)
- 🎉 初始版本发布
- ✅ 支持三种图案模板
- ✅ 图片上传和拼图功能
- ✅ 自动部署脚本
- ✅ systemd 服务配置

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 图标来自 Emoji
- 动画灵感来自 CSS Tricks
- 开发工具：Cursor + DeepSeek AI

## 📮 联系方式

- 项目主页：[GitHub](https://github.com/你的用户名/pixel-mosaic-wall)
- 在线演示：[Vercel 部署链接]
- 问题反馈：[Issues](https://github.com/你的用户名/pixel-mosaic-wall/issues)

---

**Made with ❤️ using Cursor + DeepSeek AI**
