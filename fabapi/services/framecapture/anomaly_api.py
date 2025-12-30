import os
import io
import cv2
import numpy as np
import tensorflow as tf
from fastapi import APIRouter, UploadFile, File
from PIL import Image

# =========================
# ROUTER INIT (IMPORTANT)
# =========================
router = APIRouter(
    prefix="/frame",
    tags=["Component 1 Model 2 – Frame Anomaly & Quality Analysis"]
)

# =========================
# PATHS & CONSTANTS
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "AnomalyAE_128_best.keras")

IMG_SIZE = (128, 128)

# ⚠️ Threshold derived from validation (mean + 3σ)
FIS_THRESHOLD = 0.03397

# =========================
# LOAD AUTOENCODER
# =========================
autoencoder = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

# =========================
# UTILITY FUNCTIONS
# =========================
def preprocess(image_bytes):
    """
    Convert uploaded image → normalized 128x128 tensor
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    img = np.array(img).astype("float32") / 255.0
    return img


def compute_fis(img_norm):
    """
    Compute Frame Irregularity Score (FIS)
    """
    recon = autoencoder.predict(
        np.expand_dims(img_norm, axis=0),
        verbose=0
    )[0]

    err_map = (img_norm - recon) ** 2
    fis = float(np.mean(err_map))
    return fis, err_map


def build_vim(err_map, original_shape):
    """
    Build Visual Irregularity Map (VIM) heatmap
    """
    err_gray = np.mean(err_map, axis=2)
    err_norm = (err_gray - err_gray.min()) / (err_gray.max() - err_gray.min() + 1e-8)
    err_uint8 = (err_norm * 255).astype("uint8")

    vim = cv2.applyColorMap(err_uint8, cv2.COLORMAP_JET)
    vim = cv2.resize(vim, (original_shape[1], original_shape[0]))
    return vim


# =========================
# API ENDPOINT (HYBRID MODE)
# =========================
@router.post("/analyze")
async def analyze_frame(file: UploadFile = File(...)):
    """
    Hybrid Frame Analysis:
    - Normal frames → forwarded (low priority)
    - Irregular frames → forwarded (high priority)
    """

    image_bytes = await file.read()

    img_norm = preprocess(image_bytes)
    fis, err_map = compute_fis(img_norm)

    # HYBRID DECISION LOGIC
    if fis > FIS_THRESHOLD:
        frame_type = "irregular"
        priority = "high"
    else:
        frame_type = "normal"
        priority = "low"

    # In hybrid mode → ALL frames forwarded
    decision = "forward"

    return {
        "success": True,
        "frame_analysis": {
            "frame_type": frame_type,
            "fis": round(fis, 6),
            "threshold": FIS_THRESHOLD,
            "priority": priority,
            "decision": decision
        },
        "visual_outputs": {
            "vim_available": True,
            "vim_type": "heatmap"
        },
        "meta": {
            "model": "AnomalyAutoencoder128",
            "mode": "hybrid",
            "input_size": "128x128"
        }
    }
