
// 全局变量
let currentTemplate = 'heart';
let autoRefreshInterval = null;
let uploadInProgress = false;

// 每个图案需要的图片数量
const TEMPLATE_PIXEL_COUNTS = {
    'heart': 128,
    'plane': 119,
    'balloon': 102
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    init();
});

// 初始化应用
async function init() {
    // 设置默认模板
    document.getElementById('templateSelect').value = currentTemplate;

    // 加载初始网格状态
    await loadGridStatus(currentTemplate);

    // 设置事件监听器
    setupEventListeners();

    // 显示欢迎消息
    updateStatus('选择图案模板并上传图片来创建像素艺术！', 'info');
}

// 设置事件监听器
function setupEventListeners() {
    // 模板选择变化
    document.getElementById('templateSelect').addEventListener('change', async (e) => {
        currentTemplate = e.target.value;
        updateStatus(`已切换到 ${getTemplateName(currentTemplate)} 图案`, 'info');
        await loadGridStatus(currentTemplate);
    });

    // 上传按钮点击
    document.getElementById('uploadBtn').addEventListener('click', handleUpload);

    // 自动刷新开关
    document.getElementById('autoRefresh').addEventListener('change', (e) => {
        if (e.target.checked) {
            startAutoRefresh();
        } else {
            stopAutoRefresh();
        }
    });

    // 文件选择变化
    document.getElementById('fileInput').addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            updateStatus(`已选择 ${files.length} 个文件，点击上传按钮开始上传`, 'info');
        }
    });
}

// 获取模板中文名称
function getTemplateName(template) {
    const names = {
        'heart': '爱心',
        'plane': '飞机',
        'balloon': '气球'
    };
    return names[template] || template;
}

// 加载网格状态
async function loadGridStatus(template) {
    try {
        showLoadingState();

        const response = await fetch(`/api/grid-status?template=${template}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        renderGrid(data.pixels);

        // 更新进度信息
        updateProgressInfo(data.pixels.length, template);

    } catch (error) {
        console.error('加载网格状态失败:', error);
        updateStatus('加载网格状态失败，请稍后重试', 'error');
    }
}

// 显示加载状态
function showLoadingState() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    grid.style.display = 'flex';
    grid.style.alignItems = 'center';
    grid.style.justifyContent = 'center';
    grid.style.color = 'white';
    grid.style.fontSize = '1.2rem';
    grid.innerHTML = '<div>加载中...</div>';
}

// 渲染网格（20x20）
function renderGrid(pixels) {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    grid.style.display = 'grid';

    console.log('渲染网格，像素数量:', pixels.length);

    // 获取模板数据（哪些位置需要填充）
    const templateData = getTemplatePositions(currentTemplate);

    // 创建 20x20 网格
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 20; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // 检查这个位置是否在模板中（是否需要填充）
            const isInTemplate = templateData.has(`${row},${col}`);

            if (!isInTemplate) {
                // 不在模板中的位置，设为空白
                cell.classList.add('empty');
                cell.style.opacity = '0.1';
            } else {
                // 在模板中，查找是否已填充
                const pixel = pixels.find(p => p.row === row && p.col === col);
                if (pixel && pixel.image_url) {
                    cell.classList.add('filled');
                    cell.style.backgroundImage = `url(${pixel.image_url})`;
                    cell.title = `已填充: (${row}, ${col})`;

                    // 新增：悬停显示小预览图
                    let hoverTimer = null;

                    cell.addEventListener('mouseenter', function (e) {
                        // 缩短延迟到 150ms，更灵敏
                        hoverTimer = setTimeout(() => {
                            showImagePreview(pixel.image_url, cell);
                        }, 150);
                    });

                    cell.addEventListener('mouseleave', function (e) {
                        // 取消延迟显示
                        if (hoverTimer) {
                            clearTimeout(hoverTimer);
                            hoverTimer = null;
                        }
                        // 隐藏小预览
                        hideImagePreview();
                    });

                    // 新增：点击显示全屏大图
                    cell.addEventListener('click', function (e) {
                        showFullscreenImage(pixel.image_url);
                    });
                } else {
                    cell.classList.add('unfilled');
                    cell.title = `待填充: (${row}, ${col})`;
                }
            }

            grid.appendChild(cell);
        }
    }
}

// 获取模板中需要填充的位置
function getTemplatePositions(template) {
    // 这里简化处理，实际应该从后端获取
    // 暂时标记所有非边缘位置为需要填充
    const positions = new Set();

    // 根据模板名称返回不同的位置集合
    // 这里用一个简化的逻辑，实际应该匹配 templates_data.py 的数据
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 20; col++) {
            // 简化：中心区域为需要填充区域
            if (template === 'heart' || template === 'plane' || template === 'balloon') {
                positions.add(`${row},${col}`);
            }
        }
    }

    return positions;
}

// 更新进度信息
function updateProgressInfo(currentCount, template) {
    const totalCount = TEMPLATE_PIXEL_COUNTS[template];
    const remaining = totalCount - currentCount;
    const progressPercent = ((currentCount / totalCount) * 100).toFixed(1);

    let progressDiv = document.getElementById('progressInfo');
    if (!progressDiv) {
        progressDiv = document.createElement('div');
        progressDiv.id = 'progressInfo';
        progressDiv.className = 'progress-info';

        const controls = document.querySelector('.controls');
        controls.insertAdjacentElement('afterend', progressDiv);
    }

    const templateName = getTemplateName(template);
    progressDiv.innerHTML = `
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progressPercent}%"></div>
        </div>
        <div class="progress-text">
            <strong>${templateName}</strong> 拼图进度：<strong>${currentCount}</strong> / ${totalCount} 
            (${progressPercent}%) 
            ${remaining > 0 ? `| 还需 <strong>${remaining}</strong> 张图片` : '| 🎉 已完成！'}
        </div>
    `;
}

// 处理图片上传
async function handleUpload() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    if (files.length === 0) {
        updateStatus('请先选择要上传的图片文件', 'error');
        return;
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const invalidFiles = Array.from(files).filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
        updateStatus('只支持 JPG、PNG、GIF 格式的图片文件', 'error');
        return;
    }

    // 检查数量是否超过剩余空位
    const totalNeeded = TEMPLATE_PIXEL_COUNTS[currentTemplate];
    const response = await fetch(`/api/grid-status?template=${currentTemplate}`);
    const data = await response.json();
    const currentFilled = data.pixels.length;
    const remaining = totalNeeded - currentFilled;

    if (files.length > remaining) {
        const confirmMsg = `当前图案还需 ${remaining} 张图片，但您选择了 ${files.length} 张。\n超出的图片将无法上传。\n是否继续？`;
        if (!confirm(confirmMsg)) {
            return;
        }
    }

    uploadInProgress = true;
    document.getElementById('uploadBtn').disabled = true;

    try {
        let successCount = 0;
        let errorCount = 0;

        // 逐个上传文件
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            updateStatus(`上传中... (${i + 1}/${files.length})`, 'info');

            const result = await uploadSingleFile(file);

            if (result.success) {
                successCount++;
                updateStatus(`上传成功: ${file.name} (${successCount}/${files.length})`, 'success');

                // 每上传成功一张图片就更新网格
                await loadGridStatus(currentTemplate);
            } else {
                errorCount++;
                updateStatus(`上传失败: ${file.name} - ${result.message}`, 'error');
            }

            // 短暂延迟，避免请求过于频繁
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 显示最终结果
        if (errorCount === 0) {
            updateStatus(`所有 ${successCount} 个文件上传成功！`, 'success');
        } else {
            updateStatus(`上传完成: ${successCount} 成功, ${errorCount} 失败`,
                errorCount === files.length ? 'error' : 'info');
        }

    } catch (error) {
        console.error('上传过程中发生错误:', error);
        updateStatus('上传过程中发生错误，请稍后重试', 'error');
    } finally {
        uploadInProgress = false;
        document.getElementById('uploadBtn').disabled = false;
        fileInput.value = ''; // 清空文件选择
    }
}

// 上传单个文件
async function uploadSingleFile(file) {
    const formData = new FormData();
    formData.append('template', currentTemplate);
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('上传文件失败:', error);
        return {
            success: false,
            message: '网络错误'
        };
    }
}

// 更新状态提示
function updateStatus(message, type = 'info') {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;

    // 3秒后自动清除成功/信息提示
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            if (statusElement.textContent === message) {
                statusElement.textContent = '';
                statusElement.className = 'status';
            }
        }, 3000);
    }
}

// 开始自动刷新
function startAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }

    autoRefreshInterval = setInterval(async () => {
        if (!uploadInProgress) {
            await loadGridStatus(currentTemplate);
        }
    }, 10000); // 每10秒刷新一次

    updateStatus('已开启自动刷新', 'info');
}

// 停止自动刷新
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        updateStatus('已关闭自动刷新', 'info');
    }
}

// 错误处理
window.addEventListener('error', function (e) {
    console.error('发生错误:', e.error);
    updateStatus('应用发生错误，请刷新页面重试', 'error');
});

// 页面可见性变化时处理自动刷新
document.addEventListener('visibilitychange', function () {
    const autoRefreshCheckbox = document.getElementById('autoRefresh');

    if (document.hidden) {
        // 页面不可见时暂停自动刷新
        if (autoRefreshInterval) {
            stopAutoRefresh();
            autoRefreshCheckbox.checked = false;
        }
    }
});

// 显示大图预览（改为在格子旁边显示）
function showImagePreview(thumbnailUrl, cellElement) {
    console.log('🖼️ 显示预览，缩略图URL:', thumbnailUrl);

    // 生成大图URL：/static/uploads/heart/0_1.jpg → /static/uploads/heart/0_1_large.jpg
    const largeUrl = thumbnailUrl.replace('.jpg', '_large.jpg');
    console.log('🖼️ 大图URL:', largeUrl);

    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');

    if (!modal || !modalImage) {
        console.error('❌ Modal 元素未找到！');
        return;
    }

    // 获取格子的位置
    const rect = cellElement.getBoundingClientRect();

    // 计算预览图位置：在格子右侧偏上10px处
    const previewLeft = rect.right + 10;
    const previewTop = rect.top - 10;

    // 设置 Modal 位置
    modal.style.left = previewLeft + 'px';
    modal.style.top = previewTop + 'px';

    modalImage.src = largeUrl;
    modal.style.display = 'block';
    console.log('✅ Modal 已显示在格子旁边');
}

// 隐藏大图预览
function hideImagePreview() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

// 显示全屏大图
function showFullscreenImage(thumbnailUrl) {
    console.log('🖼️ 全屏显示，缩略图URL:', thumbnailUrl);

    // 生成大图URL
    const largeUrl = thumbnailUrl.replace('.jpg', '_large.jpg');
    console.log('🖼️ 全屏大图URL:', largeUrl);

    const modal = document.getElementById('fullscreenModal');
    const modalImage = document.getElementById('fullscreenImage');

    if (!modal || !modalImage) {
        console.error('❌ 全屏 Modal 元素未找到！');
        return;
    }

    modalImage.src = largeUrl;
    modal.classList.add('active');
    console.log('✅ 全屏 Modal 已显示');
}

// 关闭全屏大图
function hideFullscreenImage() {
    const modal = document.getElementById('fullscreenModal');
    modal.classList.remove('active');
    console.log('✅ 全屏 Modal 已关闭');
}

// 点击全屏 Modal 任意处关闭
document.addEventListener('DOMContentLoaded', function () {
    const fullscreenModal = document.getElementById('fullscreenModal');
    if (fullscreenModal) {
        fullscreenModal.addEventListener('click', function (e) {
            hideFullscreenImage();
        });
    }

    // ESC 键关闭全屏
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            hideFullscreenImage();
        }
    });

    // 初始化动画控制
    initAnimationControls();
});

// ==================== 动画系统 ====================

// 全局动画管理器
let animationManager = null;

// 动画管理器类
class AnimationManager {
    constructor() {
        this.isRunning = false;
        this.currentMode = 'wave';
        this.speed = 150;
        this.intervalId = null;
        this.filledCells = [];
        this.currentIndex = 0;
        this.wasAutoRefreshOn = false;
    }

    // 获取所有已填充的格子
    updateFilledCells() {
        this.filledCells = Array.from(document.querySelectorAll('.grid-cell.filled'));
        console.log(`📊 已填充格子数量: ${this.filledCells.length}`);
    }

    // 开始动画
    start() {
        if (this.isRunning) return;

        this.updateFilledCells();

        if (this.filledCells.length === 0) {
            updateStatus('没有已填充的格子，无法播放动画', 'error');
            return;
        }

        // 暂停自动刷新
        if (autoRefreshInterval) {
            this.wasAutoRefreshOn = true;
            stopAutoRefresh();
            document.getElementById('autoRefresh').checked = false;
        }

        this.isRunning = true;
        this.currentIndex = 0;

        console.log(`🎬 开始动画: ${this.currentMode}, 速度: ${this.speed}ms`);

        // 根据模式启动对应动画
        if (this.currentMode === 'wave') {
            this.waveAnimation();
        } else if (this.currentMode === 'flow') {
            this.flowAnimation();
        } else if (this.currentMode === 'sparkle') {
            this.sparkleAnimation();
        } else if (this.currentMode === 'flip') {
            this.flipAnimation();
        }
    }

    // 停止动画
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // 移除所有动画类
        this.filledCells.forEach(cell => {
            cell.classList.remove('animate-highlight');
            cell.classList.remove('animate-flip');
        });

        // 恢复自动刷新
        if (this.wasAutoRefreshOn) {
            startAutoRefresh();
            document.getElementById('autoRefresh').checked = true;
            this.wasAutoRefreshOn = false;
        }

        console.log('⏹️ 动画已停止');
    }

    // 设置模式
    setMode(mode) {
        const wasRunning = this.isRunning;
        if (wasRunning) {
            this.stop();
        }
        this.currentMode = mode;
        console.log(`🎭 切换动画模式: ${mode}`);
        if (wasRunning) {
            setTimeout(() => this.start(), 100);
        }
    }

    // 设置速度
    setSpeed(speed) {
        this.speed = speed;
        console.log(`⚡ 设置速度: ${speed}ms`);

        // 如果正在运行，重启动画以应用新速度
        if (this.isRunning) {
            const mode = this.currentMode;
            this.stop();
            setTimeout(() => {
                this.currentMode = mode;
                this.start();
            }, 100);
        }
    }

    // 波浪扩散动画
    waveAnimation() {
        // 计算所有格子到中心的距离
        const centerRow = 10;
        const centerCol = 10;

        const cellsWithDistance = this.filledCells.map(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const distance = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));
            return { cell, distance };
        });

        // 按距离分组
        cellsWithDistance.sort((a, b) => a.distance - b.distance);

        let index = 0;
        this.intervalId = setInterval(() => {
            if (!this.isRunning) return;

            // 每次高亮一组距离相近的格子
            const currentDistance = cellsWithDistance[index].distance;
            const group = [];

            while (index < cellsWithDistance.length &&
                Math.abs(cellsWithDistance[index].distance - currentDistance) < 0.5) {
                group.push(cellsWithDistance[index].cell);
                index++;
            }

            // 高亮这一组
            group.forEach(cell => {
                cell.classList.add('animate-highlight');
                setTimeout(() => cell.classList.remove('animate-highlight'), 600);
            });

            // 循环
            if (index >= cellsWithDistance.length) {
                index = 0;
            }
        }, this.speed);
    }

    // 顺序流动动画
    flowAnimation() {
        // 按行列顺序排序
        const sortedCells = [...this.filledCells].sort((a, b) => {
            const rowA = parseInt(a.dataset.row);
            const colA = parseInt(a.dataset.col);
            const rowB = parseInt(b.dataset.row);
            const colB = parseInt(b.dataset.col);
            return (rowA * 20 + colA) - (rowB * 20 + colB);
        });

        let index = 0;
        this.intervalId = setInterval(() => {
            if (!this.isRunning) return;

            const cell = sortedCells[index];
            cell.classList.add('animate-highlight');
            setTimeout(() => cell.classList.remove('animate-highlight'), 600);

            index = (index + 1) % sortedCells.length;
        }, this.speed);
    }

    // 随机闪烁动画
    sparkleAnimation() {
        this.intervalId = setInterval(() => {
            if (!this.isRunning) return;

            // 随机选择 3-8 个格子
            const count = Math.min(Math.floor(Math.random() * 6) + 3, this.filledCells.length);
            const selectedIndexes = new Set();

            while (selectedIndexes.size < count) {
                selectedIndexes.add(Math.floor(Math.random() * this.filledCells.length));
            }

            selectedIndexes.forEach(i => {
                const cell = this.filledCells[i];
                cell.classList.add('animate-highlight');
                setTimeout(() => cell.classList.remove('animate-highlight'), 600);
            });
        }, this.speed);
    }

    // 翻转循环动画
    flipAnimation() {
        // 按行列顺序排序
        const sortedCells = [...this.filledCells].sort((a, b) => {
            const rowA = parseInt(a.dataset.row);
            const colA = parseInt(a.dataset.col);
            const rowB = parseInt(b.dataset.row);
            const colB = parseInt(b.dataset.col);
            return (rowA * 20 + colA) - (rowB * 20 + colB);
        });

        let index = 0;
        this.intervalId = setInterval(() => {
            if (!this.isRunning) return;

            const cell = sortedCells[index];
            cell.classList.add('animate-flip');
            setTimeout(() => cell.classList.remove('animate-flip'), 800);

            index = (index + 1) % sortedCells.length;
        }, this.speed);
    }
}

// 初始化动画控制
function initAnimationControls() {
    animationManager = new AnimationManager();

    const enableCheckbox = document.getElementById('enableAnimation');
    const modeSelect = document.getElementById('animationMode');
    const speedSlider = document.getElementById('animationSpeed');
    const speedValue = document.getElementById('speedValue');

    // 启用/禁用动画
    enableCheckbox.addEventListener('change', function (e) {
        if (e.target.checked) {
            animationManager.start();
            updateStatus('✨ 动画已启动', 'success');
        } else {
            animationManager.stop();
            updateStatus('⏹️ 动画已停止', 'info');
        }
    });

    // 切换动画模式
    modeSelect.addEventListener('change', function (e) {
        animationManager.setMode(e.target.value);
    });

    // 调整速度
    speedSlider.addEventListener('input', function (e) {
        const speed = parseInt(e.target.value);
        animationManager.setSpeed(speed);

        // 更新速度显示
        if (speed <= 100) {
            speedValue.textContent = '快';
        } else if (speed <= 200) {
            speedValue.textContent = '中';
        } else {
            speedValue.textContent = '慢';
        }
    });

    console.log('✅ 动画控制已初始化');
}

