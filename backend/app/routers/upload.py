from fastapi import APIRouter, UploadFile, File
import pandas as pd
from app.services.impact import generate_insights, generate_business_impact

router = APIRouter()

def find_column(df, keywords):
    for col in df.columns:
        for key in keywords:
            if key.lower() in col.lower():
                return col
    return None

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    insights = generate_insights(df)

    # 🔥 SMART COLUMN DETECTION
    sales_col = find_column(df, ["sales", "revenue", "amount"])
    product_col = find_column(df, ["product", "item", "name"])

    chart_data = []
    ai_text = "No AI insights available"

    if sales_col and product_col:
        grouped = df.groupby(product_col)[sales_col].sum().reset_index()
        chart_data = grouped.to_dict(orient="records")

        # 🔥 AI PART
        summary = grouped.to_string()
        ai_text = generate_business_impact(summary)

    return {
        "insights": insights,
        "chart_data": chart_data,
        "ai_explanation": ai_text
    }



