from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import shap
import joblib
import os
import io

from app.services.pipeline import prepare_features
from app.services.automl   import detect_problem_type, train_models
from app.services.impact   import generate_business_impact

router = APIRouter()

def smart_target(df):
    """Auto-detect best target column"""
    priority = ["Weekly_Sales","Revenue","Sales","Profit","Churn","Target"]
    numeric  = df.select_dtypes(include="number").columns.tolist()

    # Skip obvious ID columns
    skip = ["id","store","row","index","year","month","week"]
    numeric = [c for c in numeric
               if not any(s in c.lower() for s in skip)]

    for p in priority:
        if p in numeric:
            return p

    return numeric[-1] if numeric else None


@router.post("/")
async def analyze(file: UploadFile = File(...)):
    try:
        # Read CSV
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))

        if df.empty:
            raise HTTPException(400, "Empty file")

        # Auto-detect target
        target = smart_target(df)
        if not target:
            raise HTTPException(400, "No suitable target column found")

        # Pipeline
        from app.services.pipeline import prepare_features
        X, y = prepare_features(df, {}, target, training=True)

        if X.empty or X.shape[1] == 0:
            raise HTTPException(400, "Feature engineering failed")

        import numpy as np
        X = X.select_dtypes(include="number").fillna(0)
        X = X.replace([np.inf, -np.inf], 0)

        # Train
        problem = detect_problem_type(y)
        results_df, model_name, metrics = train_models(X, y, problem)

        # Load model safely
        model_path = "models/best_model.pkl"
        if not os.path.exists(model_path) or os.path.getsize(model_path) == 0:
            raise HTTPException(500, "Model training failed")
        model = joblib.load(model_path)

        # SHAP + insights
        insights = []
        try:
            import numpy as np
            sample_X  = X.sample(min(200, len(X)), random_state=42)
            explainer = shap.TreeExplainer(model)
            sv        = explainer.shap_values(sample_X)
            if isinstance(sv, list):
                sv = sv[1]
            insights = generate_business_impact(sv, sample_X, problem, target)
        except Exception as e:
            insights = [f"Analysis complete. Details: {str(e)}"]

        # Format metrics for frontend
        hold = metrics.get("holdout", {})
        cv   = metrics.get("cv", {})

        return {
            "status":    "success",
            "model":     model_name,
            "target":    target,
            "rows":      len(df),
            "features":  X.shape[1],
            "metrics": {
                "r2":      round(hold.get("r2", 0), 4),
                "mae":     round(hold.get("mae", 0), 2),
                "rmse":    round(hold.get("rmse", 0), 2),
                "cv_mean": round(cv.get("mean", 0), 4),
                "cv_std":  round(cv.get("std", 0), 4),
                "accuracy":round(hold.get("accuracy", 0), 4),
                "f1":      round(hold.get("f1", 0), 4),
            },
            "problem_type": problem,
            "insights":  insights,
            "feature_list": X.columns.tolist()
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {str(e)}")