import joblib
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

risk_model = joblib.load(os.path.join(BASE_DIR, "models/modelB_risk.pkl"))
pattern_model = joblib.load(os.path.join(BASE_DIR, "models/modelB_pattern.pkl"))
rca_model = joblib.load(os.path.join(BASE_DIR, "models/modelB_rca.pkl"))

FEATURES_ORDER = [
    "SupplierEnc",
    "RollLength",
    "DefectCount",
    "AvgSeverity",
    "DefectDensity",
    "MeanInterval",
    "StdInterval"
]

def predict_modelB(features: dict):
    X = np.array([[features[f] for f in FEATURES_ORDER]])

    risk = float(risk_model.predict(X)[0])
    pattern = int(pattern_model.predict(X)[0])
    rca = int(rca_model.predict(X)[0])

    return {
        "risk_score": round(risk, 3),
        "pattern_class": pattern,
        "rca_class": rca
    }