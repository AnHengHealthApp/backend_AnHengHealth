const express = require('express');
const multer = require('multer');
const pool = require('../config/database.js');
const authenticateToken = require('../middleware/auth');
const crypto = require('crypto');
const router = express.Router();
const transporter = require('../utils/mailer');
const bcrypt = require('bcrypt');

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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB 限制
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
      return res.status(400).json({ status: 'error', message: '檔案過大，限制 5MB' });
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

// 修改使用者資訊 API
router.post('/profile', authenticateToken, async (req, res) => {
    const { display_name, email } = req.body;
    const userId = req.user.user_id; // 從 JWT 獲取 user_id

    // 驗證輸入
    if (!display_name && !email) {
        return res.status(400).json({ status: 'error', message: '請提供要修改的名稱或電子郵件' });
    }

    // 加入長度限制驗證
    if (display_name && display_name.length > 50) {
        return res.status(400).json({ status: 'error', message: '使用者名稱超出長度限制（最多 50 字元）' });
    }

    if (email && email.length > 100) {
        return res.status(400).json({ status: 'error', message: '電子郵件超出長度限制（最多 100 字元）' });
    }

    try {
        let updateFields = [];
        let updateValues = [];

        if (display_name) {
            updateFields.push('display_name = ?');
            updateValues.push(display_name);
        }

        if (email) {
            // 加入電子郵件格式驗證
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ status: 'error', message: '電子郵件格式無效' });
            }

            // 檢查新的電子郵件是否已經被其他使用者使用
            const [existingEmail] = await pool.query('SELECT user_id FROM users WHERE email = ? AND user_id != ?', [email, userId]);
            if (existingEmail.length > 0) {
                return res.status(409).json({ status: 'error', message: '此電子郵件已被註冊' });
            }
            updateFields.push('email = ?');
            updateValues.push(email);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ status: 'error', message: '沒有提供有效的更新欄位' });
        }

        updateValues.push(userId); 

        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`;
        const [result] = await pool.query(query, updateValues);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: '用戶不存在或沒有資料被修改' });
        }

        res.status(200).json({
            status: 'success',
            message: '使用者資訊更新成功',
            data: {
                user_id: userId,
                display_name: display_name || req.user.display_name, // 返回更新後或原有的值
                email: email || req.user.email
            }
        });

    } catch (error) {
        console.error('更新使用者資訊錯誤:', error);
        res.status(500).json({ status: 'error', message: '伺服器錯誤', details: error.message });
    }
});


// 忘記密碼：產生重設連結並寄送
router.post('/forgot-password-mail', async (req, res) => {
  const { email } = req.body;

  // 簡單檢查
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: { message: '請提供有效的電子郵件' } });
  }

  try {
    // 查詢用戶是否存在
    const [users] = await pool.query('SELECT user_id, display_name FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: { message: '查無此電子郵件的使用者' } });
    }

    const user = users[0];

    // 產生 token（32 字節亂數）
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 分鐘後過期

    // 儲存 token 到資料庫
    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)  ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
      [user.user_id, token, expiresAt]
    );

    // 建立重設密碼連結
    const resetLink = `${process.env.FRONTEND_BASE_URL}/reset/password?token=${token}`;

    // 寄送重設密碼信件
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '密碼重設申請',
      html: `
        <h2>密碼重設通知</h2>
        <p>您好，${user.display_name}：</p>
        <p>我們收到您重設密碼的請求，請點擊以下連結完成操作：</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p><strong>注意：</strong>此連結將在 15 分鐘後失效。如非您本人操作，請忽略此信件。</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('寄送忘記密碼信件失敗:', error);
        return res.status(500).json({ error: { message: '無法寄送重設密碼信件' } });
      } else {
        console.log('重設密碼信件已寄送:', info.response);
        res.status(200).json({ message: '已發送密碼重設連結至您的信箱' });
      }
    });
  } catch (error) {
    console.error('忘記密碼處理錯誤:', error);
    res.status(500).json({
      error: {
        message: '伺服器錯誤，請稍後再試',
        details: error.message,
      }
    });
  }
});

// 密碼重設
router.post('/reset-password', async (req, res) => {
  const { token, new_password } = req.body;

  // 簡單驗證
  if (!token || !new_password) {
    return res.status(400).json({ error: { message: '請提供重設 token 與新密碼' } });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: { message: '密碼長度至少需 6 個字元' } });
  }

  try {
    // 查詢 token 是否有效與未過期
    const [rows] = await pool.query(
      'SELECT user_id FROM password_resets WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: { message: '無效或過期的 token' } });
    }

    const userId = rows[0].user_id;

    // 加密新密碼
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // 更新密碼
    await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, userId]);

    // 刪除該 token（已使用）
    await pool.query('DELETE FROM password_resets WHERE token = ?', [token]);

    res.status(200).json({ message: '密碼已成功重設' });
  } catch (error) {
    console.error('重設密碼錯誤:', error);
    res.status(500).json({
      error: {
        message: '伺服器錯誤，請稍後再試',
        details: error.message
      }
    });
  }
});
module.exports = router;