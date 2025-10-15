# Vercel 配置优化 - 2025-10-15

## 问题背景

部署时出现警告：
```
WARN! Due to `builds` existing in your configuration file, 
the Build and Development Settings defined in your Project Settings will not apply.
```

## 原因分析

### 旧配置方式（已过时）
```json
{
    "version": 2,
    "builds": [
        {
            "src": "api/index.py",
            "use": "@vercel/python"
        }
    ],
    "routes": [
        {
            "src": "/(.*)",
            "dest": "api/index.py"
        }
    ]
}
```

**问题：**
- `builds` 和 `routes` 是 Vercel v2 的旧配置方式
- 会覆盖项目设置中的构建配置
- Vercel 现在推荐使用更简化的配置

### 新配置方式（推荐）
```json
{
    "rewrites": [
        {
            "source": "/(.*)",
            "destination": "/api/index"
        }
    ]
}
```

**优势：**
- ✅ 更简洁（只需 `rewrites`）
- ✅ 自动检测 `api/` 目录下的 Python 文件
- ✅ 不覆盖项目设置
- ✅ 符合 Vercel 最新最佳实践

## 工作原理

### Vercel 自动检测机制
1. **检测 `api/` 目录** - Vercel 自动识别 `api/index.py`
2. **自动使用 `@vercel/python`** - 无需显式配置 `builds`
3. **Serverless Function** - `api/index.py` 自动成为 Serverless Function
4. **路由重写** - `rewrites` 将所有请求转发到 `/api/index`

### 路由流程
```
用户请求 → Vercel Edge Network
    ↓
检查 rewrites 规则
    ↓
/(.*) 匹配所有路径
    ↓
转发到 /api/index
    ↓
执行 api/index.py (Flask 应用)
    ↓
返回响应
```

## 配置对比

| 特性 | 旧配置 (builds) | 新配置 (rewrites) |
|------|----------------|-------------------|
| **简洁性** | ❌ 需要 builds + routes | ✅ 只需 rewrites |
| **自动检测** | ❌ 需要显式指定 `@vercel/python` | ✅ 自动检测 Python |
| **项目设置** | ❌ 被覆盖 | ✅ 不影响 |
| **警告** | ⚠️ 有警告 | ✅ 无警告 |
| **最佳实践** | ❌ 已过时 | ✅ 推荐 |

## 文件结构

### api/index.py（入口文件）
```python
"""
Vercel Serverless Function Entry Point
"""

import sys
import os
from pathlib import Path

# 添加项目根目录和 src 目录到 Python 路径
root_dir = Path(__file__).parent.parent
src_dir = root_dir / "src"
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(src_dir))

# 切换工作目录到项目根目录
os.chdir(root_dir)

# 导入 Flask 应用
from src.app import app

# Vercel 会自动调用这个 WSGI 应用
app = app
```

### 工作原理
1. Vercel 检测到 `api/index.py`
2. 自动使用 `@vercel/python` 构建器
3. 将 `app` 对象作为 WSGI 应用
4. 所有请求通过 `rewrites` 转发到这里

## 其他优化建议

### 1. 静态文件优化（可选）
如果有大量静态文件，可以添加：
```json
{
    "rewrites": [
        {
            "source": "/static/(.*)",
            "destination": "/static/$1"
        },
        {
            "source": "/(.*)",
            "destination": "/api/index"
        }
    ]
}
```

### 2. 环境变量配置
在 Vercel 项目设置中添加环境变量：
```
VERCEL=1
PYTHON_VERSION=3.9
```

### 3. 缓存优化（可选）
```json
{
    "rewrites": [...],
    "headers": [
        {
            "source": "/static/(.*)",
            "headers": [
                {
                    "key": "Cache-Control",
                    "value": "public, max-age=31536000, immutable"
                }
            ]
        }
    ]
}
```

## 部署验证

### 1. 提交新配置
```bash
git add vercel.json
git commit -m "[chore] 优化 Vercel 配置，移除已过时的 builds"
git push origin main
```

### 2. 检查部署日志
- ✅ 警告应该消失
- ✅ 构建成功
- ✅ 应用正常运行

### 3. 功能验证
- ✅ 主页访问正常
- ✅ API 路由正常
- ✅ 文件上传功能正常

## 参考文档

- [Vercel Rewrites](https://vercel.com/docs/concepts/projects/project-configuration#rewrites)
- [Vercel Python Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [Migrating from builds and routes](https://vercel.com/docs/concepts/projects/project-configuration#legacy-configuration)

## 总结

通过将 `builds` + `routes` 迁移到 `rewrites`，我们：
- ✅ 消除了部署警告
- ✅ 简化了配置文件
- ✅ 符合 Vercel 最新最佳实践
- ✅ 保持所有功能正常工作

