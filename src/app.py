from PIL import Image
import sqlite3
import os
from datetime import datetime
from werkzeug.utils import secure_filename
import sys

# 添加当前目录到Python路径，以便导入templates_data
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from templates_data import get_template, get_pixel_positions

app = Flask(__name__, template_folder="../templates", static_folder="../static")

# Vercel 环境下使用 /tmp 目录存储上传文件
if os.environ.get("VERCEL"):
    UPLOAD_FOLDER = "/tmp/uploads"
else:
    UPLOAD_FOLDER = "static/uploads"

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

# Vercel 环境下的数据库路径
DB_PATH = os.environ.get("VERCEL") and "/tmp/pixels.db" or "pixels.db"


# 在每次请求前确保数据库存在
@app.before_request
def ensure_db():
    """确保数据库已初始化"""
    if not os.path.exists(DB_PATH):
        init_db()


# 数据库初始化函数
def init_db():
    """创建数据库和表"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS pixels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_name TEXT NOT NULL,
                row INTEGER NOT NULL,
                col INTEGER NOT NULL,
                image_path TEXT,
                upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(template_name, row, col)
            )
        """
        )
        conn.commit()
        conn.close()
        print(f"数据库初始化成功: {DB_PATH}")
    except Exception as e:
        print(f"数据库初始化失败: {e}")


# 辅助函数
def allowed_file(filename):
    """检查文件扩展名"""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_next_empty_position(template_name):
    """获取下一个空闲的像素位置"""
    try:
        # 1. 从 templates_data 获取所有需要填充的位置
        all_positions = get_pixel_positions(template_name)
        if not all_positions:
            return None

        # 2. 查询数据库已填充的位置
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT row, col FROM pixels WHERE template_name = ?", (template_name,)
        )
        filled_positions = set((row, col) for row, col in cursor.fetchall())
        conn.close()

        # 3. 返回第一个未填充的位置
        for position in all_positions:
            if position not in filled_positions:
                return position

        return None  # 模板已满

    except Exception as e:
        print(f"获取空闲位置失败: {e}")
        return None


def resize_and_save_image(file, save_path, thumb_size=(50, 50), large_size=(300, 300)):
    """
    缩放并保存图片（中心裁剪成正方形，生成缩略图和大图）

    Args:
        file: 上传的文件对象
        save_path: 缩略图保存路径（如 /path/to/0_1.jpg）
        thumb_size: 缩略图尺寸，默认(50, 50)
        large_size: 大图尺寸，默认(300, 300)

    Returns:
        tuple: (success: bool, large_path: str) 成功标志和大图路径
    """
    try:
        # 1. 打开并转换为RGB
        image = Image.open(file)
        if image.mode in ("RGBA", "LA"):
            background = Image.new("RGB", image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1])
            image = background
        elif image.mode != "RGB":
            image = image.convert("RGB")

        # 2. 中心裁剪成正方形（共用逻辑）
        width, height = image.size
        min_dimension = min(width, height)
        left = (width - min_dimension) // 2
        top = (height - min_dimension) // 2
        right = left + min_dimension
        bottom = top + min_dimension
        image_square = image.crop((left, top, right, bottom))

        # 3. 生成缩略图（50x50）
        thumb_image = image_square.resize(thumb_size, Image.Resampling.LANCZOS)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        thumb_image.save(save_path, "JPEG", quality=85, optimize=True)

        # 4. 生成大图（300x300）
        # 路径：0_1.jpg → 0_1_large.jpg
        large_path = save_path.replace(".jpg", "_large.jpg")
        large_image = image_square.resize(large_size, Image.Resampling.LANCZOS)
        large_image.save(large_path, "JPEG", quality=90, optimize=True)

        return True, large_path
    except Exception as e:
        print(f"图片处理失败: {e}")
        return False, None


@app.route('/uploads/<template>/<filename>')
def serve_upload(template, filename):
    """
    从 /tmp/uploads/ 读取文件并返回
    支持缩略图和大图（*_large.jpg）
    """
    try:
        # 安全检查：防止路径穿越攻击
        if '..' in template or '..' in filename:
            return "非法路径", 400
        
        # 模板名白名单
        if template not in ['heart', 'plane', 'balloon']:
            return "模板不存在", 404
        
        # 文件名白名单：只允许 \d+_\d+(_large)?.jpg
        import re
        if not re.match(r'^\d+_\d+(_large)?\.jpg$', filename):
            return "文件名格式错误", 400
        
        # 判断环境并构建文件路径
        if os.environ.get("VERCEL"):
            # Vercel：从 /tmp/uploads/ 读取
            file_path = f"/tmp/uploads/{template}/{filename}"
        else:
            # 本地：从 static/uploads/ 读取
            file_path = f"static/uploads/{template}/{filename}"
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            return "文件不存在", 404
        
        # 返回图片文件
        return send_file(file_path, mimetype='image/jpeg')
        
    except Exception as e:
        print(f"文件服务失败: {e}")
        return "服务器错误", 500


# 路由实现
@app.route("/")
def index():
    """主页"""
    return render_template("index.html")


@app.route("/api/templates", methods=["GET"])
def get_templates():
    """获取模板列表"""
    try:
        templates = ["heart", "plane", "balloon"]
        return jsonify({"templates": templates})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/upload", methods=["POST"])
def upload_image():
    """上传图片"""
    try:
        # 检查请求参数
        if "template" not in request.form:
            return jsonify({"success": False, "error": "缺少模板参数"}), 400

        if "file" not in request.files:
            return jsonify({"success": False, "error": "缺少文件参数"}), 400

        template_name = request.form["template"]
        file = request.files["file"]

        # 验证模板名称
        if template_name not in ["heart", "plane", "balloon"]:
            return jsonify({"success": False, "error": "无效的模板名称"}), 400

        # 验证文件
        if file.filename == "":
            return jsonify({"success": False, "error": "未选择文件"}), 400

        if not allowed_file(file.filename):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "不支持的文件格式，仅允许 jpg, png, gif",
                    }
                ),
                400,
            )

        # 获取下一个空闲位置
        position = get_next_empty_position(template_name)
        if position is None:
            return jsonify({"success": False, "error": "Template is full"}), 409

        row, col = position

        # 生成保存路径
        filename = f"{row}_{col}.jpg"
        template_upload_dir = os.path.join(app.config["UPLOAD_FOLDER"], template_name)
        save_path = os.path.join(template_upload_dir, filename)

        # 缩放并保存图片（生成缩略图和大图）
        success, large_path = resize_and_save_image(file, save_path)
        if not success:
            return jsonify({"success": False, "error": "图片处理失败"}), 500

        # 插入数据库记录
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO pixels (template_name, row, col, image_path) VALUES (?, ?, ?, ?)",
                (template_name, row, col, save_path),
            )
            conn.commit()
            conn.close()
        except sqlite3.IntegrityError:
            return jsonify({"success": False, "error": "位置已被占用"}), 409
        except Exception as e:
            # 如果数据库插入失败，删除已保存的图片
            if os.path.exists(save_path):
                os.remove(save_path)
            return jsonify({"success": False, "error": f"数据库错误: {str(e)}"}), 500

        # 返回成功响应 - 修改URL生成逻辑
        if os.environ.get("VERCEL"):
            image_url = f"/uploads/{template_name}/{filename}"  # 使用新的 API 路由
        else:
            image_url = f"/static/uploads/{template_name}/{filename}"  # 本地仍用静态文件

        return jsonify(
            {
                "success": True,
                "position": {"row": row, "col": col},
                "image_url": image_url,
            }
        )

    except Exception as e:
        return jsonify({"success": False, "error": f"服务器错误: {str(e)}"}), 500


@app.route("/api/grid-status", methods=["GET"])
def grid_status():
    """获取拼图状态"""
    try:
        template_name = request.args.get("template")

        if not template_name:
            return jsonify({"success": False, "error": "缺少模板参数"}), 400

        if template_name not in ["heart", "plane", "balloon"]:
            return jsonify({"success": False, "error": "无效的模板名称"}), 400

        # 查询数据库
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT row, col, image_path FROM pixels WHERE template_name = ?",
            (template_name,),
        )
        pixels_data = cursor.fetchall()
        conn.close()

        # 格式化响应数据
        pixels = []
        for row, col, image_path in pixels_data:
            if image_path and os.path.exists(image_path):
                # 修改URL转换逻辑
                if os.environ.get("VERCEL"):
                    # /tmp/uploads/heart/0_1.jpg → /uploads/heart/0_1.jpg
                    image_url = image_path.replace("/tmp/uploads/", "/uploads/")
                else:
                    # static/uploads/heart/0_1.jpg → /static/uploads/heart/0_1.jpg
                    image_url = image_path.replace("static/", "/static/")
                pixels.append({"row": row, "col": col, "image_url": image_url})

        return jsonify({"pixels": pixels})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.errorhandler(413)
def too_large(e):
    """处理文件过大错误"""
    return jsonify({"success": False, "error": "文件大小超过5MB限制"}), 413


if __name__ == "__main__":
    # 确保上传目录存在
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    for template in ["heart", "plane", "balloon"]:
        template_dir = os.path.join(app.config["UPLOAD_FOLDER"], template)
        os.makedirs(template_dir, exist_ok=True)

    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
