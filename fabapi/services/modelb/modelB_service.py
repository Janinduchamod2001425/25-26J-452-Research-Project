import os
import joblib
import numpy as np
from pymongo import MongoClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

# =============================
# LOAD MODELS
# =============================
supplier_model = joblib.load(os.path.join(BASE_DIR,"models/modelB_supplier.pkl"))
rca_model = joblib.load(os.path.join(BASE_DIR,"models/modelB_root_cause.pkl"))

rca_encoders = joblib.load(os.path.join(BASE_DIR,"models/modelB_rca_encoders.pkl"))
rca_features = joblib.load(os.path.join(BASE_DIR,"models/modelB_rca_features.pkl"))

# =============================
# MongoDB
# =============================
MONGO_URL = "mongodb+srv://duvidu_user:20010905Dk-@cluster0.abr7w5e.mongodb.net/?retryWrites=true&w=majority"

client = MongoClient(MONGO_URL)

db = client["fabricvision"]

modelA_collection = db["modelA_predictions"]


# =============================
# GET LATEST MODEL A DOCUMENT
# =============================
def get_latest_modelA_doc():

    doc = modelA_collection.find_one(
        sort=[("created_at",-1)]
    )

    if not doc:
        raise Exception("No Model A predictions found in MongoDB")

    return doc


# =============================
# FEATURE EXTRACTION
# =============================
def extract_features(doc,supplier_name):

    sequence = doc.get("sequence",[])

    defect_count = len(sequence)

    positions = [x["position_cm"] for x in sequence if "position_cm" in x]

    mean_position = np.mean(positions) if positions else 0

    pattern = doc.get("pattern","Repeating")

    pattern_ratio = 1 if pattern=="Repeating" else 0

    features = {

        "Supplier": supplier_name,
        "defect_count": defect_count,
        "unique_defects": 1,
        "dominant_defect": doc.get("defect_type","hole"),
        "dominant_pattern": pattern,
        "high_severity_ratio":0,
        "medium_severity_ratio":0,
        "pattern_ratio":pattern_ratio,
        "mean_position":mean_position
    }

    return features, defect_count


# =============================
# ROLL RISK CALCULATION
# =============================
def compute_roll_risk(doc):

    mean_interval = doc.get("mean_interval",50)

    pattern = doc.get("pattern","Irregular")

    sequence = doc.get("sequence",[])

    defect_count = len(sequence)

    # -----------------------------
    # Interval risk (low interval = high risk)
    # -----------------------------
    interval_risk = max(0, min(1, 1 - (mean_interval / 50)))

    # -----------------------------
    # Pattern risk
    # -----------------------------
    pattern_map = {

        "Repeating":1.0,
        "Drifting":0.7,
        "Irregular":0.4

    }

    pattern_risk = pattern_map.get(pattern,0.5)

    # -----------------------------
    # Defect density
    # -----------------------------
    density_risk = min(1, defect_count/10)

    # -----------------------------
    # Final roll risk
    # -----------------------------
    roll_risk = (

        0.5*interval_risk +
        0.3*pattern_risk +
        0.2*density_risk

    )

    return round(float(roll_risk),3)


# =============================
# MAIN ANALYTICS
# =============================
def run_modelB(supplier_name):

    doc = get_latest_modelA_doc()

    features, defect_count = extract_features(doc, supplier_name)

    # =============================
    # ENCODE CATEGORICAL FEATURES
    # =============================
    for col, encoder in rca_encoders.items():

        if col in features:

            value = str(features[col])

            if value in encoder.classes_:

                features[col] = encoder.transform([value])[0]

            else:

                features[col] = 0


    # =============================
    # RCA MODEL
    # =============================
    X_rca = np.array([[features[f] for f in rca_features]])

    root_cause_class = int(rca_model.predict(X_rca)[0])


    # =============================
    # SUPPLIER ENCODING
    # =============================
    supplier_map = {

        "Supplier A":0,
        "Supplier B":1,
        "Supplier C":2

    }

    supplier_enc = supplier_map.get(supplier_name,0)


    # =============================
    # ROLL RISK (NEW LOGIC)
    # =============================
    roll_risk = compute_roll_risk(doc)


    # =============================
    # SUPPLIER RISK MODEL
    # =============================
    supplier_input = np.array([[supplier_enc,defect_count,400,defect_count]])

    supplier_risk = float(supplier_model.predict(supplier_input)[0])


    return {

        "supplier_risk_score": round(supplier_risk,3),

        "roll_risk_score": roll_risk,

        "root_cause_class": root_cause_class

    }