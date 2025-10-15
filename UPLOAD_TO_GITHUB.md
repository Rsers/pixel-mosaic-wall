# 📤 GitHub 上传指南

## 🎯 推荐仓库名

**`pixel-mosaic-wall`** ⭐

其他备选：
- `collaborative-pixel-art`
- `pixel-art-gallery`
- `pixel-canvas-share`

---

## 📋 上传步骤

### 1️⃣ 在 GitHub 创建新仓库

1. 访问 [github.com/new](https://github.com/new)
2. 仓库名：`pixel-mosaic-wall`
3. 描述：`🎨 A collaborative pixel art wall where users upload images to create mosaic patterns together`
4. ✅ Public（公开）
5. ❌ **不要**勾选 "Initialize with README"（我们已经有了）
6. ❌ **不要**添加 .gitignore（我们已经有了）
7. ❌ **不要**选择 License（我们已经有了）
8. 点击 "Create repository"

### 2️⃣ 本地推送到 GitHub

复制 GitHub 提供的命令，或使用以下命令：

```bash
cd /Users/caoxinnan/repo/CCC/pixel-art-wall

# 添加远程仓库（替换成你的 GitHub 用户名）
git remote add origin https://github.com/你的用户名/pixel-mosaic-wall.git

# 推送到 GitHub
git push -u origin main
```

**或者使用 SSH（如果配置了 SSH key）：**

```bash
git remote add origin git@github.com:你的用户名/pixel-mosaic-wall.git
git push -u origin main
```

### 3️⃣ 验证上传

访问：`https://github.com/你的用户名/pixel-mosaic-wall`

确认：
- ✅ 所有文件已上传
- ✅ README.md 正确显示
- ✅ LICENSE 文件存在
- ✅ 25 个文件（如 git 提交所示）

---

## 🚀 部署到 Vercel

### 方法一：通过 Vercel 网站

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 选择你的 `pixel-mosaic-wall` 仓库
5. 点击 "Deploy"
6. 等待部署完成（约 1-2 分钟）
7. 获得访问链接：`https://pixel-mosaic-wall.vercel.app`

### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
cd /Users/caoxinnan/repo/CCC/pixel-art-wall
vercel
```

---

## 📝 仓库设置建议

### Topics（主题标签）

在 GitHub 仓库页面添加 Topics：

```
pixel-art
collaborative
flask
python
javascript
mosaic
vercel
sqlite
image-processing
css-animation
```

### About（关于）

Website: `https://pixel-mosaic-wall.vercel.app`（部署后填入）

Description:
```
🎨 A collaborative pixel art wall where users upload images to create mosaic patterns (heart, plane, balloon) together. Features hover preview, fullscreen view, and 4 animation modes.
```

### Social Preview Image（可选）

创建一个 1280x640 的预览图，展示项目效果。

---

## 🔖 发布 Release（可选）

### 创建 v1.2.0 Release

1. 在 GitHub 仓库页面，点击 "Releases"
2. 点击 "Create a new release"
3. Tag version: `v1.2.0`
4. Release title: `🎨 Pixel Mosaic Wall v1.2.0`
5. 描述内容：

```markdown
## 🎉 首次发布

一个创意的协作像素艺术网站，用户上传的每张图片都会成为拼图中的一个"像素点"。

### ✨ 主要功能

- 🎨 三种预设图案（爱心、飞机、气球）
- 🖼️ 双尺寸图片生成（缩略图 + 大图）
- 🖱️ 悬停预览和全屏查看
- 🌊 四种炫酷动画效果
- 📱 响应式设计

### 🚀 快速开始

**Vercel 部署：**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用户名/pixel-mosaic-wall)

**本地运行：**
```bash
git clone https://github.com/你的用户名/pixel-mosaic-wall.git
cd pixel-mosaic-wall
pip install -r requirements.txt
python src/app.py
```

### 📊 技术栈

- Backend: Flask 3.0.0 + SQLite
- Frontend: Vanilla JS + CSS Grid
- Deployment: Vercel ready

### 🌟 开发策略

采用 Cursor + DeepSeek 混合开发，成本节省 84%

详见 [README.md](https://github.com/你的用户名/pixel-mosaic-wall#readme)
```

6. 点击 "Publish release"

---

## 🎯 后续操作

### 1. 更新 README 中的链接

部署完成后，更新 README.md 中的：
- Vercel 部署按钮 URL
- 在线演示链接
- 所有 `你的用户名` 占位符

### 2. 添加 Badges（可选）

在 README.md 顶部添加：

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用户名/pixel-mosaic-wall)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/flask-3.0.0-green.svg)](https://flask.palletsprojects.com/)
```

### 3. 分享你的项目

- 🐦 Twitter/X
- 📘 Facebook
- 💼 LinkedIn
- 🎨 Product Hunt（如果想推广）

---

## ⚠️ 重要提醒

1. **图片持久化问题**
   - Vercel 部署的图片会在重新部署时清空
   - 如需持久化，请集成云存储（Cloudinary/AWS S3）

2. **环境变量**
   - 在 Vercel 项目设置中配置敏感信息
   - 不要将 API keys 提交到 Git

3. **数据库**
   - Vercel 使用临时文件系统
   - 生产环境建议使用 Vercel Postgres 或其他云数据库

---

## 📞 需要帮助？

如有问题，请：
1. 查看 [DEPLOY.md](DEPLOY.md)
2. 提交 [Issue](https://github.com/你的用户名/pixel-mosaic-wall/issues)
3. 查看 Vercel [文档](https://vercel.com/docs)

---

**祝你部署顺利！🎉**

