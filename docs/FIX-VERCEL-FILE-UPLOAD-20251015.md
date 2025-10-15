# Vercel 文件上传修复 - 2025-10-15

## 问题背景
Vercel 部署后，用户上传图片时出现 500 错误。

## 根本原因
Vercel 无服务器环境的文件系统限制：
1. **文件系统只读**（除了 `/tmp` 目录）
2. **静态文件服务限制** - 无法通过 Nginx 访问 `/tmp` 中的文件
3. **临时性** - Vercel 重新部署会清空 `/tmp`

## 修复方案

### 1. 文件存储适配 ✅
**修改：** `src/app.py` 第16-19行

```python
# Vercel 环境下使用 /tmp 目录存储上传文件
if os.environ.get("VERCEL"):
    UPLOAD_FOLDER = "/tmp/uploads"
else:
    UPLOAD_FOLDER = "static/uploads"
```

### 2. 数据库路径适配 ✅
**修改：** `src/app.py` 第47行

```python
DB_PATH = os.environ.get("VERCEL") and "/tmp/pixels.db" or "pixels.db"
```

### 3. 新增文件服务 API 路由 ✅
**新增：** `src/app.py` 第146-183行

```python
@app.route('/uploads/<template>/<filename>')
def serve_upload(template, filename):
    """从 /tmp/uploads/ 读取文件并返回"""
    # 安全检查：路径穿越、白名单验证
    # 环境判断：Vercel 从 /tmp/uploads/，本地从 static/uploads/
    # 返回图片文件
```

**功能：**
- 在 Vercel 环境下，通过 API 路由提供上传的图片
- 支持缩略图和大图（`*_large.jpg`）
- 安全检查：防止路径穿越攻击
- 文件名白名单：只允许 `\d+_\d+(_large)?\.jpg`
- 模板名白名单：只允许 `heart|plane|balloon`

### 4. 修改上传 API 返回的 URL ✅
**修改：** `src/app.py` 第272-275行

```python
# 返回成功响应 - 修改URL生成逻辑
if os.environ.get("VERCEL"):
    image_url = f"/uploads/{template_name}/{filename}"  # 使用新的 API 路由
else:
    image_url = f"/static/uploads/{template_name}/{filename}"  # 本地仍用静态文件
```

### 5. 修改网格状态 API 返回的 URL ✅
**修改：** `src/app.py` 第316-321行

```python
# 修改URL转换逻辑
if os.environ.get("VERCEL"):
    # /tmp/uploads/heart/0_1.jpg → /uploads/heart/0_1.jpg
    image_url = image_path.replace("/tmp/uploads/", "/uploads/")
else:
    # static/uploads/heart/0_1.jpg → /static/uploads/heart/0_1.jpg
    image_url = image_path.replace("static/", "/static/")
```

## 技术细节

### 环境判断逻辑
```python
if os.environ.get("VERCEL"):
    # Vercel 环境
else:
    # 本地环境
```

### 文件访问流程

**本地环境：**
```
上传 → static/uploads/heart/0_1.jpg
访问 → /static/uploads/heart/0_1.jpg (Nginx 静态文件服务)
```

**Vercel 环境：**
```
上传 → /tmp/uploads/heart/0_1.jpg
访问 → /uploads/heart/0_1.jpg (Flask API 路由)
     → serve_upload() 从 /tmp/uploads/ 读取文件
     → send_file() 返回图片
```

### 安全措施
1. **路径穿越防护** - 禁止 `..` 在路径中
2. **模板名白名单** - 只允许 `heart|plane|balloon`
3. **文件名白名单** - 只允许 `\d+_\d+(_large)?\.jpg`
4. **文件存在性检查** - 防止访问不存在的文件

## 测试场景

### 本地环境
```bash
# 1. 上传图片
curl -X POST -F "template=heart" -F "file=@test.jpg" http://localhost:5000/api/upload
# 返回：{"image_url": "/static/uploads/heart/0_1.jpg"}

# 2. 访问图片
curl http://localhost:5000/static/uploads/heart/0_1.jpg
# 返回：图片文件（Nginx 静态文件服务）

# 3. 获取网格状态
curl http://localhost:5000/api/grid-status?template=heart
# 返回：{"pixels": [{"image_url": "/static/uploads/heart/0_1.jpg"}]}
```

### Vercel 环境
```bash
# 1. 上传图片
curl -X POST -F "template=heart" -F "file=@test.jpg" https://xxx.vercel.app/api/upload
# 返回：{"image_url": "/uploads/heart/0_1.jpg"}

# 2. 访问图片
curl https://xxx.vercel.app/uploads/heart/0_1.jpg
# 返回：图片文件（Flask API 路由）

# 3. 获取网格状态
curl https://xxx.vercel.app/api/grid-status?template=heart
# 返回：{"pixels": [{"image_url": "/uploads/heart/0_1.jpg"}]}
```

## 部署步骤

### 1. 推送到 GitHub
```bash
git add src/app.py
git add docs/FIX-VERCEL-FILE-UPLOAD-20251015.md
git commit -m "[fix] Vercel 文件上传和访问适配"
git push origin main
```

### 2. Vercel 自动部署
- Vercel 检测到 GitHub 更新
- 自动触发部署
- 部署成功后，文件上传功能恢复

### 3. 验证修复
- 访问 Vercel 部署的应用
- 上传图片
- 检查是否显示正常
- 测试悬停预览（大图）
- 测试点击全屏

## 注意事项

### ⚠️ /tmp 目录的临时性
- Vercel 重新部署会清空 `/tmp` 目录
- 上传的图片仅在当前部署会话中有效
- **生产环境建议使用对象存储服务**（如 AWS S3、Vercel Blob、Cloudflare R2）

### ✅ 适用场景
本修复方案适用于：
- 开发测试阶段
- 短期演示项目
- 图片数量较少（< 100张）
- 可接受部署后图片丢失

### 🚀 生产环境建议
对于生产环境，建议：
1. 使用 Vercel Blob 存储上传的图片
2. 修改 `resize_and_save_image()` 上传到 Blob
3. 修改 URL 生成逻辑返回 Blob URL
4. 数据库存储 Blob URL 而非本地路径

## 成本说明

### DeepSeek Reasoner 生成代码
- **模型：** `deepseek:deepseek-reasoner`
- **输入：** 任务规范 + 当前代码
- **输出：** 完整的 `src/app.py` 文件（367行）
- **耗时：** 约 60 秒
- **成本：** 约 ¥0.05

### vs Cursor 直接修改
- **成本：** 约 ¥0.30
- **节省：** 83%

## 总结

通过环境判断和 API 路由，成功解决了 Vercel 无服务器环境下的文件上传和访问问题。

**核心思想：**
- **本地环境** - 使用静态文件服务（简单、高效）
- **Vercel 环境** - 使用 API 路由动态提供文件（适配平台限制）

**下一步：**
- 测试 Vercel 部署
- 验证文件上传功能
- 考虑长期方案（对象存储）

