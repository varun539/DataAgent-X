from fastapi import APIRouter, UploadFile, File
import pandas as pd

from app.services.ml import (
    detect_target,
    detect_problem_type,
    train_models,
    get_feature_importance,
    get_correlations,
    generate_driver_insights,
    generate_recommendations  # ✅ moved here
)

router = APIRouter()


@router.post("/")
async def analyze(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    # 🎯 Target detection
    target = detect_target(df)

    # 🧹 Prepare data
    X = df.drop(columns=[target])
    y = df[target]

    X = pd.get_dummies(X).fillna(0)

    # 🧠 ML logic
    problem_type = detect_problem_type(y)
    model_name, score, model = train_models(X, y, problem_type)

    # 🔥 FEATURE ENGINEERING
    feature_importance = get_feature_importance(model, X)
    correlations = get_correlations(df, target)
    driver_insights = generate_driver_insights(feature_importance, correlations)

    # 🔮 PREDICTIONS
    try:
        future_preds = model.predict(X.tail(5)).tolist()
    except:
        future_preds = []

    # 💡 RECOMMENDATIONS
    recommendations = generate_recommendations(feature_importance)

    # 🧠 Insights
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
        "metrics": {"score": score},
        "insights": insights,
        "feature_importance": feature_importance,
        "correlations": correlations,
        "predictions": future_preds,          # ✅ FIXED
        "recommendations": recommendations,   # ✅ FIXED
        "rows": len(df),
        "features": X.shape[1]
    }