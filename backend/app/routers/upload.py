from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

router = APIRouter()

def find_column(df, keywords):
    for col in df.columns:
        for key in keywords:
            if key.lower() in col.lower():
                return col
    return None


@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    """
    Quick upload endpoint — returns EDA insights + chart data
    No ML training — just fast data summary
    """
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))

        if df.empty:
            raise HTTPException(400, "Empty file")

        # Basic EDA insights
        insights = []
        insights.append(f"📊 Dataset: {df.shape[0]} rows × {df.shape[1]} columns")

        missing = df.isnull().sum().sum()
        if missing > 0:
            insights.append(f"⚠️ {missing} missing values detected — consider cleaning before analysis")
        else:
            insights.append("✅ No missing values — dataset is clean")

        dupes = df.duplicated().sum()
        if dupes > 0:
            insights.append(f"⚠️ {dupes} duplicate rows found")

        numeric_cols = df.select_dtypes(include="number").columns.tolist()
        if numeric_cols:
            insights.append(f"📈 {len(numeric_cols)} numeric columns available for modeling")

        # Smart column detection for chart
        sales_col   = find_column(df, ["sales","revenue","amount","profit","price"])
        product_col = find_column(df, ["product","item","name","category","sub"])
        date_col    = find_column(df, ["date","week","month","period"])

        chart_data  = []
        chart_type  = None
        chart_label = {}

        if sales_col and product_col:
            # Product × Sales bar chart
            grouped    = df.groupby(product_col)[sales_col].sum().reset_index()
            grouped    = grouped.sort_values(sales_col, ascending=False).head(10)
            chart_data = grouped.rename(columns={
                product_col: "label",
                sales_col:   "value"
            }).to_dict(orient="records")
            chart_type  = "bar"
            chart_label = {"x": product_col, "y": sales_col}

        elif sales_col and date_col:
            # Time series line chart
            df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
            grouped    = df.groupby(date_col)[sales_col].sum().reset_index()
            grouped    = grouped.dropna().sort_values(date_col)
            chart_data = grouped.rename(columns={
                date_col:  "label",
                sales_col: "value"
            }).to_dict(orient="records")
            # Convert dates to strings
            for row in chart_data:
                row["label"] = str(row["label"])[:10]
            chart_type  = "line"
            chart_label = {"x": date_col, "y": sales_col}

        return {
            "status":      "success",
            "rows":        df.shape[0],
            "columns":     df.shape[1],
            "column_names":df.columns.tolist(),
            "insights":    insights,
            "chart_data":  chart_data,
            "chart_type":  chart_type,
            "chart_label": chart_label,
            "ai_explanation": f"Dataset loaded successfully. {len(numeric_cols)} numeric features ready for ML analysis. Click 'Run Analysis' to train models."
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Upload failed: {str(e)}")