FROM python:3.11-slim

RUN apt-get update && apt-get install -y curl

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN pip install -r requirements.txt

RUN prisma generate

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5001", "--reload"]