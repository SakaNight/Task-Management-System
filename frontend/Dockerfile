# 使用官方 Next.js 镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install

# 拷贝项目代码
COPY . .

# 构建 Next.js
RUN npm run build

# 启动应用（使用 Next.js 提供的 production server）
EXPOSE 3000
CMD ["npm", "run", "start"]