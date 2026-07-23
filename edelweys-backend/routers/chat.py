import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

MODELS = [
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'google/gemma-3-27b-it',
]

SYSTEM_PROMPT = """Kamu adalah Edelweys, health companion yang friendly dan asyik banget!
Selalu sapa dengan heyy yoww. Bahasa santai gaul tapi informatif. Jangan pakai emoji.
Topik: nutrisi olahraga tidur kesehatan mental tips hidup sehat BMI tekanan darah.
Kalau rumit bilang konsul ke halodoc atau RS terdekat. Jangan diagnosa atau resep obat."""


class ChatRequest(BaseModel):
    message: str
    history: list = []
    user_id: str | None = None


async def call_openrouter(message, history, model):
    messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]
    for h in history:
        messages.append({'role': h['role'], 'content': h['content']})
    messages.append({'role': 'user', 'content': message})

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f'{OPENROUTER_BASE_URL}/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json',
            },
            json={
                'model': model,
                'messages': messages,
                'max_tokens': 1024,
                'temperature': 0.7,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data['choices'][0]['message']['content']


async def call_with_fallback(message, history):
    last_error = None
    for model in MODELS:
        try:
            return await call_openrouter(message, history, model)
        except Exception as e:
            last_error = e
            print(f'[Fallback] {model} failed: {e}')
            continue
    raise last_error


@router.post('/')
async def chat(req: ChatRequest):
    try:
        reply = await call_with_fallback(req.message, req.history)
        return {'reply': reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))