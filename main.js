const express = require('express');
const path = require('path');
const fs = require('fs');
const open = require('open');

const app = express();
const port = 3000;

// 增加请求体大小限制到50MB
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// 设置静态文件目录
app.use(express.static('public'));
// 添加input目录的静态文件服务
app.use('/input', express.static('input'));
app.use('/input2', express.static('input2'));

// 获取图片列表
app.post('/getImages', (req, res) => {
    const folderPath = req.body.folderPath;
    try {
        const files = fs.readdirSync(folderPath);
        // const files = fs.readdirSync(folderPath);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
        });
        res.json({ images: imageFiles.map(file => path.join(folderPath, file)) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 保存标注后的图片
app.post('/saveImage', (req, res) => {
    const { imagePath, imageData } = req.body;
    const outputDir = path.join(path.dirname(imagePath), 'output');
    
    // 创建输出目录
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const fileName = path.basename(imagePath);
    const outputPath = path.join(outputDir, fileName);

    // 将Base64图片数据保存为文件
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(outputPath, base64Data, 'base64');
    
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    open(`http://localhost:${port}`);
});
