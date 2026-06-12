from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

class RegisterRequest(BaseModel):
    email: str
    password: str
    username: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(req: RegisterRequest):
    try:
        res = supabase.auth.sign_up({"email": req.email, "password": req.password})
        user_id = res.user.id
        # Insert ke tabel profiles
        supabase.table("profiles").insert({
            "id": user_id,
            "username": req.username,
            "full_name": req.full_name,
        }).execute()
        return {"message": "Registrasi berhasil!", "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(req: LoginRequest):
    try:
        res = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
        return {
            "access_token": res.session.access_token,
            "user_id": res.user.id,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Email atau password salah")