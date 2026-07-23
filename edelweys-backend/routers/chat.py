import os
import itertools
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types

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
API_KEYS = [k for k in API_KEYS if k]

# Round-robin key rotation
key_cycle = itertools.cycle(API_KEYS)

# Models to try
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

def build_contents(history: list, message: str) -> list:
    contents = []
    for h in history:
        role = "user" if h["role"] == "user" else "model"
        contents.append(types.Content(
            role=role,
            parts=[types.Part.from_text(text=h["content"])]
        ))
    contents.append(types.Content(
        role="user",
        parts=[types.Part.from_text(text=message)]
    ))
    return contents

async def call_with_fallback(message: str, history: list) -> str:
    last_error = None
    
    for key_index in range(len(API_KEYS)):
        api_key = next(key_cycle)
        
        for model_name in MODELS:
            try:
                client = genai.Client(api_key=api_key)
                response = client.models.generate_content(
                    model=model_name,
                    contents=build_contents(history, message),
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        max_output_tokens=1024,
                        temperature=0.7,
                    )
                )
                return response.text
                
            except Exception as e:
                last_error = e
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
