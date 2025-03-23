const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 設置郵件傳輸服務
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, //  TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 檢查環境變數
if (!process.env.DEVELOPER_EMAIL || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('缺少郵件服務配置，請檢查 .env 檔案中的 EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS 和 DEVELOPER_EMAIL');
}

// 寫入問題回報
router.post('/issue', authenticateToken, async (req, res) => {
  const { issue_description } = req.body;
  const user_id = req.user.user_id;

  // 輸入驗證
  if (!issue_description || issue_description.trim() === '') {
    return res.status(400).json({
      error: {
        message: '請提供問題描述'
      }
    });
  }

  if (issue_description.length > 1000) {
    return res.status(400).json({
      error: {
        message: '問題描述長度不能超過1000字元'
      }
    });
  }

  try {
    // 插入問題回報
    const [result] = await pool.query(
      'INSERT INTO issue_reports (user_id, issue_description) VALUES (?, ?)',
      [user_id, issue_description]
    );

    // 查詢用戶資訊以獲取 email 和 display_name
    const [userRows] = await pool.query(
      'SELECT email, display_name FROM users WHERE user_id = ?',
      [user_id]
    );

    if (userRows.length === 0) {
      console.warn(`用戶 ${user_id} 不存在，無法寄送問題回報通知`);
      return res.status(400).json({
        error: {
          message: `用戶 ${user_id} 不存在，無法寄送問題回報通知`
        }
      });
    } else {
      const { email, display_name } = userRows[0];

      // 設置郵件內容
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.DEVELOPER_EMAIL,
        subject: `新的問題回報 - 用戶 ${display_name} (${user_id})`,
        text: `
          用戶ID: ${user_id}
          使用者名稱: ${display_name}
          電子郵件: ${email}
          問題描述: ${issue_description}
          回報時間: ${new Date().toISOString()}
        `,
        html: `
          <h2>新的問題回報</h2>
          <p><strong>用戶ID:</strong> ${user_id}</p>
          <p><strong>使用者名稱:</strong> ${display_name}</p>
          <p><strong>電子郵件:</strong> ${email}</p>
          <p><strong>問題描述:</strong> ${issue_description}</p>
          <p><strong>回報時間:</strong> ${new Date().toISOString()}</p>
        `,
      };

      // 寄送郵件
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('寄送問題回報郵件失敗:', error);
          return res.status(400).json({
            error: {
              message: `寄送問題回報郵件失敗:` + error
            }
          });
        } else {
          console.log('問題回報郵件已寄送:', info.response);
             // 回應成功
          res.status(201).json({ message: '問題已回報', report_id: result.insertId });
        }
      });
    }

 
  } catch (error) {
    console.error('寫入問題回報錯誤:', error);
    res.status(500).json({
      error: {
        message: '伺服器錯誤',
        details: {
          code: error.code,
          message: error.message
        }
      }
    });
  }
});

module.exports = router;