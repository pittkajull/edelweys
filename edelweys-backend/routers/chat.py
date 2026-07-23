import os
import itertools
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

router = APIRouter()

# Load all API keys from env
API_KEYS = [
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5"),
]
# Filter out None/empty
API_KEYS = [k for k in API_KEYS if k]

# Round-robin key rotation
key_cycle = itertools.cycle(API_KEYS)

# Models to try (in priority order)
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
    gemini_history = []
    for h in history:
        role = "user" if h["role"] == "user" else "model"
        gemini_history.append({"role": role, "parts": [h["content"]]})
    return gemini_history

async def call_with_fallback(message: str, history: list) -> str:
    """Try each key + model combination until one succeeds"""
    last_error = None
    
    # Try each API key
    for key_index in range(len(API_KEYS)):
        api_key = next(key_cycle)
        
        # For each key, try all models
        for model_name in MODELS:
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=SYSTEM_PROMPT,
                )
                
                chat = model.start_chat(history=build_history(history))
                response = await chat.send_message_async(message)
                return response.text
                
            except Exception as e:
                last_error = e
                # Only log key index for privacy (not full key)
                print(f"[Fallback] Key#{key_index+1} + {model_name} failed: {e}")
                continue
    
    raise last_error

@router.post("/")
async def chat(req: ChatRequest):
    try:
        reply = await call_with_fallback(req.message, req.history)
        return {"reply": reply}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
