from fastapi import APIRouter
from pydantic import BaseModel
from app.services.agent import chat_with_data

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    insights: list = []

@router.post("/")
def chat(req: ChatRequest):

    response = chat_with_data(
        api_key=None,
        user_message=req.message,
        chat_history=[],
        model_card={},
        profile={},
        df_sample=None,
        problem_type="regression",
        target_col="target",
        business_insights=req.insights
    )

    return {"reply": response}
