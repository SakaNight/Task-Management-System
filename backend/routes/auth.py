# backend/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from dotenv import load_dotenv
from pydantic import BaseModel
from passlib.hash import bcrypt
from prisma import Prisma
import os
from db import db  # ✅ 从 db.py 导入全局连接

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class UserIn(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    email: str

@router.get("/test")
def test_auth():
    return {"message": "Auth route working!"}

@router.post("/register")
async def register(user_in: UserIn):
    existing = await db.user.find_unique(where={"email": user_in.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = bcrypt.hash(user_in.password)
    user = await db.user.create(
        data={"email": user_in.email, "hashedPassword": hashed_password}
    )
    
    return {"message": "User registered", "user_id": user.id}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.user.find_unique(where={"email": form_data.username})
    if not user or not bcrypt.verify(form_data.password, user.hashedPassword):  # password field name may differ!
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token_data = {"userId": user.id}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("userId")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return {"userId": user_id}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")