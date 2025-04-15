const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const API_VERSION = "v1"

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/report');
const userRoutes = require('./routes/user');

// 路由
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/report`, reportRoutes);
app.use(`/api/${API_VERSION}/user`, userRoutes);

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});