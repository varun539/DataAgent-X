from fastapi import FastAPI
from app.routers import analyze, chat

app = FastAPI(title="DataAgentX API")

app.include_router(analyze.router, prefix="/analyze")
app.include_router(chat.router, prefix="/chat")


@app.get("/")
def root():
    return {"message": "DataAgentX backend running 🚀"}
