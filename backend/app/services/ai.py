from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_ai_summary(insights, feature_importance):
    prompt = f"""
You are a business analyst.

Given:
Insights: {insights}
Top Features: {feature_importance}

Write a short, clear business explanation (max 5 lines)
with actionable advice.
"""

    try:
        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )
        return res.choices[0].message.content
    except:
        return "AI summary not available"