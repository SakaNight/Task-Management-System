from fastapi import APIRouter, Depends, HTTPException, status, Path
from routes.auth import get_current_user
from pydantic import BaseModel
from db import db
from prisma.models import Task
from typing import Optional

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

@router.get("/test-auth")
def test_token(user = Depends(get_current_user)):
    return {"message": "Token is valid!", "user": user}

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