# 使用官方 Node.js 圖像作為基礎圖像
FROM node:14
ENV http_proxy http://sproxy.104-dev.com.tw:3128
ENV https_proxy http://sproxy.104-dev.com.tw:3128

# 設定工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝應用程式依賴
RUN npm install

# 複製應用程式代碼
COPY . .

# 暴露應用程式的埠
EXPOSE 8080

# 運行應用程式
CMD [ "node", "app.js" ]

