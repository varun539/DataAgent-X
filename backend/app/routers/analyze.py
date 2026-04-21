from fastapi import APIRouter, UploadFile, File
import pandas as pd
import shap

from app.services.pipeline import prepare_features
from app.services.automl import detect_problem_type, train_models
from app.services.impact import generate_business_impact

router = APIRouter()

@router.post("/")
async def analyze(file: UploadFile = File(...)):

    df = pd.read_csv(file.file)

    # Auto target (simple for now)
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    if not numeric_cols:
        return {"error": "No numeric columns"}

    target = numeric_cols[-1]

    # Features
    X, y = prepare_features(df, {}, target)

    if X.empty:
        return {"error": "Feature engineering failed"}

    problem = detect_problem_type(y)

    results_df, model_name, metrics = train_models(X, y, problem)

    # SHAP (basic)
    insights = []
    try:
        import joblib
        model = joblib.load("models/best_model.pkl")

        sample_X = X.sample(min(200, len(X)))
        explainer = shap.TreeExplainer(model)
        sv = explainer.shap_values(sample_X)

        if isinstance(sv, list):
            sv = sv[1]

        insights = generate_business_impact(sv, sample_X, problem, target)

    except Exception:
        insights = ["Insights not available"]

    return {
        "model": model_name,
        "rows": len(df),
        "features": X.shape[1],
        "target": target,
        "metrics": metrics,
        "insights": insights
    }
