import os
import io
import cv2
import base64
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
    return fis, err_map, recon


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

# compute VIM  metrics
def compute_vim_metrics(err_map):
    err_gray = np.mean(err_map, axis=2)
    vim_mean = float(np.mean(err_gray))
    vim_var = float(np.var(err_gray))
    vim_stability = float(1.0 / (1.0 + vim_var))  # bounded & intuitive
    return vim_mean, vim_var, vim_stability


# helper to convert reconstructed image → base64
def encode_image_base64(img_rgb):
    """
    Encode RGB image (0–1 float) to base64 JPG
    """
    img_uint8 = (img_rgb * 255).astype("uint8")
    img_bgr = cv2.cvtColor(img_uint8, cv2.COLOR_RGB2BGR)
    _, buffer = cv2.imencode(".jpg", img_bgr)
    return base64.b64encode(buffer).decode("utf-8")

# helper to compute region-wise errors
def compute_region_errors(err_map):
    """
    Compute mean reconstruction error for spatial regions.
    Regions:
      - Top-Left, Top-Right
      - Center
      - Bottom-Left, Bottom-Right
    """

    h, w, _ = err_map.shape

    # Convert to grayscale error map
    err_gray = np.mean(err_map, axis=2)

    regions = {
        "Top-Left":     err_gray[0:h//2, 0:w//2],
        "Top-Right":    err_gray[0:h//2, w//2:w],
        "Center":       err_gray[h//4:3*h//4, w//4:3*w//4],
        "Bottom-Left":  err_gray[h//2:h, 0:w//2],
        "Bottom-Right": err_gray[h//2:h, w//2:w],
    }

    region_errors = {
        name: float(np.mean(patch))
        for name, patch in regions.items()
    }

    return region_errors


# =========================
# API ENDPOINT (HYBRID MODE)
# =========================
@router.post("/analyze")
async def analyze_frame(file: UploadFile = File(...)):
    image_bytes = await file.read()

    img_norm = preprocess(image_bytes)
    fis, err_map, recon = compute_fis(img_norm)
    region_errors = compute_region_errors(err_map)
    vim_mean, vim_var, vim_stability = compute_vim_metrics(err_map)
    max_region = max(region_errors, key=region_errors.get)

    # Decision logic
    if fis > FIS_THRESHOLD:
        frame_type = "irregular"
        priority = "high"
    else:
        frame_type = "normal"
        priority = "low"

    decision = "forward"

    # Build VIM
    original_img = Image.open(io.BytesIO(image_bytes))
    vim_img = build_vim(err_map, original_img.size)

    # Encode reconstructed image → base64
    recon_base64 = encode_image_base64(recon)

    # Encode VIM → base64
    _, buffer = cv2.imencode(".jpg", vim_img)
    vim_base64 = base64.b64encode(buffer).decode("utf-8")

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
            "vim_type": "heatmap",
            "vim_base64": vim_base64,
            "reconstruction_base64": recon_base64
        },
        "region_analysis": {
            "method": "mean_reconstruction_error",
            "regions": region_errors,
            "highest_region": max_region
        },
        "vim_metrics": {
            "mean": round(vim_mean, 6),
            "variance": round(vim_var, 6),
            "stability": round(vim_stability, 4)
        },
        "meta": {
            "model": "AnomalyAutoencoder128",
            "mode": "hybrid",
            "input_size": "128x128"
        }
    }
