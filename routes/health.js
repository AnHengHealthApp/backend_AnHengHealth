const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');


// 讀取基本健康資訊
router.get('/basic', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  try {
    // 查詢健康資訊
    const [healthRows] = await pool.query(
      'SELECT health_id, user_id, height, weight, birthday, gender FROM basic_health_info WHERE user_id = ?',
      [user_id]
    );

    // 檢查是否有健康資訊
    if (!healthRows.length) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: '未找到健康資訊，請先輸入您的身高、體重等基本健康資料'
        }
      });
    }

    // 準備回應資料
    const responseData = {
      ...healthRows[0],
      birthday: new Date(healthRows[0].birthday).toISOString().split('T')[0] // 轉成 YYYY-MM-DD 格式
    };

    // 成功回應
    res.status(200).json({
      status: 'success',
      message: '成功獲取健康資訊',
      data: responseData
    });
  } catch (error) {
    console.error('錯誤:', error);
    // 資料庫連線或查詢錯誤
    res.status(500).json({ status: 'error', message: '伺服器錯誤' });
  }
});


// 寫入基本健康資訊
router.post('/basic', authenticateToken, async (req, res) => {
  const { height, weight, birthday, gender } = req.body;
  const user_id = req.user.user_id;

  if (!height || !weight || !birthday) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_INPUT',
        message: '請提供身高、體重和生日'
      }
    });
  }

  if (height < 100 || height > 250 || weight < 20 || weight > 300) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INPUT_OUT_OF_RANGE',
        message: '身高或體重超出合理範圍'
      }
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_DATE_FORMAT',
        message: '生日格式無效，應為 YYYY-MM-DD'
      }
    });
  }

  let genderValue = null;
  if (gender !== undefined) {
    if (![0, 1, 2].includes(gender)) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_GENDER_INPUT',
          message: '性別值無效，僅接受 0（男）, 1（女）, 2（其他）'
        }
      });
    }
    genderValue = gender;
  }

  try {
    // 新增或更新基本健康資訊
    const [result] = await pool.query(
      'INSERT INTO basic_health_info (user_id, height, weight, birthday, gender) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE height = ?, weight = ?, birthday = ?, gender = ?',
      [user_id, height, weight, birthday, genderValue, height, weight, birthday, genderValue]
    );

    // 取得更新後資料
    const [updatedRows] = await pool.query(
      'SELECT health_id, user_id, height, weight, birthday, gender FROM basic_health_info WHERE user_id = ?',
      [user_id]
    );

    const responseData = {
      ...updatedRows[0],
      birthday: new Date(updatedRows[0].birthday).toISOString().split('T')[0]
    };

    res.status(201).json({
      status: 'success',
      message: '基本健康資訊已更新',
      data: responseData
    });
  } catch (error) {
    console.error('錯誤:', error);
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    });
  }
});

module.exports = router;