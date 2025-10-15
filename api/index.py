"""
Vercel Serverless Function Entry Point
"""
import sys
import os
from pathlib import Path

# 添加项目根目录和 src 目录到 Python 路径
root_dir = Path(__file__).parent.parent
src_dir = root_dir / 'src'
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(src_dir))

# 切换工作目录到项目根目录
os.chdir(root_dir)

# 导入 Flask 应用
from src.app import app

# Vercel 会自动调用这个 WSGI 应用
app = app
