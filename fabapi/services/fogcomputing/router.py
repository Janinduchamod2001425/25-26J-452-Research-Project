from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image
import tensorflow as tf
import json
import os
import io

router = APIRouter(prefix="/fogcomputing", tags=["Fog Computing"])

# ---------------------------
# Paths
# ---------------------------
# points to .../fabapi/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

# Default paths pointing to files in fabapi/models/fogcomputing/
DEFAULT_MODEL_PATH = os.path.join(
    BASE_DIR, "models", "fogcomputing", "mobilenetv2_fabric_classifierV1.h5"
)
DEFAULT_MAPPING_PATH = os.path.join(
    BASE_DIR, "models", "fogcomputing", "class_mapping.json"
)

# Allow environment overrides if desired
MODEL_PATH = os.getenv("FOG_MODEL_PATH", DEFAULT_MODEL_PATH)
MAPPING_PATH = os.getenv("FOG_CLASS_MAPPING_PATH", DEFAULT_MAPPING_PATH)

# Quick existence checks for clearer startup logs
if not os.path.exists(MODEL_PATH):
    print(f"❌ Model path not found: {MODEL_PATH}")
if not os.path.exists(MAPPING_PATH):
    print(f"❌ Mapping path not found: {MAPPING_PATH}")

IMG_SIZE = (224, 224)

# ---------------------------
# Load model once (import/startup)
# ---------------------------
try:
    model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)
    print(f"✅ Keras model loaded from: {MODEL_PATH}")
except Exception as e:
    model = None
    print("❌ Failed to load model:", e)

# Load class mapping
try:
    with open(MAPPING_PATH, "r") as f:
        class_mapping = json.load(f)
    # Convert keys to int for safer lookup
    class_mapping = {int(k): v for k, v in class_mapping.items()}
    print(f"✅ Class mapping loaded from: {MAPPING_PATH}")
except Exception as e:
    class_mapping = None
    print("❌ Failed to load class mapping:", e)

# ---------------------------
# Helpers
# ---------------------------
def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    MobileNetV2 preprocess: converts to RGB, resizes to 224x224,
    converts to float32 and applies mobilenet_v2.preprocess_input => [-1, 1]
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)

    arr = np.array(img).astype(np.float32)
    arr = np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)

    # MobileNetV2-specific preprocessing
    arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
    return arr


# ---------------------------
# API endpoint
# ---------------------------
@router.post("/classify")
async def classify_fabric_image(file: UploadFile = File(...)):
    """
    Upload an image and return:
    - predicted class
    - confidence
    - per-class probabilities
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded on server.")

    if class_mapping is None:
        raise HTTPException(status_code=500, detail="class_mapping.json not loaded.")

    # Validate type
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Only JPG/PNG images are supported.")

    image_bytes = await file.read()

    try:
        x = preprocess_image(image_bytes)
        probs = model.predict(x, verbose=0)[0]  # shape: (num_classes,)
        pred_idx = int(np.argmax(probs))
        confidence = float(probs[pred_idx])

        predicted_class = class_mapping.get(pred_idx, f"class_{pred_idx}")

        # Return full probabilities (nice for debugging)
        prob_dict = {
            class_mapping.get(i, f"class_{i}"): float(p)
            for i, p in enumerate(probs)
        }

        return JSONResponse({
            "filename": file.filename,
            "predicted_class": predicted_class,
            "confidence": round(confidence, 4),
            "probabilities": prob_dict
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")