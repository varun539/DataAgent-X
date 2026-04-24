from fastapi import APIRouter, UploadFile, File
import pandas as pd

from app.services.ml import (
    detect_target,
    detect_problem_type,
    train_models,
    get_feature_importance,
    get_correlations,
    generate_driver_insights,
    generate_recommendations
)

router = APIRouter()


@router.post("/")
async def analyze(file: UploadFile = File(...)):
    try:
        # 📥 Read CSV
        df = pd.read_csv(file.file)

        if df.empty:
            return {"error": "Uploaded file is empty"}

        # 🎯 Target detection
        target = detect_target(df)

        if target not in df.columns:
            return {"error": "Target column not found"}

        # 🧹 Prepare data
        X = df.drop(columns=[target])
        y = df[target]

        # Convert categorical → numeric
        X = pd.get_dummies(X).fillna(0)

        # 🧠 ML logic
        problem_type = detect_problem_type(y)
        model_name, score, model = train_models(X, y, problem_type)

        if model is None:
            return {"error": "Model training failed"}

        # 📊 Feature importance
        feature_importance = get_feature_importance(model, X)

        # 📈 Correlations
        correlations = get_correlations(df, target)

        # 💡 Insights
        driver_insights = generate_driver_insights(feature_importance, correlations)

        # 🔮 Predictions (last 5 rows)
        try:
            preds = model.predict(X.tail(5))
            future_preds = [float(x) for x in preds]
        except Exception:
            future_preds = []

        # 💡 Recommendations
        recommendations = generate_recommendations(feature_importance)

        # 🧠 Final insights
        insights = [
            f"Best model: {model_name}",
            f"Problem type: {problem_type}",
            f"Performance score: {round(score, 3)}"
        ] + driver_insights

        # ✅ FINAL RESPONSE
        return {
            "model": model_name,
            "target": target,
            "problem_type": problem_type,
            "metrics": {"score": float(score)},
            "insights": insights,
            "feature_importance": feature_importance,
            "correlations": correlations,
            "predictions": future_preds,
            "recommendations": recommendations,
            "rows": int(len(df)),
            "features": int(X.shape[1])
        }

    except Exception as e:
        return {"error": str(e)}
