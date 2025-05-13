# Anhen Health Assistant API伺服器架設文檔

## 概述
本文件提供「Anhen Health Assistant」後端 API 伺服器的架設指南，包含環境設置、依賴安裝、資料庫配置、環境變數設置和啟動步驟。後端使用 Node.js 和 Express.js 框架，資料庫使用 MySQL，並支援 JWT 認證和電子郵件通知功能。

---

## 環境要求
- **Node.js**: 版本 16.x 或更高（建議使用最新 LTS 版本）
- **npm**: 隨 Node.js 一起安裝（建議版本 8.x 或更高）
- **MySQL**: 版本 8.0 或更高
- **作業系統**: Windows、macOS 或 Linux
- **郵件服務**: 需要一個 SMTP 服務（如 Gmail）用於寄送問題回報通知

---

## 專案結構
以下是專案的檔案結構概覽：

```
/
├── config/
│   └── database.js        # 資料庫連線
├── middleware/
│   └── auth.js  # JWT 認證中間件
├── routes/
│   ├── auth.js           # 認證相關路由（註冊、登入、用戶資訊）
│   ├── health.js           # 健康相關
│   ├── user.js           # 用戶 (頭像)
│   └── report.js          # 問題回報路由
├── template/
│   └── anhen_health_assistant.sql   # 資料表樣板
├── utils/
│   └── time.js   # 時間相關function
│
├── .env                  # 環境變數配置文件
├── .env_example          # 環境變數配置文件 樣板
├── server.js             # server
├── package.json          # 專案依賴和腳本
└── README.md             # 專案說明文件
```

---

## 架設步驟

### 1. 克隆專案
將專案克隆到本地：

```bash
git clone <repository-url>
cd anhen-health-assistant
```

### 2. 安裝依賴
使用 npm 安裝專案所需的依賴：

```bash
npm install
```

#### 依賴列表
- `express`: Web 框架
- `mysql2`: MySQL 資料庫驅動
- `jsonwebtoken`: JWT 認證
- `bcrypt`: 密碼加密
- `nodemailer`: 電子郵件寄送
- `dotenv`: 環境變數管理

### 3. 設置資料庫
#### 3.1 安裝並啟動 MySQL
確保 MySQL 已安裝並運行。如果尚未安裝，請參考官方文件進行安裝：
- [MySQL 安裝指南](https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/)

#### 3.2 創建資料庫
連接到 MySQL 並創建資料庫：

```sql
CREATE DATABASE anhen_health_assistant;
```

#### 3.3 匯入資料表
資料表模板位置：
```
./template/anhen_health_assistant.sql
```




### 4. 設置環境變數
在專案根目錄下創建 `.env` 檔案，並添加以下環境變數：

```env
# 伺服器端口
PORT=3000

# 資料庫配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=anhen_health_assistant

# JWT 密鑰
JWT_SECRET=your_jwt_secret_key

# 郵件服務配置（以 Gmail 為例）
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
DEVELOPER_EMAIL=developer_email@example.com
```

#### 環境變數說明
- `PORT`: 伺服器運行的端口，預設為 3000。
- `DB_*`: 資料庫連線資訊，根據你的 MySQL 配置調整。
- `JWT_SECRET`: 用於簽署 JWT 的密鑰，建議使用隨機且安全的字串（至少 32 字元）。
- `EMAIL_*`: 郵件服務配置，用於寄送問題回報通知。
  - 如果使用 Gmail，`EMAIL_PASS` 應為應用程式密碼（App Password），請參考 [Gmail 應用程式密碼設置](https://support.google.com/accounts/answer/185833)。
- `DEVELOPER_EMAIL`: 接收問題回報通知的開發者信箱。

### 5. 啟動伺服器
運行以下命令啟動伺服器：

```bash
npm start
```


啟動後，你應該會看到以下訊息：

```
Server running on port 3000
```

### 6. 測試 API
使用工具（如 Postman 或 cURL）測試 API 端點。以下是幾個主要端點：
- **註冊**: `POST {BACKEND_BASE_URL}/api/v1/auth/register`
- **登入**: `POST {BACKEND_BASE_URL}/api/v1/auth/login`
- **提交問題回報**: `POST {BACKEND_BASE_URL}/api/v1/issue`（需認證）

詳細的 API 規格請參考 [API 文檔](#api-文檔)。

---

## 常見問題排查

### 1. 資料庫連線失敗
- **錯誤訊息**：`Error: ER_ACCESS_DENIED_ERROR: Access denied for user...`
- **解決方法**：
  - 檢查 `.env` 中的 `DB_USER` 和 `DB_PASSWORD` 是否正確。
  - 確保 MySQL 服務正在運行：`mysql.server start`（macOS）或 `sudo systemctl start mysql`（Linux）。
  - 確認資料庫 `anhen_health_assistant` 已創建。

### 2. 郵件寄送失敗
- **錯誤訊息**：`寄送問題回報郵件失敗: ...`
- **解決方法**：
  - 檢查 `.env` 中的 `EMAIL_*` 配置是否正確。
  - 如果使用 Gmail，確保 `EMAIL_PASS` 是應用程式密碼，而不是帳戶密碼。
  - 確認網路連線是否正常，SMTP 服務器是否可訪問。

### 3. JWT 驗證失敗
- **錯誤訊息**：`無效的認證憑證`
- **解決方法**：
  - 確保 `.env` 中的 `JWT_SECRET` 已設置，且與生成 JWT 時使用的密鑰一致。
  - 檢查請求頭是否包含正確的 `Authorization: Bearer <token>`。

### 4. 伺服器啟動失敗
- **錯誤訊息**：`Error: listen EADDRINUSE: address already in use :::3000`
- **解決方法**：
  - 端口 3000 已被占用，嘗試更改 `.env` 中的 `PORT` 為其他值（例如 3001）。
  - 終止占用 3000 端口的進程

---


# API 文檔
base URL: `{BACKEND_BASE_URL}/api/v1`

## 1. 用戶註冊
### `POST /auth/register`
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
### `POST /auth/login`
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
### `POST /report/issue`
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



## 4. 頭像上傳

### `POST /user/avatar`
上傳或更新用戶頭像，儲存為二進位資料（需認證）。

#### 請求參數
- **Headers**:
  ```
  Authorization: Bearer <token>
  ```
- **Content-Type**: `multipart/form-data`
- **Body**:
  ```
  avatar: file (jpg, png, jpeg; 最大15MB)
  ```

#### 成功回應
- **狀態碼**: `200 OK`
- **Body**:
  ```json
  {
    "status": "success",
    "message": "頭像上傳成功",
    "data": {
      "user_id": "integer"
    }
  }
  ```

#### 錯誤回應
- `400 Bad Request`:
  ```json
  {
    "error": {
      "message": "請選擇一個檔案"
    }
  }
  ```
  ```json
  {
    "error": {
      "message": "無效的檔案格式，僅支援 jpg、png"
    }
  }
  ```
  ```json
  {
    "error": {
      "message": "檔案過大，限制 15MB"
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
      "message": "無效的認證憑證"
    }
  }
  ```
- `404 Not Found`:
  ```json
  {
    "error": {
      "message": "用戶不存在"
    }
  }
  ```
- `500 Internal Server Error`:
  ```json
  {
    "error": {
      "message": "伺服器錯誤",
      "details": {
        "code": "unknown",
        "message": "無法處理請求"
      }
    }
  }
  ```
## 5. 取得頭像
### `GET /user/avatar`
獲取當前用戶的頭像二進位資料（需認證）。

#### 請求參數
- **Headers**:
  ```
  Authorization: Bearer <token>
  ```

#### 成功回應
- **狀態碼**: `200 OK`
- **Content-Type**: `image/jpeg` （或 `image/png`，視檔案類型而定）
- **Body**: 圖片二進位資料

#### 錯誤回應
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
      "message": "無效的認證憑證"
    }
  }
  ```
- `404 Not Found`:
  ```json
  {
    "error": {
      "message": "頭像不存在"
    }
  }
  ```
- `500 Internal Server Error`:
  ```json
  {
    "error": {
      "message": "伺服器錯誤",
      "details": {
        "code": "unknown",
        "message": "無法處理請求"
      }
    }
  }
  ```


---


## 6. 獲取基本健康資訊

#### `GET /health/basic`
獲取用戶的基本健康資訊（需認證）。

##### 請求參數
- **Headers**:
  ```
  Authorization: Bearer <token>
  ```
- **Query Parameters**: 無

##### 成功回應
- **狀態碼**: `200 OK`
- **Body**:
  ```json
  {
    "status": "success",
    "message": "成功獲取健康資訊",
    "data": {
      "health_id": "integer",
      "user_id": "integer",
      "height": "number",
      "weight": "number",
      "birthday": "string (YYYY-MM-DD)",
      "gender": "integer (0=男, 1=女, 2=其他) | null"
    }
  }
  ```

##### 錯誤回應
- `401 Unauthorized`:
  ```json
  {
    "status": "error",
    "error": {
      "code": "UNAUTHORIZED",
      "message": "未提供認證憑證"
    }
  }
  ```
- `403 Forbidden`:
  ```json
  {
    "status": "error",
    "error": {
      "code": "INVALID_TOKEN",
      "message": "無效的認證憑證"
    }
  }
  ```
- `404 Not Found`:
  ```json
  {
    "status": "error",
    "error": {
      "code": "NOT_FOUND",
      "message": "未找到健康資訊，請先輸入您的身高、體重等基本健康資料"
    }
  }
  ```
- `500 Internal Server Error`:
  ```json
  {
    "status": "error",
    "error": {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "伺服器錯誤"
    }
  }
  ```


## 7. 新增或更新基本健康資訊
#### `POST /health/basic`
新增或更新用戶的基本健康資訊（需認證）。

##### 請求參數
- **Headers**:
  ```
  Authorization: Bearer <token>
  ```
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "height": "number (100-250)",
    "weight": "number (20-300)",
    "birthday": "string (YYYY-MM-DD)",
    "gender": "integer (0=男, 1=女, 2=其他) | optional"
  }
  ```

##### 成功回應
- **狀態碼**: `201 Created`
- **Body**:
  ```json
  {
    "status": "success",
    "message": "基本健康資訊已更新",
    "data": {
      "health_id": "integer",
      "user_id": "integer",
      "height": "number",
      "weight": "number",
      "birthday": "string (YYYY-MM-DD)",
      "gender": "integer (0=男, 1=女, 2=其他) | null"
    }
  }
  ```

##### 錯誤回應
- `400 Bad Request`:
  ```json
  {
    "status": "error",
    "error": {
      "code": "INVALID_INPUT",
      "message": "請提供身高、體重和生日"
    }
  }
  ```
  ```json
  {
    "status": "error",
    "error": {
      "code": "INPUT_OUT_OF_RANGE",
      "message": "身高或體重超出合理範圍"
    }
  }
  ```
  ```json
  {
    "status": "error",
    "error": {
      "code": "INVALID_DATE_FORMAT",
      "message": "生日格式無效，應為 YYYY-MM-DD"
    }
  }
  ```
  ```json
  {
    "status": "error",
    "error": {
      "code": "INVALID_GENDER_INPUT",
      "message": "性別值無效，僅接受 0（男）, 1（女）, 2（其他）"
    }
  }
  ```
- `401 Unauthorized`:
  ```json
  {
    "status": "error",
    "error": {
      "code": "UNAUTHORIZED",
      "message": "未提供認證憑證"
    }
  }
  ```
- `403 Forbidden`:
  ```json
  {
    "status": "error",
    "error": {
      "code": "INVALID_TOKEN",
      "message": "無效的認證憑證"
    }
  }
  ```
- `500 Internal Server Error`:
  ```json
  {
    "status": "error",
    "error": {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "伺服器錯誤"
    }
  }
  ```

---

## 8. 新增血糖記錄  
#### `POST /bloodSugar`  
新增使用者的血糖測量紀錄（需認證）。

### 🔸 Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### 🔸 Request Body
| 參數名稱             | 類型     | 必填 | 說明                                         |
|----------------------|----------|------|----------------------------------------------|
| measurement_date     | string   | ✅   | 測量時間，格式：`YYYY-MM-DD HH:mm:ss`        |
| measurement_context  | integer  | ✅   | 測量情境：`0`=空腹、`1`=餐前、`2`=餐後         |
| blood_sugar          | number   | ✅   | 血糖值（mg/dL），範圍：50.00 ~ 500.00        |

### 🔸 範例 Request
```json
{
  "measurement_date": "2025-04-28 08:30:00",
  "measurement_context": 0,
  "blood_sugar": 92.5
}
```

### 🔸 成功回應 (201 Created)
```json
{
  "status": "success",
  "message": "血糖記錄已成功新增",
  "data": {
    "record_id": 77,
    "user_id": 123,
    "measurement_date": "2025-04-28 08:30:00",
    "measurement_context": 0,
    "blood_sugar": 92.5
  }
}
```

### 🔸 錯誤回應

- 缺少欄位：
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_INPUT",
    "message": "請提供測量時間、測量情境和血糖值"
  }
}
```

- 測量情境錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_CONTEXT",
    "message": "無效的測量情境，僅接受 0（空腹）、1（餐前）、2（餐後）"
  }
}
```

- 血糖值錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "INPUT_OUT_OF_RANGE",
    "message": "血糖值超出合理範圍（50.00-500.00 mg/dL）"
  }
}
```

- 時間格式錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "測量時間格式無效，應為 YYYY-MM-DD HH:mm:ss"
  }
}
```

- 無效時間：
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_DATE",
    "message": "測量時間無效，請提供有效的日期和時間"
  }
}
```

- 認證錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "未提供認證憑證"
  }
}
```
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_TOKEN",
    "message": "無效的認證憑證"
  }
}
```

- 伺服器錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "伺服器錯誤，無法新增血糖記錄"
  }
}
```

---

## 9. 查詢血糖記錄  
#### `GET /bloodSugar`  
依據條件查詢使用者的血糖紀錄（需認證）。

### 🔸 Request Headers
```
Authorization: Bearer <token>
```

### 🔸 Query Parameters
| 參數名稱     | 類型     | 必填 | 說明                                                   |
|--------------|----------|------|--------------------------------------------------------|
| context      | integer  | ❌   | 測量情境：`0`=空腹、`1`=餐前、`2`=餐後                 |
| start_date   | string   | ❌   | 開始日期，格式：`YYYY-MM-DD`（提供此值則為條件查詢）   |
| end_date     | string   | ❌   | 結束日期，格式：`YYYY-MM-DD`，預設為今天               |
> 若未提供 `start_date`，預設查詢最近七天。
### 🔸 範例 Request
```
GET /bloodSugar?context=1&start_date=2025-04-01&end_date=2025-04-28
```

### 🔸 成功回應 (200 OK)
```json
{
  "status": "success",
  "message": "成功獲取血糖記錄",
  "data": [
    {
      "record_id": 77,
      "user_id": 123,
      "measurement_date": "2025-04-28 08:30:00",
      "measurement_context": 1,
      "blood_sugar": 92.5
    },
    {
      "record_id": 76,
      "user_id": 123,
      "measurement_date": "2025-04-20 08:15:00",
      "measurement_context": 1,
      "blood_sugar": 89.7
    }
  ]
}
```

### 🔸 錯誤回應

- 測量情境錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_CONTEXT",
    "message": "無效的測量情境，僅接受 0（空腹）、1（餐前）、2（餐後）"
  }
}
```

- 缺少開始日期：
```json
{
  "status": "error",
  "error": {
    "code": "MISSING_START_DATE",
    "message": "請提供開始日期"
  }
}
```

- 日期格式錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "日期格式無效，應為 YYYY-MM-DD"
  }
}
```

- 無效日期：
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_DATE",
    "message": "無效的日期，請提供有效的開始和結束日期"
  }
}
```

- 日期邏輯錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "開始日期不能晚於結束日期"
  }
}
```

- 認證錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "未提供認證憑證"
  }
}
```
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_TOKEN",
    "message": "無效的認證憑證"
  }
}
```

- 伺服器錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "伺服器錯誤，無法獲取血糖記錄"
  }
}
```
---

## 9. 新增血壓紀錄  
#### `POST /vitals`  
新增使用者的血壓與心跳紀錄（需認證）。

### 🔸 Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### 🔸 Request Body
| 參數名稱            | 類型     | 必填 | 說明                                       |
|---------------------|----------|------|--------------------------------------------|
| measurement_date    | string   | ✅   | 測量時間，格式：`YYYY-MM-DD HH:mm:ss`     |
| heart_rate          | integer  | ✅   | 心跳，範圍：30 ~ 200                       |
| systolic_pressure   | integer  | ✅   | 收縮壓，範圍：70 ~ 250                     |
| diastolic_pressure  | integer  | ✅   | 舒張壓，範圍：40 ~ 150                     |

### 🔸 範例 Request
```json
POST /vitals
{
  "measurement_date": "2025-04-29 08:15:00",
  "heart_rate": 76,
  "systolic_pressure": 118,
  "diastolic_pressure": 78
}
```

### 🔸 成功回應 (201 Created)
```json
{
  "status": "success",
  "message": "血壓紀錄已成功新增",
  "data": {
    "vital_id": 101,
    "user_id": 123,
    "measurement_date": "2025-04-29 08:15:00",
    "heart_rate": 76,
    "systolic_pressure": 118,
    "diastolic_pressure": 78
  }
}
```

### 🔸 錯誤回應

- 缺少欄位：
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_INPUT",
    "message": "請提供測量時間、心跳、收縮壓與舒張壓"
  }
}
```

- 時間格式錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "測量時間格式無效，應為 YYYY-MM-DD HH:mm:ss"
  }
}
```

- 無效時間：
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_DATE",
    "message": "無效的測量時間"
  }
}
```

- 數值超出範圍：
```json
{
  "status": "error",
  "error": {
    "code": "INPUT_OUT_OF_RANGE",
    "message": "請提供合理範圍內的心跳（30~200）、收縮壓（70~250）與舒張壓（40~150）"
  }
}
```

- 認證錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "未提供認證憑證"
  }
}
```

- 伺服器錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "伺服器錯誤，無法新增血壓紀錄"
  }
}
```

---

## 10. 查詢血壓紀錄  
#### `GET /vitals`  
依據條件查詢使用者的血壓紀錄（需認證）。

### 🔸 Request Headers
```
Authorization: Bearer <token>
```

### 🔸 Query Parameters
| 參數名稱     | 類型     | 必填 | 說明                                                |
|--------------|----------|------|-----------------------------------------------------|
| start_date   | string   | ❌   | 開始日期，格式：`YYYY-MM-DD`（提供此值則為條件查詢）|
| end_date     | string   | ❌   | 結束日期，格式：`YYYY-MM-DD`，預設為今天            |

> 若未提供 `start_date`，預設查詢最近七天。

### 🔸 範例 Request
```
GET /vitals?start_date=2025-04-01&end_date=2025-04-29
```

### 🔸 成功回應 (200 OK)
```json
{
  "status": "success",
  "message": "成功取得血壓紀錄",
  "data": [
    {
      "vital_id": 101,
      "user_id": 123,
      "measurement_date": "2025-04-29 08:15:00",
      "heart_rate": 76,
      "systolic_pressure": 118,
      "diastolic_pressure": 78
    },
    {
      "vital_id": 100,
      "user_id": 123,
      "measurement_date": "2025-04-25 07:45:00",
      "heart_rate": 80,
      "systolic_pressure": 125,
      "diastolic_pressure": 82
    }
  ]
}
```

### 🔸 錯誤回應

- 缺少開始日期：
```json
{
  "status": "error",
  "error": {
    "code": "MISSING_START_DATE",
    "message": "請提供開始日期"
  }
}
```

- 日期格式錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "日期格式無效，應為 YYYY-MM-DD"
  }
}
```

- 日期範圍無效：
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "日期範圍無效，請確認開始與結束時間"
  }
}
```

- 認證錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "未提供認證憑證"
  }
}
```

- 伺服器錯誤：
```json
{
  "status": "error",
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "伺服器錯誤，無法取得血壓紀錄"
  }
}
```

---

