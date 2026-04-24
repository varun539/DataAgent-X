import pandas as pd
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ✅ ADD THIS FUNCTION
def generate_insights(df: pd.DataFrame):
    insights = []

    insights.append(f"Dataset has {len(df)} rows and {len(df.columns)} columns")

    numeric_cols = df.select_dtypes(include=['number']).columns

    for col in numeric_cols:
        insights.append(f"{col} avg: {df[col].mean():.2f}")

    return insights


def generate_business_impact(summary):
    return f"AI Insight: Based on data → {summary[:200]}"   


# ✅ EXISTING AI FUNCTION
def generate_business_impact(summary: str):
    prompt = f"""
    You are an expert e-commerce analyst.

    Analyze this data:
    {summary}

    Give:
    - Key insights
    - Problems
    - Actions to increase revenue
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content