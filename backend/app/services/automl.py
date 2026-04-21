import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.ensemble import RandomForestRegressor


def detect_problem_type(y):
    return "classification" if y.nunique() <= 10 else "regression"


def train_models(X, y, problem_type):

    if problem_type == "classification":
        raise ValueError("Classification not implemented yet")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    r2 = r2_score(y_test, preds)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))

    metrics = {
        "holdout": {
            "r2": r2,
            "mae": mae,
            "rmse": rmse
        }
    }

    return pd.DataFrame(), "RandomForest", metrics
