import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, accuracy_score
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier


# 🔍 Detect target column
def detect_target(df):
    for col in df.columns:
        if "sales" in col.lower() or "price" in col.lower():
            return col
    return df.columns[-1]


# 🔍 Detect problem type
def detect_problem_type(y):
    if y.nunique() < 10:
        return "classification"
    return "regression"


# 🧠 Train models
def train_models(X, y, problem_type):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    if problem_type == "regression":
        models = {
            "LinearRegression": LinearRegression(),
            "RandomForest": RandomForestRegressor()
        }
    else:
        models = {
            "RandomForest": RandomForestClassifier()
        }

    best_model_name = None
    best_score = -999
    best_model_obj = None

    for name, model in models.items():
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

    return best_model_name, best_score, best_model_obj


# 📊 Feature Importance
def get_feature_importance(model, X):
    try:
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
        elif hasattr(model, "coef_"):
            importances = np.abs(model.coef_)
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
        corr = df.corr(numeric_only=True)

        if target not in corr:
            return []

        target_corr = corr[target].drop(target)
        top_corr = target_corr.abs().sort_values(ascending=False)

        return list(top_corr.head(5).items())
    except:
        return []


# 💡 Business Drivers
def generate_driver_insights(feature_imp, correlations):
    insights = []

    if feature_imp:
        insights.append(f"📊 '{feature_imp[0][0]}' is the strongest driver")

    if correlations:
        insights.append(f"📈 '{correlations[0][0]}' highly correlates with target")

    insights.append("🚀 Focus on top features to improve results")

    return insights


# 💰 RECOMMENDATIONS (FIXED POSITION)
def generate_recommendations(feature_imp):
    recs = []

    if feature_imp:
        top = feature_imp[0][0]
        recs.append(f"💡 Focus on improving '{top}' to increase performance")

    recs.append("📊 Invest more in high-performing features")
    recs.append("📉 Reduce impact of low-performing variables")

    return recs