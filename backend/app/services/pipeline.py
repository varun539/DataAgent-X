import pandas as pd
import numpy as np
from app.services.impact import generate_business_impact


def prepare_features(df, profile=None, target_col=None, training=True, feature_schema=None):
    df = df.copy()
    df = df.replace([np.inf, -np.inf], np.nan)

    if target_col not in df.columns:
        return pd.DataFrame(), pd.Series()

    df = df.dropna(subset=[target_col])

    y = pd.to_numeric(df[target_col], errors="coerce")
    X = df.drop(columns=[target_col])

    # Encode categoricals
    for col in X.select_dtypes(include="object").columns:
        if X[col].nunique() <= 20:
            X = pd.get_dummies(X, columns=[col], drop_first=True)
        else:
            X.drop(columns=[col], inplace=True)

    X = X.apply(pd.to_numeric, errors="coerce").fillna(0)

    return X, y


def generate_ai_insights(df: pd.DataFrame):
    summary = df.describe().to_string()
    ai_text = generate_business_impact(summary)

    return {
        "insights": [ai_text]
    }