import pandas as pd
import numpy as np

def prepare_features(df, profile, target_col, training=True, feature_schema=None):

    df = df.copy()
    df = df.replace([np.inf, -np.inf], np.nan)

    if target_col not in df.columns:
        return pd.DataFrame(), pd.Series()

    y = pd.to_numeric(df[target_col], errors="coerce")
    df = df.dropna(subset=[target_col])

    X = df.drop(columns=[target_col])

    # Encode categoricals
    for col in X.select_dtypes(include="object").columns:
        if X[col].nunique() <= 20:
            X = pd.get_dummies(X, columns=[col], drop_first=True)
        else:
            X.drop(columns=[col], inplace=True)

    X = X.apply(pd.to_numeric, errors="coerce").fillna(0)

    return X, y
