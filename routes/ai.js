// routes/ai.js
const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');
const moment = require('moment');
const router = express.Router();
const auth = require('../middleware/auth');


// 從環境變數取得 AI API URL
const AI_API_URL = process.env.AI_API_URL;

const pool = require('../config/database');

// 輔助函數：將性別數字轉為文字
function mapGender(gender) {
  switch (gender) {
    case 0: return '男';
    case 1: return '女';
    case 2: return '其他';
    default: return '未知';
  }
}

// 輔助函數：將血糖測量情境數字轉為文字
function mapMeasurementContext(context) {
  switch (context) {
    case 'fasting': return '空腹';
    case 'before_meal': return '餐前';
    case 'after_meal': return '餐後';
    default: return '未知';
  }
}

// POST /api/v1/ai/chat - 與 AI Server 溝通，嵌入健康資料至 message
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.user_id; // 從 JWT 取得 user_id

    // 輸入驗證
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_INPUT',
          message: '請提供有效的 message 字串'
        }
      });
    }

    // 查詢用戶基本健康資訊
    const [healthInfo] = await pool.query(
      `SELECT height, weight, birthday, gender 
       FROM basic_health_info 
       WHERE user_id = ?`,
      [userId]
    );

    if (!healthInfo.length) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: '未找到用戶健康資訊，請先輸入基本健康資料'
        }
      });
    }

    
// 計算年齡
    const birthday = moment(healthInfo[0].birthday, 'YYYY-MM-DD');
    const today = moment(); // 動態取得當前日期
    let age = today.diff(birthday, 'years');
    if (today.isBefore(birthday.clone().add(age, 'years'))) age--; // 精確年齡

// 查詢最近 7 天的血糖紀錄
    const startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');
    const [bloodSugarRecords] = await pool.query(
      `SELECT measurement_date, measurement_context, blood_sugar 
       FROM blood_sugar_records 
       WHERE user_id = ? AND DATE(measurement_date) BETWEEN ? AND ? 
       ORDER BY measurement_date ASC`,
      [userId, startDate, endDate]
    );

    // 查詢最近 7 天的血壓紀錄
    const [vitalRecords] = await pool.query(
      `SELECT measurement_date, heart_rate, systolic_pressure, diastolic_pressure 
       FROM vital_records 
       WHERE user_id = ? AND DATE(measurement_date) BETWEEN ? AND ? 
       ORDER BY measurement_date ASC`,
      [userId, startDate, endDate]
    );

    // 格式化 message
    let formattedMessage = `我的身高為:${healthInfo[0].height + "公分" || '無資料'}，體重為:${healthInfo[0].weight +"公斤" || '無資料'}，年齡:${age + "歲" || '無資料'}，性別:${mapGender(healthInfo[0].gender)}。\n`;

    // 血糖紀錄
    if (bloodSugarRecords.length > 0) {
      formattedMessage += '最近 7 天血糖紀錄：\n';
      bloodSugarRecords.forEach((record, index) => {
        const day = index + 1; // 第 1 天起
        const formattedDate = moment(record.measurement_date).format('YYYY-MM-DD HH:mm:ss');
        formattedMessage += `${formattedDate} 血糖值為:${record.blood_sugar} 測量情境:${mapMeasurementContext(record.measurement_context)}\n`;
      });
    } else {
      formattedMessage += '最近 7 天無血糖紀錄。\n';
    }

    // 血壓紀錄
    if (vitalRecords.length > 0) {
      formattedMessage += '最近 7 天血壓紀錄：\n';
      vitalRecords.forEach((record, index) => {
        const day = index + 1; // 第 1 天起
        const formattedDate = moment(record.measurement_date).format('YYYY-MM-DD HH:mm:ss');
        formattedMessage += `${formattedDate} 舒張壓:${record.diastolic_pressure} 收縮壓為:${record.systolic_pressure} 心跳速率:${record.heart_rate}\n`;
      });
    } else {
      formattedMessage += '最近 7 天無血壓紀錄。\n';
    }

    // 將用戶輸入的 message 附加到格式化訊息後
    formattedMessage += `用戶問題：${message}`;
    console.log(formattedMessage);
    // 呼叫 AI Server API
    const aiResponse = await axios.post(`${AI_API_URL}/chat/ai`, {
      message: formattedMessage
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 40000, // 40 秒超時
      validateStatus: (status) => status < 500 // 只拋出 5xx 錯誤
    });

    // 回傳 AI 回應
    res.status(200).json({
      status: 'success',
      message: 'AI 回應取得成功',
      data: aiResponse.data
    });
  } catch (error) {
    console.error('AI API 或資料庫查詢失敗:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE' || error.sqlMessage) {
      return res.status(500).json({
        status: 'error',
        error: {
          code: 'DATABASE_ERROR',
          message: '無法取得健康資料，請檢查資料庫配置'
        }
      });
    }
    if (error.response) {
      return res.status(error.response.status).json({
        status: 'error',
        error: {
          code: 'AI_API_ERROR',
          message: 'AI 伺服器錯誤',
          details: error.response.data
        }
      });
    } else if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        status: 'error',
        error: {
          code: 'REQUEST_TIMEOUT',
          message: '請求 AI 伺服器超時'
        }
      });
    } else {
      return res.status(500).json({
        status: 'error',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '無法連線到 AI 伺服器，請檢查配置'
        }
      });
    }
  }
});

module.exports = router;