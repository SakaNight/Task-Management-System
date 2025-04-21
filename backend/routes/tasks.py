from fastapi import APIRouter, Depends, HTTPException, status, Path, UploadFile, File
from routes.auth import get_current_user
from pydantic import BaseModel
from db import db
from prisma.models import Task
from typing import Optional
import os
import shutil
from uuid import uuid4

class TaskIn(BaseModel):
    title: str
    description: str
    status: Optional[str] = "todo"

class TaskOut(BaseModel):
    id: str
    title: str
    description: str
    status: str
    userId: str


VALID_STATUSES = ["todo", "in_progress", "stuck", "done"]

class TaskUpdate(BaseModel):
    status: str

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/test-auth")
def test_token(user = Depends(get_current_user)):
    return {"message": "Token is valid!", "user": user}

# 创建任务接口
@router.post("/", response_model=TaskOut)
async def create_task(task_in: TaskIn, user=Depends(get_current_user)):
    task = await db.task.create(
        data={
            "title": task_in.title,
            "description": task_in.description,
            "status": task_in.status,
            "userId": user["userId"],
        }
    )
    return task

# 更新任务状态接口
@router.put("/{id}")
async def update_task_status(
    id: str,
    update: TaskUpdate,  # ✅ 不需要 Depends
    user=Depends(get_current_user),
):
    if update.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: must be one of {VALID_STATUSES}")

    task = await db.task.find_unique(where={"id": id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.userId != user["userId"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    updated_task = await db.task.update(
        where={"id": id},
        data={"status": update.status}
    )
    return updated_task

# 删除任务接口
@router.delete("/{task_id}")
async def delete_task(task_id: str, user = Depends(get_current_user)):
    task = await db.task.find_unique(where={"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.userId != user["userId"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")

    await db.task.delete(where={"id": task_id})
    return {"message": "Task deleted successfully"}

# 文件上传接口
@router.post("/{task_id}/upload")
async def upload_file(task_id: str, file: UploadFile = File(...), user = Depends(get_current_user)):
    # 1. 查找任务
    task = await db.task.find_unique(where={"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # 2. 检查用户权限
    if task.userId != user["userId"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # 3. 构造文件路径
    filename = f"{task_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # 4. 保存文件到本地
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 5. 更新数据库
    updated = await db.task.update(
        where={"id": task_id},
        data={"attachment": file_path}
    )

    return {"message": "File uploaded", "path": file_path}

# 任务统计接口
@router.get("/stats")
async def get_task_stats(user=Depends(get_current_user)):
    user_id = user["userId"]
    tasks = await db.task.find_many(where={"userId": user_id})

    stats = {}
    for task in tasks:
        stats[task.status] = stats.get(task.status, 0) + 1

    return stats