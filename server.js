const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// 設定靜態檔案目錄
app.use(express.static(path.join(__dirname, 'public')));
const API_VERSION = "v1"



const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/report');
const userRoutes = require('./routes/user');
const healthRoutes = require('./routes/health');
const aiRoutes = require('./routes/ai');
// 來自 `/reset/password` 的 GET 請求
app.get('/reset/password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset_password.html'));
});


// 路由
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/report`, reportRoutes);
app.use(`/api/${API_VERSION}/user`, userRoutes);
app.use(`/api/${API_VERSION}/health`, healthRoutes);
app.use(`/api/${API_VERSION}/ai`, aiRoutes);
// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});