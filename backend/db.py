# backend/db.py
from prisma import Prisma

db = Prisma()  # ✅ 这是全局共享的 db 实例

# 可选：FastAPI 的依赖注入方法
async def get_db() -> Prisma:
    return db