from fastapi import APIRouter, UploadFile, File
import pandas as pd

from app.services.pipeline import prepare_features
from app.services.automl import detect_problem_type, train_models

router = APIRouter()

@router.post("/")
async def analyze(file: UploadFile = File(...)):

    df = pd.read_csv(file.file)

    # Auto target (simple version)
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    target = numeric_cols[-1]

    # Prepare
    X, y = prepare_features(df, {}, target)

    problem = detect_problem_type(y)

    results_df, model_name, metrics = train_models(X, y, problem)

    return {
        "model": model_name,
        "rows": len(df),
        "features": X.shape[1],
        "metrics": metrics
    }
