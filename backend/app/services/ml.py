import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, accuracy_score
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier

# Optional advanced models
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


# 🧠 Train models
def train_models(X, y, problem_type):
    if len(X) < 5:
        raise ValueError("Dataset too small")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    models = {}

    if problem_type == "regression":
        models["LinearRegression"] = LinearRegression()
        models["RandomForest"] = RandomForestRegressor(n_estimators=50, random_state=42)

        if XGBRegressor:
            models["XGBoost"] = XGBRegressor(n_estimators=50, verbosity=0)

        if LGBMRegressor:
            models["LightGBM"] = LGBMRegressor(n_estimators=50)

        if CatBoostRegressor:
            models["CatBoost"] = CatBoostRegressor(iterations=50, verbose=0)

    else:
        models["RandomForest"] = RandomForestClassifier(n_estimators=50, random_state=42)

        if XGBClassifier:
            models["XGBoost"] = XGBClassifier(n_estimators=50, verbosity=0)

        if LGBMClassifier:
            models["LightGBM"] = LGBMClassifier(n_estimators=50)

        if CatBoostClassifier:
            models["CatBoost"] = CatBoostClassifier(iterations=50, verbose=0)

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

            if score > best_score:
                best_score = score
                best_model_name = name
                best_model_obj = model

        except Exception:
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

    except:
        return []


# 📈 Correlations
def get_correlations(df, target):
    try:
        numeric_df = df.select_dtypes(include=np.number)

        if target not in numeric_df.columns:
            return []

        corr = numeric_df.corr()
        target_corr = corr[target].drop(target)

        top_corr = target_corr.abs().sort_values(ascending=False)

        return list(top_corr.head(5).items())

    except:
        return []


# 💡 🔥 UPGRADED BUSINESS INSIGHTS
def generate_driver_insights(feature_imp, correlations):
    insights = []

    # Top features → business meaning
    for f, val in feature_imp[:3]:
        insights.append(
            f"🔍 '{f}' strongly influences your outcome — optimizing this can significantly impact results"
        )

    # Correlations → trends
    for c, val in correlations[:2]:
        insights.append(
            f"📈 '{c}' shows strong relationship with your target — track this closely for decision making"
        )

    # Domain logic (VERY IMPORTANT 🔥)
    feature_names = [f[0] for f in feature_imp]

    if "Unemployment" in feature_names:
        insights.append(
            "⚠️ Higher unemployment may reduce customer spending — consider discounts or promotions"
        )

    if "Temperature" in feature_names:
        insights.append(
            "🌡️ Seasonal patterns detected — align inventory and demand with weather trends"
        )

    if "Fuel_Price" in feature_names:
        insights.append(
            "⛽ Fuel price fluctuations may affect logistics and customer behavior"
        )

    if "Store" in feature_names:
        insights.append(
            "🏬 Sales vary across stores — optimize high-performing locations and improve low-performing ones"
        )

    insights.append(
        "🚀 Focus on top drivers and experiment with strategies to maximize business impact"
    )

    return insights


# 💡 🔥 UPGRADED RECOMMENDATIONS
def generate_recommendations(feature_imp):
    recs = []

    if feature_imp:
        top = feature_imp[0][0]

        recs.append(
            f"💡 Improve '{top}' using pricing, promotions, or operational strategies"
        )

    recs.append("📊 Segment data by region/time/product for deeper insights")
    recs.append("📈 Track performance trends over time instead of static analysis")
    recs.append("🧪 Run A/B tests on key variables to validate impact")
    recs.append("🎯 Focus on high-impact features and reduce noise from weak ones")

    return recs


    