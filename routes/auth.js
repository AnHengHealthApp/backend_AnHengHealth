const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
require('dotenv').config();

// 註冊路由
router.post('/register', async (req, res) => {
  const { username, password, email, display_name } = req.body;

  // 輸入驗證
  if (!username || !password || !email || !display_name) {
    return res.status(400).json({ error: { message: '請提供帳戶、密碼、電子郵件和使用者名稱' } });
  }

  if (username.length > 50 || email.length > 100 || display_name.length > 50) {
    return res.status(400).json({ error: { message: '帳戶、電子郵件或使用者名稱超出長度限制' } });
  }

  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return res.status(400).json({ error: { message: '電子郵件格式無效' } });
  }

  try {
    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 插入資料庫
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, display_name) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, display_name]
    );

    // 成功回應
    res.status(201).json({ message: '註冊成功', user_id: result.insertId });
  } catch (error) {
    console.error('註冊錯誤:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: { message: '帳戶或電子郵件已存在' } });
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(500).json({ error: { message: '資料庫連線失敗，請檢查配置' } });
    } else {
      return res.status(500).json({
        error: {
          message: '伺服器錯誤',
          details: { code: error.code, message: error.message }
        }
      });
    }
  }
});

// 登入路由
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // 輸入驗證
  if (!username || !password) {
    return res.status(400).json({ message: '請提供用戶名和密碼' });
  }

  try {
    // 查詢用戶
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    // console.log('查詢到的用戶:', rows);

    if (rows.length === 0) {
      return res.status(400).json({ message: '用戶不存在' });
    }

    const user = rows[0];

    // 比對密碼
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '密碼錯誤' });
    }

    // 生成 JWT
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: '登入成功', token });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({
      message: '伺服器錯誤',
      error: {
        code: error.code,
        message: error.message
      }
    });
  }
});

module.exports = router;