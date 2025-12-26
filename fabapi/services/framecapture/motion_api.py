import tensorflow as tf
from fastapi import FastAPI, UploadFile, File
import numpy as np
from PIL import Image
import io
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "motion_mobilenetv2.h5")

app = FastAPI(title="FabricVision Motion Detection API")

model = tf.keras.models.load_model(MODEL_PATH)

IMG_SIZE = (224, 224)

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    img = np.array(img) / 255.0
    img = np.expand_dims(img, axis=0)
    return img

@app.post("/predict-motion")
async def predict_motion(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img = preprocess_image(image_bytes)

    prob = model.predict(img)[0][0]
    label = "active" if prob >= 0.5 else "idle"

    return {
        "prediction": label,
        "confidence": round(float(prob), 4)
    }
