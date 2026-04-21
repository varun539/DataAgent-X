from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/")
def chat(req: ChatRequest):
    return {
        "reply": f"You asked: {req.message} (AI response coming soon)"
    }
