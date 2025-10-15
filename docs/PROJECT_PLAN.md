# 像素拼图墙 - 任务分配表

**项目名称：** Pixel Art Wall（像素拼图墙）  
**创建日期：** 2025-10-15  
**部署服务器：** txy-2c2g-13 (122.51.216.13)  
**部署端口：** 5000

---

## 📋 项目概述

### 核心功能
用户上传多张图片，每张图片作为一个"像素点"，最终拼成预设的像素图案（爱心、飞机、气球等）。

### 技术方案
- **后端：** Flask（轻量化，符合SS原则）
- **前端：** 原生HTML+CSS+JavaScript（无框架，简单直接）
- **存储：** 文件系统存储图片 + SQLite记录数据
- **部署：** systemd服务 + Nginx反向代理

### 预设图案模板
1. 爱心（Heart）- 20x20像素
2. 飞机（Plane）- 20x20像素
3. 气球（Balloon）- 20x20像素

---

## 🎯 任务拆分与分配

### Task 001：后端API开发（Flask服务）
**复杂度：** complex  
**执行者：** DeepSeek  
**模型：** deepseek-reasoner  
**原因：** 涉及文件上传、图片处理、数据库操作、API路由设计，需要深度思考

**具体内容：**
- Flask应用框架搭建
- 图片上传接口（/api/upload）
- 获取拼图状态接口（/api/grid-status）
- 图案模板数据结构设计
- SQLite数据库表设计（记录每个像素点的图片路径）
- 图片缩放处理（PIL库）
- 错误处理和验证

**输入文件：** `tasks/task-001-backend.txt`  
**输出文件：** `src/app.py`

---

### Task 002：前端页面开发
**复杂度：** simple  
**执行者：** DeepSeek  
**模型：** deepseek-chat  
**原因：** 标准的HTML+CSS+JS页面，样板代码

**具体内容：**
- 图案选择界面（下拉菜单）
- 图片上传表单（支持多文件）
- 实时拼图展示区域（Grid布局）
- 响应式设计（移动端适配）
- 上传进度显示
- 美观的UI设计（现代化风格）

**输入文件：** `tasks/task-002-frontend.txt`  
**输出文件：** `templates/index.html`, `static/style.css`, `static/script.js`

---

### Task 003：图案模板数据生成
**复杂度：** simple  
**执行者：** DeepSeek  
**模型：** deepseek-chat  
**原因：** 简单的数据结构生成

**具体内容：**
- 生成爱心图案的20x20像素矩阵（1=需要填充，0=留空）
- 生成飞机图案的20x20像素矩阵
- 生成气球图案的20x20像素矩阵
- JSON格式存储

**输入文件：** `tasks/task-003-templates.txt`  
**输出文件：** `src/templates_data.py`

---

### Task 004：部署配置与脚本
**复杂度：** simple  
**执行者：** Cursor（我自己）  
**模型：** 自己操作  
**原因：** 系统配置和部署操作，需要直接控制

**具体内容：**
- 创建systemd服务文件
- 配置Nginx反向代理（可选，如果需要域名）
- 编写部署脚本（deploy.sh）
- 创建requirements.txt
- 服务器环境配置

**输出文件：** `deploy.sh`, `requirements.txt`, `pixel-art.service`

---

### Task 005：集成测试与部署
**复杂度：** critical  
**执行者：** Cursor（我自己）  
**模型：** 自己操作  
**原因：** 需要在真实服务器环境验证，涉及部署决策

**具体内容：**
- 上传代码到服务器
- 安装依赖
- 启动服务
- 功能测试（上传图片、查看拼图）
- 性能验证
- Bug修复

---

## 📊 成本预估

| 任务 | 执行者 | 模型 | 预计成本 |
|------|--------|------|---------|
| Task 001 | DeepSeek | reasoner | ¥0.05 |
| Task 002 | DeepSeek | chat | ¥0.02 |
| Task 003 | DeepSeek | chat | ¥0.01 |
| Task 004 | Cursor | - | ¥0.30 |
| Task 005 | Cursor | - | ¥0.30 |
| **总计** | - | - | **¥0.68** |

---

## 🚀 执行顺序

1. Task 003（生成图案模板数据）← 基础数据
2. Task 001（后端API开发）← 核心逻辑
3. Task 002（前端页面开发）← 用户界面
4. Task 004（部署配置）← 准备部署
5. Task 005（集成测试与部署）← 最终交付

---

## ✅ 验证标准

### 功能验证
- [ ] 用户可以选择图案模板（爱心/飞机/气球）
- [ ] 用户可以上传多张图片
- [ ] 图片自动缩放并填充到对应像素位置
- [ ] 实时显示拼图进度
- [ ] 刷新页面后拼图状态保持

### 性能验证
- [ ] 单次上传支持至少20张图片
- [ ] 图片处理时间 < 3秒
- [ ] 页面加载流畅

### 安全验证
- [ ] 图片格式验证（仅允许jpg/png/gif）
- [ ] 文件大小限制（单张 < 5MB）
- [ ] 路径安全检查

---

## 📝 技术细节

### 数据库表结构（SQLite）
```sql
CREATE TABLE pixels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT NOT NULL,  -- 图案名称（heart/plane/balloon）
    row INTEGER NOT NULL,          -- 行号（0-19）
    col INTEGER NOT NULL,          -- 列号（0-19）
    image_path TEXT,               -- 图片存储路径
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_name, row, col)
);
```

### 目录结构
```
pixel-art-wall/
├── docs/
│   └── PROJECT_PLAN.md          # 本文件
├── tasks/
│   ├── task-001-backend.txt
│   ├── task-002-frontend.txt
│   └── task-003-templates.txt
├── src/
│   ├── app.py                   # Flask应用主文件
│   └── templates_data.py        # 图案模板数据
├── static/
│   ├── style.css
│   ├── script.js
│   └── uploads/                 # 用户上传的图片
├── templates/
│   └── index.html
├── deploy.sh                    # 部署脚本
├── requirements.txt             # Python依赖
└── pixel-art.service            # systemd服务文件
```

---

**下一步：** 等待用户确认后开始执行 Task 003

