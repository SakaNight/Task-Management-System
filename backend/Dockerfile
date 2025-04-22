# 使用官方 Python 镜像
FROM python:3.11-slim

RUN apt-get update && apt-get install -y curl

# ✅ 安装 Node.js（支持 Prisma）
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 安装 Python 依赖
RUN pip install -r requirements.txt

# ⚠️ 这里是关键：生成 Prisma Client
RUN prisma generate

# 启动 FastAPI 服务
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5001", "--reload"]