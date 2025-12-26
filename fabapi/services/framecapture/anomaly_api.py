import os
import io
import cv2
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File
from PIL import Image

# -----------------------
# App init
# -----------------------
app = FastAPI(title="FabricVision Frame Analytics API (Model 2)")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "AnomalyAE_128_best.keras")

IMG_SIZE = (128, 128)

# -----------------------
# Load Autoencoder
# -----------------------
autoencoder = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

# ⚠️ Threshold from your validation
FIS_THRESHOLD = 0.03397

# -----------------------
# Utils
# -----------------------
def preprocess(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    img = np.array(img).astype("float32") / 255.0
    return img

def compute_fis(img_norm):
    recon = autoencoder.predict(
        np.expand_dims(img_norm, axis=0),
        verbose=0
    )[0]

    err_map = (img_norm - recon) ** 2
    fis = float(np.mean(err_map))
    return fis, err_map

def build_vim(err_map, original_shape):
    err_gray = np.mean(err_map, axis=2)
    err_norm = (err_gray - err_gray.min()) / (err_gray.max() - err_gray.min() + 1e-8)
    err_uint8 = (err_norm * 255).astype("uint8")

    vim = cv2.applyColorMap(err_uint8, cv2.COLORMAP_JET)
    vim = cv2.resize(vim, (original_shape[1], original_shape[0]))
    return vim

# -----------------------
# API Endpoint (HYBRID)
# -----------------------
@app.post("/analyze-frame")
async def analyze_frame(file: UploadFile = File(...)):
    image_bytes = await file.read()

    img_norm = preprocess(image_bytes)
    fis, err_map = compute_fis(img_norm)

    # HYBRID DECISION
    if fis > FIS_THRESHOLD:
        frame_type = "irregular"
        priority = "high"
    else:
        frame_type = "normal"
        priority = "low"

    # ALWAYS forward in hybrid mode
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
        "meta": {
            "model": "AnomalyAutoencoder128",
            "mode": "hybrid",
            "input_size": "128x128"
        }
    }
