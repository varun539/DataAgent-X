from fastapi import APIRouter, UploadFile, File
import pandas as pd

from app.services.pipeline import prepare_features
from app.services.automl import detect_problem_type, train_models
from app.services.impact import generate_business_impact
from app.services.preprocess import adaptive_preprocess

router = APIRouter()


@router.post("/")
async def analyze_data(file: UploadFile = File(...)):

    df = pd.read_csv(file.file)

    # Try preprocess
    try:
        processed_df = adaptive_preprocess(df, "revenue")
        target = "Revenue"
    except:
        processed_df = df
        target = df.select_dtypes("number").columns[0]

    X, y = prepare_features(processed_df, {}, target)

    problem = detect_problem_type(y)

    results, model_name, metrics = train_models(X, y, problem)

    return {
        "model": model_name,
        "metrics": metrics,
        "features": X.shape[1],
        "rows": len(X)
    }
