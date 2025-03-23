const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const pool = mysql.createPool(dbConfig);
pool.getConnection()
  .then(() => console.log('資料庫連線成功'))
  .catch(err => console.error('資料庫連線失敗:', err));
module.exports = pool;