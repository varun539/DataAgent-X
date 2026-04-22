import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_business_impact(summary: str):
    prompt = f"""
    You are an expert Shopify business analyst.

    Based on this data:
    {summary}

    Give output in this format:

    🔍 Key Insights:
    - ...

    ⚠️ Problems:
    - ...

    🚀 Actions to Increase Revenue:
    - ...

    Keep it short, practical, and business-focused.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content