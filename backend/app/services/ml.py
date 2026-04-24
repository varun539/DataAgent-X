import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, accuracy_score
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier

# Optional advanced models (safe import)
try:
    from xgboost import XGBRegressor, XGBClassifier
except:
    XGBRegressor = XGBClassifier = None

try:
    from lightgbm import LGBMRegressor, LGBMClassifier
except:
    LGBMRegressor = LGBMClassifier = None

try:
    from catboost import CatBoostRegressor, CatBoostClassifier
except:
    CatBoostRegressor = CatBoostClassifier = None


# 🔍 Detect target
def detect_target(df):
    for col in df.columns:
        if "sales" in col.lower() or "price" in col.lower():
            return col
    return df.columns[-1]


# 🔍 Problem type
def detect_problem_type(y):
    return "classification" if y.nunique() < 10 else "regression"


# 🧠 Train models (ADVANCED)
def train_models(X, y, problem_type):
    if len(X) < 5:
        raise ValueError("Dataset too small")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    models = {}

    if problem_type == "regression":
        models["LinearRegression"] = LinearRegression()
        models["RandomForest"] = RandomForestRegressor(random_state=42)

        if XGBRegressor:
            models["XGBoost"] = XGBRegressor(verbosity=0)

        if LGBMRegressor:
            models["LightGBM"] = LGBMRegressor()

        if CatBoostRegressor:
            models["CatBoost"] = CatBoostRegressor(verbose=0)

    else:
        models["RandomForest"] = RandomForestClassifier(random_state=42)

        if XGBClassifier:
            models["XGBoost"] = XGBClassifier(verbosity=0)

        if LGBMClassifier:
            models["LightGBM"] = LGBMClassifier()

        if CatBoostClassifier:
            models["CatBoost"] = CatBoostClassifier(verbose=0)

    best_model_name = None
    best_score = -np.inf
    best_model_obj = None

    for name, model in models.items():
        try:
            model.fit(X_train, y_train)
            preds = model.predict(X_test)

            if problem_type == "regression":
                score = r2_score(y_test, preds)
            else:
                score = accuracy_score(y_test, preds)

            print(f"{name} score: {score}")

            if score > best_score:
                best_score = score
                best_model_name = name
                best_model_obj = model

        except Exception as e:
            print(f"{name} failed: {e}")
            continue

    return best_model_name, best_score, best_model_obj


# 📊 Feature importance
def get_feature_importance(model, X):
    try:
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_

        elif hasattr(model, "coef_"):
            importances = np.abs(model.coef_).flatten()

        else:
            return []

        feature_imp = list(zip(X.columns, importances))
        feature_imp.sort(key=lambda x: x[1], reverse=True)

        return feature_imp[:5]

    except Exception as e:
        print("Feature importance error:", e)
        return []


# 📈 Correlation
def get_correlations(df, target):
    try:
        numeric_df = df.select_dtypes(include=np.number)

        if target not in numeric_df.columns:
            return []

        corr = numeric_df.corr()

        target_corr = corr[target].drop(target)
        top_corr = target_corr.abs().sort_values(ascending=False)

        return list(top_corr.head(5).items())

    except Exception as e:
        print("Correlation error:", e)
        return []


# 💡 Insights
def generate_driver_insights(feature_imp, correlations):
    insights = []

    if feature_imp:
        insights.append(f"📊 '{feature_imp[0][0]}' is the strongest driver")

    if correlations:
        insights.append(f"📈 '{correlations[0][0]}' highly correlates with target")

    insights.append("🚀 Focus on top features to improve results")

    return insights


# 💡 Recommendations
def generate_recommendations(feature_imp):
    recs = []

    if feature_imp:
        recs.append(f"💡 Focus on '{feature_imp[0][0]}' to boost performance")

    recs.append("📊 Invest in high-impact features")
    recs.append("📉 Reduce noise from weak features")

    return recs
