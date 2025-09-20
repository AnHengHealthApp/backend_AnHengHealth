# 使用官方 Node.js 20 LTS 映像作為基礎
FROM node:20

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製專案所有檔案
COPY . .

# 暴露應用端口
EXPOSE 3000

# 啟動應用
CMD ["npm", "start"]