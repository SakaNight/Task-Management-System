from fastapi import FastAPI
from routes.auth import router as auth_router
from routes.tasks import router as task_router
from db import db  # ✅ 引入 Prisma 实例
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

app.include_router(auth_router, prefix="/auth")
app.include_router(task_router, prefix="/tasks")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ✅ 允许所有源（开发阶段）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 或者 ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法，包括 OPTIONS
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Task Management API is working!"}