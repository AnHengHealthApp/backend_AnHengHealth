const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const { formatDateTime, formatDate } = require('../utils/time');

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
      birthday: formatDate(new Date(healthRows[0].birthday))
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
      birthday: formatDate(new Date(updatedRows[0].birthday))
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



// 寫入血糖記錄
router.post('/bloodSugar', authenticateToken, async (req, res) => {
  const { measurement_date, measurement_context, blood_sugar } = req.body;
  const user_id = req.user.user_id;

  // 驗證必填欄位
  if (!measurement_date || measurement_context === undefined || blood_sugar === undefined) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_INPUT',
        message: '請提供測量時間、測量情境和血糖值'
      }
    });
  }

  // 驗證測量情境（0: 空腹, 1: 餐前, 2: 餐後）
  const contextNum = Number(measurement_context);
  if (![0, 1, 2].includes(contextNum)) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_CONTEXT',
        message: '無效的測量情境，僅接受 0（空腹）、1（餐前）、2（餐後）'
      }
    });
  }

  // 驗證血糖值範圍
  
  if (!Number.isFinite(blood_sugar) || blood_sugar < 50 || blood_sugar > 500) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INPUT_OUT_OF_RANGE',
        message: '血糖值超出合理範圍（50.00-500.00 mg/dL）'
      }
    });
  }

  // 驗證日期格式
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(measurement_date)) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_DATE_FORMAT',
        message: '測量時間格式無效，應為 YYYY-MM-DD HH:mm:ss'
      }
    });
  }

  // 驗證日期有效性
  const date = new Date(measurement_date);
  if (isNaN(date.getTime())) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_DATE',
        message: '測量時間無效，請提供有效的日期和時間'
      }
    });
  }

  try {
    // 新增血糖記錄
    const [result] = await pool.query(
      'INSERT INTO blood_sugar_records (user_id, measurement_date, measurement_context, blood_sugar) VALUES (?, ?, ?, ?)',
      [user_id, measurement_date, contextNum, blood_sugar]
    );

    // 查詢新增的記錄
    const [newRecord] = await pool.query(
      'SELECT record_id, user_id, measurement_date, measurement_context, blood_sugar FROM blood_sugar_records WHERE record_id = ?',
      [result.insertId]
    );

    // 準備回應資料
    const responseData = {
      ...newRecord[0],
      measurement_date: formatDateTime(new Date(newRecord[0].measurement_date)), // YYYY-MM-DD HH:mm:ss
    };

    res.status(201).json({
      status: 'success',
      message: '血糖記錄已成功新增',
      data: responseData
    });
  } catch (error) {
    console.error('錯誤:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: '伺服器錯誤，無法新增血糖記錄'
      }
    });
  }
});


// 讀取血糖記錄（根據時間段查詢）
router.get('/bloodSugar', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { context, start_date, end_date } = req.query;

  let query = 'SELECT record_id, user_id, measurement_date, measurement_context, blood_sugar FROM blood_sugar_records WHERE user_id = ?';
  const params = [user_id];

  if (context !== undefined && context !== '') {
    const contextNum = Number(context);
    if (![0, 1, 2].includes(contextNum)) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_CONTEXT',
          message: '無效的測量情境，僅接受 0（空腹）、1（餐前）、2（餐後）'
        }
      });
    }
    query += ' AND measurement_context = ?';
    params.push(contextNum);
  }

  // 允許只提供 start_date，end_date 預設為今天
  if (start_date || end_date) {
    if (!start_date) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'MISSING_START_DATE',
          message: '請提供開始日期'
        }
      });
    }

    // 預設 end_date 為今天
    const todayStr = new Date().toISOString().slice(0, 10); // 取得今天 YYYY-MM-DD
    const finalEndDate = end_date || todayStr;

    // 驗證日期格式
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date) || !/^\d{4}-\d{2}-\d{2}$/.test(finalEndDate)) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_DATE_FORMAT',
          message: '日期格式無效，應為 YYYY-MM-DD'
        }
      });
    }

    const start = new Date(start_date);
    const end = new Date(finalEndDate + ' 23:59:59');
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_DATE',
          message: '無效的日期，請提供有效的開始和結束日期'
        }
      });
    }

    if (start > end) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_DATE_RANGE',
          message: '開始日期不能晚於結束日期'
        }
      });
    }

    query += ' AND measurement_date BETWEEN ? AND ?';
    params.push(start_date + ' 00:00:00', finalEndDate + ' 23:59:59');
  } else {
    query += ' AND measurement_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
  }

  query += ' ORDER BY measurement_date DESC';

  try {
    const [rows] = await pool.query(query, params);
    const responseData = rows.map(row => ({
      record_id: row.record_id,
      user_id: row.user_id,
      measurement_date: formatDateTime(new Date(row.measurement_date)),
      measurement_context: row.measurement_context,
      blood_sugar: Number(Number(row.blood_sugar).toFixed(2))
    }));

    res.status(200).json({
      status: 'success',
      message: rows.length ? '成功獲取血糖記錄' : '無符合條件的血糖記錄',
      data: responseData
    });
  } catch (error) {
    console.error('查詢血糖記錄錯誤:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: '伺服器錯誤，無法獲取血糖記錄'
      }
    });
  }
});


// 新增血壓紀錄
router.post('/vitals', authenticateToken, async (req, res) => {
  const { measurement_date, heart_rate, systolic_pressure, diastolic_pressure } = req.body;
  const user_id = req.user.user_id;

  // 驗證必填欄位
  if (!measurement_date || heart_rate === undefined || systolic_pressure === undefined || diastolic_pressure === undefined) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_INPUT',
        message: '請提供測量時間、心跳、收縮壓與舒張壓'
      }
    });
  }

  // 驗證格式與數值範圍
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(measurement_date)) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_DATE_FORMAT',
        message: '測量時間格式無效，應為 YYYY-MM-DD HH:mm:ss'
      }
    });
  }

  const date = new Date(measurement_date);
  if (isNaN(date.getTime())) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_DATE',
        message: '無效的測量時間'
      }
    });
  }

  if (
    !Number.isInteger(heart_rate) || heart_rate < 30 || heart_rate > 200 ||
    !Number.isInteger(systolic_pressure) || systolic_pressure < 70 || systolic_pressure > 250 ||
    !Number.isInteger(diastolic_pressure) || diastolic_pressure < 40 || diastolic_pressure > 150
  ) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INPUT_OUT_OF_RANGE',
        message: '請提供合理範圍內的心跳（30~200）、收縮壓（70~250）與舒張壓（40~150）'
      }
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO vital_records (user_id, measurement_date, heart_rate, systolic_pressure, diastolic_pressure)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, measurement_date, heart_rate, systolic_pressure, diastolic_pressure]
    );

    const [newRecord] = await pool.query(
      `SELECT * FROM vital_records WHERE vital_id = ?`,
      [result.insertId]
    );

    const responseData = {
      ...newRecord[0],
      measurement_date: formatDateTime(new Date(newRecord[0].measurement_date))
    };

    res.status(201).json({
      status: 'success',
      message: '血壓紀錄已成功新增',
      data: responseData
    });
  } catch (error) {
    console.error('錯誤:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: '伺服器錯誤，無法新增血壓紀錄'
      }
    });
  }
});

// 查詢血壓紀錄
router.get('/vitals', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { start_date, end_date } = req.query;

  let query = 'SELECT * FROM vital_records WHERE user_id = ?';
  const params = [user_id];

  if (start_date || end_date) {
    if (!start_date) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'MISSING_START_DATE',
          message: '請提供開始日期'
        }
      });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const finalEndDate = end_date || todayStr;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date) || !/^\d{4}-\d{2}-\d{2}$/.test(finalEndDate)) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_DATE_FORMAT',
          message: '日期格式無效，應為 YYYY-MM-DD'
        }
      });
    }

    const start = new Date(start_date);
    const end = new Date(finalEndDate + ' 23:59:59');

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_DATE_RANGE',
          message: '日期範圍無效，請確認開始與結束時間'
        }
      });
    }

    query += ' AND measurement_date BETWEEN ? AND ?';
    params.push(start_date + ' 00:00:00', finalEndDate + ' 23:59:59');
  } else {
    query += ' AND measurement_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
  }

  query += ' ORDER BY measurement_date DESC';

  try {
    const [rows] = await pool.query(query, params);

    const responseData = rows.map(row => ({
      vital_id: row.vital_id,
      user_id: row.user_id,
      measurement_date: formatDateTime(new Date(row.measurement_date)),
      heart_rate: row.heart_rate,
      systolic_pressure: row.systolic_pressure,
      diastolic_pressure: row.diastolic_pressure
    }));

    res.status(200).json({
      status: 'success',
      message: rows.length ? '成功取得血壓紀錄' : '無符合條件的紀錄',
      data: responseData
    });
  } catch (error) {
    console.error('查詢血壓紀錄錯誤:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: '伺服器錯誤，無法取得血壓紀錄'
      }
    });
  }
});


// 設定用藥提醒
router.post('/medication', authenticateToken, async (req, res) => {
  const { medication_name, dosage_time, dosage_condition, reminder_time } = req.body;
  const user_id = req.user.user_id;

  // 驗證必填欄位
  if (!medication_name || !dosage_time || !reminder_time) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_INPUT',
        message: '請提供藥物名稱、用藥時間和提醒時間'
      }
    });
  }



  // 驗證提醒時間格式（僅 HH:mm:ss）
  if (!/^\d{2}:\d{2}:\d{2}$/.test(reminder_time)) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_TIME_FORMAT',
        message: '提醒時間格式無效，應為 HH:mm:ss'
      }
    });
  }

  // 進一步驗證時間值的有效性
  const [hours, minutes, seconds] = reminder_time.split(':').map(Number);
  if (hours > 23 || minutes > 59 || seconds > 59) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_TIME',
        message: '提醒時間無效，小時應為 00-23，分秒應為 00-59'
      }
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO medication_reminders (user_id, medication_name, dosage_time, dosage_condition, reminder_time)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, medication_name, dosage_time, dosage_condition || null, reminder_time]
    );

    const [newRecord] = await pool.query(
      `SELECT * FROM medication_reminders WHERE reminder_id = ?`,
      [result.insertId]
    );

    const responseData = {
      ...newRecord[0],
      created_at: new Date(newRecord[0].created_at).toISOString()
    };

    res.status(201).json({
      status: 'success',
      message: '用藥提醒已成功設定',
      data: responseData
    });
  } catch (error) {
    console.error('錯誤:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: '伺服器錯誤，無法設定用藥提醒'
      }
    });
  }
});

// 查詢用藥提醒
router.get('/medication', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  let query = 'SELECT * FROM medication_reminders WHERE user_id = ?';
  const params = [user_id];

  // 使用 created_at 篩選最近7天的記錄
  // query += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
  query += ' ORDER BY created_at DESC';

  try {
    const [rows] = await pool.query(query, params);

    const responseData = rows.map(row => ({
      reminder_id: row.reminder_id,
      user_id: row.user_id,
      medication_name: row.medication_name,
      dosage_time: row.dosage_time,
      dosage_condition: row.dosage_condition,
      reminder_time: row.reminder_time,
      created_at: new Date(row.created_at).toISOString()
    }));

    res.status(200).json({
      status: 'success',
      message: rows.length ? '成功取得用藥提醒' : '無符合條件的用藥提醒',
      data: responseData
    });
  } catch (error) {
    console.error('查詢用藥提醒錯誤:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: '伺服器錯誤，無法取得用藥提醒'
      }
    });
  }
});


// 刪除用藥提醒
router.delete('/medication/:id', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const reminder_id = parseInt(req.params.id);

  // 驗證 reminder_id 是否為有效整數
  if (isNaN(reminder_id) || reminder_id <= 0) {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_ID',
        message: '請提供有效的提醒 ID'
      }
    });
  }

  try {
    // 檢查紀錄是否存在並屬於該用戶
    const [existingRecord] = await pool.query(
      `SELECT * FROM medication_reminders WHERE reminder_id = ? AND user_id = ?`,
      [reminder_id, user_id]
    );

    if (!existingRecord.length) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: '找不到該用藥提醒紀錄'
        }
      });
    }

    // 刪除紀錄
    await pool.query(
      `DELETE FROM medication_reminders WHERE reminder_id = ? AND user_id = ?`,
      [reminder_id, user_id]
    );

    res.status(200).json({
      status: 'success',
      message: '用藥提醒已成功刪除',
      data: { reminder_id }
    });
  } catch (error) {
    console.error('刪除用藥提醒錯誤:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: '伺服器錯誤，無法刪除用藥提醒'
      }
    });
  }
});


module.exports = router;