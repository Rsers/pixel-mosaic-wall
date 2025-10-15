#!/bin/bash
# 部署前测试脚本 - 防止推送有语法错误的代码到 Vercel

set -e  # 遇到错误立即退出

echo "======================================"
echo "🔍 Vercel 部署前测试"
echo "======================================"
echo ""

# 切换到项目根目录
cd "$(dirname "$0")/.."

echo "📂 当前目录: $(pwd)"
echo ""

# 1. 检查 Python 语法
echo "🔍 步骤1: 检查 Python 语法..."
python3 -m py_compile src/app.py 2>&1 && echo "  ✅ src/app.py 语法正确" || (echo "  ❌ src/app.py 语法错误" && exit 1)
python3 -m py_compile src/templates_data.py 2>&1 && echo "  ✅ src/templates_data.py 语法正确" || (echo "  ❌ src/templates_data.py 语法错误" && exit 1)
python3 -m py_compile api/index.py 2>&1 && echo "  ✅ api/index.py 语法正确" || (echo "  ❌ api/index.py 语法错误" && exit 1)
echo ""

# 2. 检查模块导入
echo "🔍 步骤2: 检查模块导入..."
python3 -c "import sys; sys.path.insert(0, 'src'); from app import app; print('  ✅ Flask app 导入成功')" || (echo "  ❌ Flask app 导入失败" && exit 1)
echo ""

# 3. 检查必需的依赖
echo "🔍 步骤3: 检查依赖项..."
python3 -c "import flask; print('  ✅ Flask 已安装')" || (echo "  ❌ Flask 未安装，运行: pip install Flask" && exit 1)
python3 -c "import PIL; print('  ✅ Pillow 已安装')" || (echo "  ❌ Pillow 未安装，运行: pip install Pillow" && exit 1)
python3 -c "import werkzeug; print('  ✅ Werkzeug 已安装')" || (echo "  ❌ Werkzeug 未安装，运行: pip install Werkzeug" && exit 1)
echo ""

# 4. 检查关键文件是否存在
echo "🔍 步骤4: 检查关键文件..."
[ -f "src/app.py" ] && echo "  ✅ src/app.py 存在" || (echo "  ❌ src/app.py 不存在" && exit 1)
[ -f "src/templates_data.py" ] && echo "  ✅ src/templates_data.py 存在" || (echo "  ❌ src/templates_data.py 不存在" && exit 1)
[ -f "api/index.py" ] && echo "  ✅ api/index.py 存在" || (echo "  ❌ api/index.py 不存在" && exit 1)
[ -f "vercel.json" ] && echo "  ✅ vercel.json 存在" || (echo "  ❌ vercel.json 不存在" && exit 1)
[ -f "requirements.txt" ] && echo "  ✅ requirements.txt 存在" || (echo "  ❌ requirements.txt 不存在" && exit 1)
[ -d "templates" ] && echo "  ✅ templates/ 目录存在" || (echo "  ❌ templates/ 目录不存在" && exit 1)
[ -d "static" ] && echo "  ✅ static/ 目录存在" || (echo "  ❌ static/ 目录不存在" && exit 1)
echo ""

# 5. 检查 vercel.json 语法
echo "🔍 步骤5: 检查 vercel.json 语法..."
python3 -c "import json; json.load(open('vercel.json')); print('  ✅ vercel.json 语法正确')" || (echo "  ❌ vercel.json 语法错误" && exit 1)
echo ""

# 6. 检查 requirements.txt
echo "🔍 步骤6: 检查 requirements.txt..."
grep -q "Flask" requirements.txt && echo "  ✅ Flask 在依赖列表中" || (echo "  ❌ Flask 不在依赖列表中" && exit 1)
grep -q "Pillow" requirements.txt && echo "  ✅ Pillow 在依赖列表中" || (echo "  ❌ Pillow 不在依赖列表中" && exit 1)
grep -q "Werkzeug" requirements.txt && echo "  ✅ Werkzeug 在依赖列表中" || (echo "  ❌ Werkzeug 不在依赖列表中" && exit 1)
echo ""

# 7. 检查 import 语句（关键！）
echo "🔍 步骤7: 检查关键 import 语句..."
grep -q "from flask import Flask" src/app.py && echo "  ✅ Flask import 语句存在" || (echo "  ❌ Flask import 语句缺失！" && exit 1)
grep -q "from PIL import Image" src/app.py && echo "  ✅ PIL import 语句存在" || (echo "  ❌ PIL import 语句缺失！" && exit 1)
echo ""

echo "======================================"
echo "✅ 所有测试通过！可以安全部署到 Vercel"
echo "======================================"
echo ""
echo "下一步："
echo "  1. git add ."
echo "  2. git commit -m \"Your commit message\""
echo "  3. git push origin main"
echo ""

