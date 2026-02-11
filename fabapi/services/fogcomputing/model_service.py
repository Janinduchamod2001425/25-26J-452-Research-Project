import io
import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image

BASE_DIR = Path(__file__).resolve().parents[2]  # fabapi/
MODELS_DIR = BASE_DIR / "models" / "fogcomputing"

PATTERN_BINARY_PATH = MODELS_DIR / "pattern_vs_nonpatterned_efficientnetlite.keras"
PATTERN_TYPE_PATH   = MODELS_DIR / "pattern_type_efficientnetb0.keras"
CLASS_NAMES_PATH    = MODELS_DIR / "class_mapping.json"

IMG_SIZE = (224, 224)

# Load models once
pattern_binary_model = tf.keras.models.load_model(str(PATTERN_BINARY_PATH))
pattern_type_model   = tf.keras.models.load_model(str(PATTERN_TYPE_PATH))

with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
    class_names = json.load(f)["class_names"]


def preprocess_image_bytes(image_bytes: bytes) -> np.ndarray:
    """
    EfficientNet-compatible preprocessing.
    Output: numpy float32 batch [1,224,224,3]
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)

    arr = np.array(img).astype(np.float32)
    arr = tf.keras.applications.efficientnet.preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)
    return arr


def predict_patterned(image_bytes: bytes, threshold: float = 0.5) -> dict:
    x = preprocess_image_bytes(image_bytes)
    prob = float(pattern_binary_model.predict(x, verbose=0)[0][0])  # sigmoid output

    label = "patterned" if prob >= threshold else "non_patterned"
    confidence = prob if label == "patterned" else (1.0 - prob)

    return {
        "label": label,
        "prob_patterned": prob,
        "confidence": confidence
    }


def predict_pattern_type(image_bytes: bytes) -> dict:
    x = preprocess_image_bytes(image_bytes)
    probs = pattern_type_model.predict(x, verbose=0)[0]  # softmax

    idx = int(np.argmax(probs))
    top_label = class_names[idx]
    top_conf = float(probs[idx])

    # Top-3 (useful for debugging)
    top3_idx = np.argsort(probs)[::-1][:3]
    top3 = [
        {"label": class_names[int(i)], "confidence": float(probs[int(i)])}
        for i in top3_idx
    ]

    return {
        "label": top_label,
        "confidence": top_conf,
        "top3": top3
    }
