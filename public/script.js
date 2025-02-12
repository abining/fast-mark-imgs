let currentImageIndex = 0;
let images = [];
let canvas, ctx;
const marks = new Map(); // 存储每张图片的标注

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
        marks.get(images[currentImageIndex]).push({ x, y });
        
        drawCurrentImage();
    });
}

function drawCurrentImage() {
    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // 绘制标注
        const currentMarks = marks.get(images[currentImageIndex]) || [];
        ctx.font = '20px Arial';
        ctx.fillStyle = 'black';
        currentMarks.forEach(mark => {
            ctx.fillText('G', mark.x, mark.y);
        });
    };
    img.src = images[currentImageIndex];
}

function loadCurrentImage() {
    if (currentImageIndex >= 0 && currentImageIndex < images.length) {
        drawCurrentImage();
    }
}

function prevImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        loadCurrentImage();
    }
}

function nextImage() {
    if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
        loadCurrentImage();
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