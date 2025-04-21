from fastapi import APIRouter, Depends, HTTPException, status
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

