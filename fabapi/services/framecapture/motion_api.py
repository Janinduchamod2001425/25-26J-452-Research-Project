from fastapi import APIRouter, UploadFile, File
import tensorflow as tf
import numpy as np
from PIL import Image
import io, os

router = APIRouter(
    prefix="/motion",
    tags=["Component 1 Model 1 – Motion Classification"]
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "motion_mobilenetv2.h5")

model = tf.keras.models.load_model(MODEL_PATH)
IMG_SIZE = (224, 224)

def preprocess(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    img = np.array(img) / 255.0
    return np.expand_dims(img, axis=0)

@router.post("/predict")
async def predict_motion(file: UploadFile = File(...)):
    img = preprocess(await file.read())
    prob = float(model.predict(img)[0][0])

    return {
        "model": "MotionNet",
        "prediction": "active" if prob >= 0.5 else "idle",
        "confidence": round(prob, 4)
    }
