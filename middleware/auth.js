const jwt = require('jsonwebtoken');
require('dotenv').config();

// 檢查 JWT_SECRET 是否存在
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET 未設置，請檢查環境變數');
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn(`認證失敗：未提供認證憑證，IP: ${req.ip}`);
    return res.status(401).json({
      error: {
        message: '未提供認證憑證'
      }
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.warn(`認證失敗：${err.message}，IP: ${req.ip}`);
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({
          error: {
            message: '認證憑證已過期，請重新登入'
          }
        });
      }
      return res.status(403).json({
        error: {
          message: '無效的認證憑證'
        }
      });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;