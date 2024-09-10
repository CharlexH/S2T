const express = require('express');
const multer = require('multer');
const app = express();
const port = 3000;

// 设置 multer 存储
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  // 这里可以处理转录逻辑
  const transcription = `转录文本: ${req.file.originalname}`; // 模拟转录文本
  res.json({ transcription });
});

app.listen(port, () => {
  console.log(`服务器正在运行在 http://localhost:${port}`);
});