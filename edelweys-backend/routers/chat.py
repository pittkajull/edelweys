import os
import anthropic
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Init client dengan base_url xiaomimimo
client = anthropic.Anthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY"),
    base_url=os.getenv("ANTHROPIC_BASE_URL", "https://api.xiaomimimo.com/anthropic"),
)

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
    history: list = []  # [{"role": "user/assistant", "content": "..."}]
    user_id: str | None = None

@router.post("/")
async def chat(req: ChatRequest):
    try:
        messages = req.history + [{"role": "user", "content": req.message}]
        
        response = client.messages.create(
            model="mimo-v2.5-pro",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        
        reply = response.content[0].text
        return {"reply": reply}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))