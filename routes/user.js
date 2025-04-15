const express = require('express');
const multer = require('multer');
const pool = require('../config/database.js');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// 設定 Multer 儲存到記憶體（因為我們直接存 BLOB）
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('無效的檔案格式，僅支援 jpg、png'));
    }
    cb(null, true);
  },
  limits: { fileSize: 15 * 1024 * 1024 } // 1MB 限制（可調整）
});

// 上傳頭像 API
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: '請選擇一個檔案' });
    }

    const userId = req.user.user_id; // 從 JWT 獲取 user_id
    const avatarData = req.file.buffer; // 獲取檔案的二進位資料

    // 更新資料庫
    const [result] = await pool.query(
      'UPDATE users SET avatar = ? WHERE user_id = ?',
      [avatarData, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: '用戶不存在' });
    }

    res.status(200).json({
      status: 'success',
      message: '頭像上傳成功',
      data: {
        user_id: userId
      }
    });
  } catch (error) {
    console.error(error);
    if (error.message.includes('無效的檔案格式')) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ status: 'error', message: '檔案過大，限制 1MB' });
    }
    res.status(500).json({ status: 'error', message: '伺服器錯誤' });
  }
});

// 獲取頭像 API
router.get('/avatar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id; // 從 JWT 獲取 user_id

    const [rows] = await pool.query(
      'SELECT avatar FROM users WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0 || !rows[0].avatar) {
      return res.status(404).json({ status: 'error', message: '頭像不存在' });
    }

    // 設置正確的 Content-Type（假設為 jpeg，可根據實際 mimetype 動態設置）
    res.set('Content-Type', 'image/jpeg');
    res.send(rows[0].avatar); // 直接傳送二進位資料
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: '伺服器錯誤' });
  }
});

module.exports = router;