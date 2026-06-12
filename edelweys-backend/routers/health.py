from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

class HealthLog(BaseModel):
    user_id: str
    weight: float | None = None
    height: float | None = None
    blood_pressure: str | None = None
    coffee_cups: int | None = None
    exercise_minutes: int | None = None
    water_glasses: int | None = None
    sleep_hours: float | None = None

@router.post("/log")
async def log_health(data: HealthLog):
    try:
        payload = data.dict()
        # Hitung BMI kalau ada weight & height
        if data.weight and data.height:
            h_m = data.height / 100
            payload["bmi"] = round(data.weight / (h_m ** 2), 1)
        
        res = supabase.table("health_logs").insert(payload).execute()
        return {"message": "Log kesehatan tersimpan!", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs/{user_id}")
async def get_logs(user_id: str):
    try:
        res = supabase.table("health_logs")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(30)\
            .execute()
        return {"logs": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))