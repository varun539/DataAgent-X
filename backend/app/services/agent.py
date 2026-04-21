import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def chat_with_data(message: str):
    """
    Simple AI chat (we upgrade later with data context)
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful data analyst AI."},
                {"role": "user", "content": message}
            ],
            temperature=0.7
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error: {str(e)}"
