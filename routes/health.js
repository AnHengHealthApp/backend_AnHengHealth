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


module.exports = router;