from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Lazy load Supabase
_supabase = None

def get_supabase():
    global _supabase
    if _supabase is None:
        from supabase import create_client
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        if url and key:
            _supabase = create_client(url, key)
    return _supabase

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
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    try:
        res = sb.auth.sign_up({"email": req.email, "password": req.password})
        user_id = res.user.id
        sb.table("profiles").insert({
            "id": user_id,
            "username": req.username,
            "full_name": req.full_name,
        }).execute()
        return {"message": "Registrasi berhasil!", "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(req: LoginRequest):
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    try:
        res = sb.auth.sign_in_with_password({"email": req.email, "password": req.password})
        return {
            "access_token": res.session.access_token,
            "user_id": res.user.id,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Email atau password salah")
