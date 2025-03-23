const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const API_VERSION = "v1"

const authRoutes = require('./routes/auth');


// 路由
app.use(`/api/${API_VERSION}/auth`, authRoutes);


// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});