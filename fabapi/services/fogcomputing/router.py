from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from fabapi.services.fogcomputing.enhancer import FabricEnhancer
import numpy as np
from PIL import Image
import tensorflow as tf
import json
import os
import io
import cv2
import base64
from datetime import datetime

router = APIRouter(prefix="/fogcomputing", tags=["Fog Computing"])

# ---------------------------
# Paths
# ---------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

DEFAULT_MODEL_PATH = os.path.join(
    BASE_DIR, "models", "fogcomputing", "mobilenetv2_fabric_classifierV1.h5"
)
DEFAULT_MAPPING_PATH = os.path.join(
    BASE_DIR, "models", "fogcomputing", "class_mapping.json"
)

MODEL_PATH = os.getenv("FOG_MODEL_PATH", DEFAULT_MODEL_PATH)
MAPPING_PATH = os.getenv("FOG_CLASS_MAPPING_PATH", DEFAULT_MAPPING_PATH)

IMG_SIZE = (224, 224)

# ---------------------------
# Load model once
# ---------------------------
try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print(f"✅ Keras model loaded from: {MODEL_PATH}")
except Exception as e:
    model = None
    print("❌ Failed to load model:", e)

try:
    with open(MAPPING_PATH, "r") as f:
        class_mapping = json.load(f)
    class_mapping = {int(k): v for k, v in class_mapping.items()}
    print(f"✅ Class mapping loaded from: {MAPPING_PATH}")
except Exception as e:
    class_mapping = None
    print("❌ Failed to load class mapping:", e)

enhancer = FabricEnhancer()

# In-memory session timeline (last N points)
QUALITY_TIMELINE = []
MAX_TIMELINE_POINTS = 30

# ---------------------------
# Helpers
# ---------------------------
def preprocess_image_for_classifier(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    arr = np.array(img).astype(np.float32)
    arr = np.expand_dims(arr, axis=0)
    arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
    return arr

def bytes_to_bgr(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("Invalid image bytes.")
    return bgr

def bgr_to_base64_png(bgr: np.ndarray) -> str:
    ok, buf = cv2.imencode(".png", bgr)
    if not ok:
        raise ValueError("Failed to encode image.")
    return base64.b64encode(buf.tobytes()).decode("utf-8")


# ---------------------------
# 1) CLASSIFY
# ---------------------------
@router.post("/classify")
async def classify_fabric_image(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded on server.")
    if class_mapping is None:
        raise HTTPException(status_code=500, detail="class_mapping.json not loaded.")

    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Only JPG/PNG images are supported.")

    image_bytes = await file.read()

    x = preprocess_image_for_classifier(image_bytes)
    probs = model.predict(x, verbose=0)[0]
    pred_idx = int(np.argmax(probs))
    confidence = float(probs[pred_idx])
    predicted_class = class_mapping.get(pred_idx, f"class_{pred_idx}")

    prob_dict = {class_mapping.get(i, f"class_{i}"): float(p) for i, p in enumerate(probs)}

    return JSONResponse({
        "filename": file.filename,
        "predicted_class": predicted_class,
        "confidence": round(confidence, 4),
        "probabilities": prob_dict
    })


# ---------------------------
# 2) ENHANCE + METRICS
# ---------------------------
@router.post("/enhance")
async def enhance_image(
    file: UploadFile = File(...),
    predicted_class: str | None = Query(default=None, description="Optional class (light/dark/patterned). If not provided, enable auto_classify."),
    auto_classify: bool = Query(default=True, description="If true and predicted_class not provided, classify first using MobileNetV2.")
):
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Only JPG/PNG images are supported.")

    image_bytes = await file.read()

    # --- 1) decide class ---
    used_class = predicted_class
    cls_conf = None
    cls_probs = None

    if (used_class is None or used_class.strip() == "") and auto_classify:
        if model is None or class_mapping is None:
            raise HTTPException(status_code=500, detail="Classifier not loaded (model or mapping missing).")

        x = preprocess_image_for_classifier(image_bytes)
        probs = model.predict(x, verbose=0)[0]
        pred_idx = int(np.argmax(probs))
        cls_conf = float(probs[pred_idx])
        used_class = class_mapping.get(pred_idx, f"class_{pred_idx}")
        cls_probs = {class_mapping.get(i, f"class_{i}"): float(p) for i, p in enumerate(probs)}
    elif used_class is None:
        raise HTTPException(status_code=400, detail="Provide predicted_class or set auto_classify=true")

    used_class = used_class.lower().strip()

    # --- 2) enhancement ---
    before_bgr = bytes_to_bgr(image_bytes)
    after_bgr, enhance_params = enhancer.enhance_by_class(before_bgr, used_class)

    # --- 3) real metrics from before vs after ---
    metrics = enhancer.compute_metrics(before_bgr, after_bgr)
    region = enhancer.region_contribution(before_bgr, after_bgr)

    # --- 4) build a timeline point (for your line chart) ---
    # We'll use real computed "quality" and "sharpness" after enhancement.
    now = datetime.now().strftime("%H:%M:%S")
    timeline_point = {
        "time": now,
        "quality": round(metrics["after"]["quality"], 2),
        "sharpness": round(metrics["after"]["sharpness"], 2),
    }

    QUALITY_TIMELINE.append(timeline_point)
    if len(QUALITY_TIMELINE) > MAX_TIMELINE_POINTS:
        QUALITY_TIMELINE.pop(0)

    # --- 5) return images as base64 for before/after comparison ---
    before_b64 = bgr_to_base64_png(before_bgr)
    after_b64 = bgr_to_base64_png(after_bgr)

    ai_analysis = enhancer.analyze_and_safety(
    used_class=used_class,
    metrics=metrics,
    enhance_params=enhance_params,
    cls_conf=cls_conf
)

    return JSONResponse({
        "filename": file.filename,
        "predicted_class": used_class,
        "classification": {
            "confidence": None if cls_conf is None else round(cls_conf, 4),
            "probabilities": cls_probs
        },
        "enhancement": {
            "params": enhance_params
        },
        "images": {
            "before_png_base64": before_b64,
            "after_png_base64": after_b64
        },
        "metrics": metrics,
        "region_contribution": region,
        "quality_timeline": QUALITY_TIMELINE,
        "ai_analysis": ai_analysis
    })
