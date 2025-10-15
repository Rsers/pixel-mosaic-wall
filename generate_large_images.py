from PIL import Image
import os


def generate_large_images():
    templates = ["heart", "plane", "balloon"]
    base_dir = os.path.expanduser("~/pixel-art-wall/static/uploads")

    total_generated = 0
    total_skipped = 0

    for template in templates:
        template_dir = os.path.join(base_dir, template)

        if not os.path.exists(template_dir):
            print(f"Warning: Directory {template_dir} does not exist, skipping...")
            continue

        print(f"Processing template: {template}")

        # 查找所有缩略图
        for filename in os.listdir(template_dir):
            if filename.endswith(".jpg") and "_large" not in filename:
                # 检查是否已存在大图
                large_filename = filename.replace(".jpg", "_large.jpg")
                large_path = os.path.join(template_dir, large_filename)

                if os.path.exists(large_path):
                    total_skipped += 1
                    continue

                try:
                    # 读取缩略图
                    thumbnail_path = os.path.join(template_dir, filename)
                    img = Image.open(thumbnail_path)

                    # 验证图片尺寸
                    if img.size != (50, 50):
                        print(
                            f"Warning: {template}/{filename} is not 50x50, actual size: {img.size}"
                        )

                    # 放大到 300x300
                    large_img = img.resize((300, 300), Image.LANCZOS)

                    # 保存大图
                    large_img.save(large_path, "JPEG", quality=90)
                    print(f"Generated: {template}/{large_filename}")
                    total_generated += 1

                except Exception as e:
                    print(f"Error processing {template}/{filename}: {str(e)}")
                    continue

    print(f"\n=== Summary ===")
    print(f"Total large images generated: {total_generated}")
    print(f"Total large images skipped (already exist): {total_skipped}")
    print(f"Total processed: {total_generated + total_skipped}")


if __name__ == "__main__":
    generate_large_images()
