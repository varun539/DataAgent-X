
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    context: Optional[dict] = {}

class ChatResponse(BaseModel):
    response: str
    status: str = "success"


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(data: ChatRequest):
    """
    AI chat endpoint — answers questions about business data
    """
    try:
        from openai import OpenAI

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(500, "OPENAI_API_KEY not configured")

        client = OpenAI(api_key=api_key)

        # Build context from analysis results if provided
        context = data.context or {}
        insights = context.get("insights", [])
        target   = context.get("target", "your business metric")
        model_name = context.get("model", "ML model")
        metrics  = context.get("metrics", {})

        insights_text = "\n".join(insights) if insights else "No analysis run yet"

        system_prompt = f"""
You are a business data analyst helping a business owner understand their data.

RULES:
- Speak in plain English — no ML jargon
- Be specific and actionable
- Keep answers under 150 words
- Never mention SHAP, R², algorithms, or technical terms

BUSINESS CONTEXT:
- Target metric: {target}
- Model used: {model_name}
- CV Score: {metrics.get('cv_mean', 'N/A')}
- Key findings:
{insights_text}

RESPONSE FORMAT:
📊 What's happening: (1-2 sentences)
📉 Why: (1-2 sentences)
💡 Action: (2-3 bullet points)
"""

        # Build messages
        messages = [{"role": "system", "content": system_prompt}]

        # Add history
        for msg in (data.history or []):
            messages.append({"role": msg.role, "content": msg.content})

        # Add current message
        messages.append({"role": "user", "content": data.message})

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3,
            max_tokens=300
        )

        return ChatResponse(
            response=response.choices[0].message.content,
            status="success"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Chat failed: {str(e)}")