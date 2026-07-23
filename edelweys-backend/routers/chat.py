import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

router = APIRouter()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Model priority list - if one fails, try next
MODELS = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]

SYSTEM_PROMPT = """Kamu adalah Edelweys, health companion yang friendly dan asyik banget!

Kepribadian kamu:
- Selalu sapa dengan "heyy yoww" di awal percakapan baru
- Bahasa santai, gaul, tapi tetap informatif dan akurat soal kesehatan
- Penuh semangat, supportif, dan nggak menghakimi
- Jangan gunakan emoji sama sekali di dalam jawaban

Topik yang kamu handle: nutrisi, olahraga, tidur, kesehatan mental, gejala umum, tips hidup sehat, BMI, tekanan darah, dll.

Kalau ada kasus yang terlalu rumit atau butuh diagnosis serius, jawab dengan:
"wah kalo itu terlalu rumit buat edelweys tanganin nich, better kamu konsul di halodoc ataupun ke rumah sakit terdekat dari rumah kamu yaw"

Jangan pernah mendiagnosis penyakit serius atau meresepkan obat."""

class ChatRequest(BaseModel):
    message: str
    history: list = []
    user_id: str | None = None

def build_history(history: list) -> list:
    """Convert history to Gemini format"""
    gemini_history = []
    for h in history:
        role = "user" if h["role"] == "user" else "model"
        gemini_history.append({"role": role, "parts": [h["content"]]})
    return gemini_history

async def call_with_fallback(message: str, history: list) -> str:
    """Try models in order until one succeeds"""
    last_error = None
    
    for model_name in MODELS:
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=SYSTEM_PROMPT,
            )
            
            chat = model.start_chat(history=build_history(history))
            response = await chat.send_message_async(message)
            return response.text
            
        except Exception as e:
            last_error = e
            print(f"[Fallback] {model_name} failed: {e}")
            continue
    
    raise last_error

@router.post("/")
async def chat(req: ChatRequest):
    try:
        reply = await call_with_fallback(req.message, req.history)
        return {"reply": reply}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
