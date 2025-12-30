from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from services.fogcomputing.enhancer import FabricEnhancer

import numpy as np
from PIL import Image
import tensorflow as tf
import json
import os
import io
import cv2
import base64

# -------------------------------------------------
# Router config
# -------------------------------------------------
router = APIRouter(prefix="/fogcomputing", tags=["Fog Computing"])

# -------------------------------------------------
# Paths
# -------------------------------------------------
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

# -------------------------------------------------
# Load ML model (once)
# -------------------------------------------------
try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print(f"✅ Classification model loaded: {MODEL_PATH}")
except Exception as e:
    model = None
    print("❌ Failed to load classification model:", e)

# -------------------------------------------------
# Load class mapping
# -------------------------------------------------
try:
    with open(MAPPING_PATH, "r") as f:
        class_mapping = json.load(f)
    class_mapping = {int(k): v for k, v in class_mapping.items()}
    print(f"✅ Class mapping loaded: {class_mapping}")
except Exception as e:
    class_mapping = None
    print("❌ Failed to load class mapping:", e)

# -------------------------------------------------
# Load enhancer
# -------------------------------------------------
enhancer = FabricEnhancer()

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def preprocess_for_classification(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)

    arr = np.array(img).astype(np.float32)
    arr = np.expand_dims(arr, axis=0)
    arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)

    return arr


def bytes_to_cv2(image_bytes: bytes) -> np.ndarray:
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid image data")
    return img


def cv2_to_base64(img: np.ndarray) -> str:
    _, buffer = cv2.imencode(".png", img)
    return base64.b64encode(buffer).decode("utf-8")


# =================================================
# CLASSIFICATION ENDPOINT
# =================================================
@router.post("/classify")
async def classify_fabric_image(file: UploadFile = File(...)):
    if model is None or class_mapping is None:
        raise HTTPException(status_code=500, detail="Model or class mapping not loaded")

    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Only JPG/PNG images are supported")

    image_bytes = await file.read()

    try:
        x = preprocess_for_classification(image_bytes)
        probs = model.predict(x, verbose=0)[0]

        pred_idx = int(np.argmax(probs))
        confidence = float(probs[pred_idx])
        predicted_class = class_mapping[pred_idx]

        probabilities = {
            class_mapping[i]: float(p)
            for i, p in enumerate(probs)
        }

        return JSONResponse({
            "filename": file.filename,
            "predicted_class": predicted_class,
            "confidence": round(confidence, 4),
            "probabilities": probabilities
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


# =================================================
# ENHANCEMENT ENDPOINT (NEW)
# =================================================
@router.post("/enhance")
async def enhance_fabric_image(
    file: UploadFile = File(...),
    fabric_class: str = "dark"
):
    """
    Enhances an image based on fabric class:
    - dark
    - light
    - patterned
    """
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Only JPG/PNG images are supported")

    image_bytes = await file.read()

    try:
        img = bytes_to_cv2(image_bytes)

        enhanced_img = enhancer.enhance(img, fabric_class)

        encoded_image = cv2_to_base64(enhanced_img)

        return JSONResponse({
            "fabric_class": fabric_class,
            "enhanced_image_base64": encoded_image
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enhancement failed: {str(e)}")