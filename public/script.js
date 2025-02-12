
// 添加全局变量
let prevKeyShortcut = 'ArrowLeft';
let nextKeyShortcut = 'ArrowRight';
let isSettingShortcut = false;

// 添加快捷键设置事件监听
function initShortcutSettings() {
    const prevInput = document.getElementById('prevKeyShortcut');
    const nextInput = document.getElementById('nextKeyShortcut');

    prevInput.addEventListener('click', function() {
        isSettingShortcut = 'prev';
        this.value = '请按键...';
    });

    nextInput.addEventListener('click', function() {
        isSettingShortcut = 'next';
        this.value = '请按键...';
    });

    // 全局键盘事件监听
    document.addEventListener('keydown', function(e) {
        if (isSettingShortcut) {
            e.preventDefault();
            const key = e.key;
            
            if (isSettingShortcut === 'prev') {
                prevKeyShortcut = key;
                document.getElementById('prevKeyShortcut').value = key;
            } else if (isSettingShortcut === 'next') {
                nextKeyShortcut = key;
                document.getElementById('nextKeyShortcut').value = key;
            }
            
            isSettingShortcut = false;
            showNotification(`快捷键已设置为: ${key}`);
            return;
        }

        if (e.key === prevKeyShortcut) {
            prevImage();
        } else if (e.key === nextKeyShortcut) {
            nextImage();
        } else if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undoLastMark();
        }
    });
}

let currentImageIndex = 0;
let images = [];
let canvas, ctx;
const marks = new Map(); // 存储每张图片的标注
let currentScale = 1; // 添加一个全局变量来保存当前缩放比例

async function loadImages() {
    const folderPath = document.getElementById('folderPath').value;
    const response = await fetch('/getImages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folderPath })
    });
    
    const data = await response.json();
    if (data.images) {
        images = data.images;
        currentImageIndex = 0;
        document.getElementById('folderSelect').classList.add('hidden');
        document.getElementById('imageEditor').classList.remove('hidden');
        initCanvas();
        loadCurrentImage();
    }
    initShortcutSettings();
}

function initCanvas() {
    canvas = document.getElementById('imageCanvas');
    ctx = canvas.getContext('2d');
    
    canvas.addEventListener('mousedown', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (!marks.has(images[currentImageIndex])) {
            marks.set(images[currentImageIndex], []);
        }
        
        // 获取当前标注配置
        const text = document.getElementById('annotationText').value;
        const color = document.getElementById('annotationColor').value;
        const size = parseInt(document.getElementById('annotationSize').value);
        
        // 直接使用缩放后的坐标
        marks.get(images[currentImageIndex]).push({
            x: x,
            y: y,
            text,
            color,
            size
        });
        
        drawCurrentImage();
    });
}

function drawCurrentImage() {
    const img = new Image();
    img.onload = function() {
        // 计算缩放比例
        const maxHeight = window.innerHeight * 0.9;
        currentScale = 1;
        if (img.height > maxHeight) {
            currentScale = maxHeight / img.height;
        }
        
        // 设置画布尺寸
        canvas.width = img.width * currentScale;
        canvas.height = img.height * currentScale;
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 绘制标注
        const currentMarks = marks.get(images[currentImageIndex]) || [];
        currentMarks.forEach(mark => {
            ctx.font = `${mark.size}px Arial`;
            ctx.fillStyle = mark.color;
            ctx.fillText(mark.text, mark.x, mark.y);
        });
    };
    img.src = images[currentImageIndex];
}

function loadCurrentImage() {
    if (currentImageIndex >= 0 && currentImageIndex < images.length) {
        // 显示当前图片名称
        const imageName = images[currentImageIndex].split('/').pop();
        document.getElementById('imageInfo').textContent = `当前图片：${imageName} (${currentImageIndex + 1}/${images.length})`;
        drawCurrentImage();
    }
}

// 修改prevImage函数
async function prevImage() {
    if (currentImageIndex > 0) {
        const currentMarks = marks.get(images[currentImageIndex]) || [];
        if (currentMarks.length > 0) {
            await autoSaveImage();
        }
        currentImageIndex--;
        loadCurrentImage();
        showNotification('已切换到上一张图片');
    }
}

// 修改nextImage函数
async function nextImage() {
    if (currentImageIndex < images.length - 1) {
        const currentMarks = marks.get(images[currentImageIndex]) || [];
        if (currentMarks.length > 0) {
            await autoSaveImage();
        }
        currentImageIndex++;
        loadCurrentImage();
        showNotification('已切换到下一张图片');
    }
}

// 添加自动保存函数
async function autoSaveImage() {
    const imageData = canvas.toDataURL('image/png');
    const response = await fetch('/saveImage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            imagePath: images[currentImageIndex],
            imageData
        })
    });
    
    const result = await response.json();
    if (result.success) {
        // 使用非阻塞的通知
        Message.show('标注已自动保存');
    }

}

async function saveImage() {
    const imageData = canvas.toDataURL('image/png');
    const response = await fetch('/saveImage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            imagePath: images[currentImageIndex],
            imageData
        })
    });
    
    const result = await response.json();
    if (result.success) {
        alert('图片保存成功！');
    }
}

// 添加撤销标注函数
function undoLastMark() {
    const currentMarks = marks.get(images[currentImageIndex]);
    if (currentMarks && currentMarks.length > 0) {
        currentMarks.pop(); // 移除最后一个标注
        drawCurrentImage();
        showNotification('已撤销最后一个标注');
    }
}

function showNotification(message) {
    Message.show(message);
}