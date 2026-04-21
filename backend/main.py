from fastapi import FastAPI
from app.routers import analyze, chat

app = FastAPI(title="DataAgentX API 🚀")

# Routes
app.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

@app.get("/")
def root():
    return {"status": "ok", "message": "DataAgentX backend running 🚀"}
