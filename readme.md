# Anhen Health Assistant API 文檔

base URL: `{BACKEND_BASE_URL}/api/v1`


## 1. 用戶註冊
### `POST /register`
註冊新用戶。

#### 請求參數
- **Content-Type**: `application/json`
- **Body**:
  ```json
    {
    "username": "string (最大50字元)",
    "password": "string",
    "email": "string (最大100字元，有效電子郵件格式)",
    "display_name": "string (最大50字元)"
    }
  ```

#### 成功回應
- **狀態碼**: `201 Created`
- **Body**:
  ```json
  {
    "message": "註冊成功",
    "user_id": "integer"
  }
  ```

#### 錯誤回應
- `400 Bad Request`:
  ```json
  {
    "error": {
      "message": "請提供帳戶、密碼、電子郵件和使用者名稱"
    }
  }
  ```
  ```json
  {
    "error": {
      "message": "帳戶、電子郵件或使用者名稱超出長度限制"
    }
  }
  ```
  ```json
  {
    "error": {
      "message": "電子郵件格式無效"
    }
  }
  ```
  ```json
  {
    "error": {
      "message": "帳戶或電子郵件已存在"
    }
  }
  ```
- `500 Internal Server Error`:
  ```json
  {
    "error": {
      "message": "資料庫連線失敗，請檢查配置"
    }
  }
  ```
  ```json
  {
    "error": {
      "message": "伺服器錯誤",
      "details": {
        "code": "string",
        "message": "string"
      }
    }
  }
  ```

---

## 2. 用戶登入
### `POST /login`
用戶登入並獲取JWT令牌。

#### 請求參數
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

#### 成功回應
- **狀態碼**: `200 OK`
- **Body**:
  ```json
  {
    "message": "登入成功",
    "token": "string"
  }
  ```

#### 錯誤回應
- `400 Bad Request`:
  ```json
  {
    "error": {
      "message": "請提供用戶名和密碼"
    }
  }
  ```
  ```json
  {
    "error": {
      "message": "用戶不存在"
    }
  }
  ```
  ```json
  {
    "error": {
      "message": "密碼錯誤"
    }
  }
  ```
- `500 Internal Server Error`:
  ```json
  {
    "error": {
      "message": "伺服器錯誤",
      "details": {
        "code": "string",
        "message": "string"
      }
    }
  }
  ```

---

## 3. 提交問題回報
### `POST /issue`
提交問題回報（需認證）。
#### 請求參數
- **Headers**:
  ```
  Authorization: Bearer <token>
  ```
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "issue_description": "string (最大1000字元)"
  }
  ```

#### 成功回應
- **狀態碼**: `201 Created`
- **Body**:
  ```json
  {
    "message": "問題已回報",
    "report_id": "integer"
  }
  ```

#### 錯誤回應
- `400 Bad Request`:
  ```json
  {
    "error": {
      "message": "請提供問題描述"
    }
  }
  ```
  ```json
  {
    "error": {
      "message": "問題描述長度不能超過1000字元"
    }
  }
  ```
- `401 Unauthorized`:
  ```json
  {
    "error": {
      "message": "未提供認證憑證"
    }
  }
  ```
- `403 Forbidden`:
  ```json
  {
    "error": {
      "message": "認證憑證已過期，請重新登入"
    }
  }
  ```
  ```json
  {
    "error": {
      "message": "無效的認證憑證"
    }
  }
  ```
- `500 Internal Server Error`:
  ```json
  {
    "error": {
      "message": "伺服器錯誤",
      "details": {
        "code": "string",
        "message": "string"
      }
    }
  }
  ```

---

