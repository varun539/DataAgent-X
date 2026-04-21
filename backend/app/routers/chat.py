from fastapi import APIRouter
from app.services.agent import chat_with_data

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(data: dict):
    user_msg = data.get("message")

    response = chat_with_data(user_msg)

    return {
        "response": response
    }
