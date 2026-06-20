from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, health, auth

app = FastAPI(title="Edelweys API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://edelweys.tech",
        "https://edelweys.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(health.router, prefix="/health", tags=["health"])

@app.get("/")
def root():
    return {"message": "Edelweys API is running"}