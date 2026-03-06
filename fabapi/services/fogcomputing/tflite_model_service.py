# import io
# import json
# from pathlib import Path
# import numpy as np
# import cv2
# from PIL import Image
# from tflite_runtime.interpreter import Interpreter

# BASE_DIR = Path(__file__).resolve().parents[2]  # fabapi/
# MODELS_DIR = BASE_DIR / "models"

# PATTERN_BINARY_TFLITE = MODELS_DIR / "pattern_vs_nonpatterned_efficientnetlite_optimized.tflite"
# PATTERN_TYPE_TFLITE   = MODELS_DIR / "pattern_type_efficientnetb0_optimized.tflite"
# CLASS_NAMES_PATH      = MODELS_DIR / "class_mapping.json"

# IMG_SIZE = (224, 224)

# with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
#     class_names = json.load(f)["class_names"]


# def _load_interpreter(path: Path) -> Interpreter:
#     itp = Interpreter(model_path=str(path))
#     itp.allocate_tensors()
#     return itp


# pattern_bin_itp = _load_interpreter(PATTERN_BINARY_TFLITE)
# pattern_type_itp = _load_interpreter(PATTERN_TYPE_TFLITE)

# bin_in = pattern_bin_itp.get_input_details()[0]
# bin_out = pattern_bin_itp.get_output_details()[0]
# type_in = pattern_type_itp.get_input_details()[0]
# type_out = pattern_type_itp.get_output_details()[0]

# print("✅ TFLite models loaded (binary + type)")


# def preprocess_image_bytes(image_bytes: bytes) -> np.ndarray:
#     """
#     Make input [1,224,224,3] float32.
#     IMPORTANT: Match training preprocessing!
#     Your training used tf.keras.applications.efficientnet.preprocess_input
#     which is typically: x = (x/127.5) - 1.0
#     """
#     img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
#     img = img.resize(IMG_SIZE)
#     x = np.array(img).astype(np.float32)

#     # EfficientNet preprocess_input equivalent
#     x = (x / 127.5) - 1.0  # range [-1, 1]

#     x = np.expand_dims(x, axis=0)
#     return x


# def predict_patterned(image_bytes: bytes) -> dict:
#     x = preprocess_image_bytes(image_bytes)

#     pattern_bin_itp.set_tensor(bin_in["index"], x)
#     pattern_bin_itp.invoke()
#     prob = float(pattern_bin_itp.get_tensor(bin_out["index"])[0][0])  # sigmoid

#     label = "patterned" if prob >= 0.5 else "non_patterned"
#     confidence = prob if label == "patterned" else (1.0 - prob)

#     return {"label": label, "prob_patterned": prob, "confidence": float(confidence)}


# def predict_pattern_type(image_bytes: bytes) -> dict:
#     x = preprocess_image_bytes(image_bytes)

#     pattern_type_itp.set_tensor(type_in["index"], x)
#     pattern_type_itp.invoke()
#     probs = pattern_type_itp.get_tensor(type_out["index"])[0]  # softmax vector

#     idx = int(np.argmax(probs))
#     top_label = class_names[idx]
#     top_conf = float(probs[idx])

#     top3_idx = np.argsort(probs)[::-1][:3]
#     top3 = [{"label": class_names[int(i)], "confidence": float(probs[int(i)])} for i in top3_idx]

#     return {"label": top_label, "confidence": top_conf, "top3": top3}


#new one
# Sliding window fabric state manager
# Aggregates frame-level predictions into fabric-level state
# Used for frontend dashboard display

from collections import deque, Counter, defaultdict
from datetime import datetime

WINDOW_SIZE = 30  # last 30 frames (~1–2 seconds depending on FPS)


class FabricStateManager:

    def __init__(self):

        self.buffer = deque(maxlen=WINDOW_SIZE)
        self.latest_frame_timestamp = None

    def update(self, pattern_label, pattern_type, color_info):
        """
        color_info format:

        {
            "dominant_color": str,
            "secondary_color": str,
            "distribution": [
                {"color": str, "ratio": float}
            ]
        }
        """

        self.buffer.append({
            "pattern": pattern_label,
            "pattern_type": pattern_type,
            "dominant_color": color_info.get("dominant_color"),
            "secondary_color": color_info.get("secondary_color"),
            "distribution": color_info.get("distribution", [])
        })

        self.latest_frame_timestamp = datetime.utcnow()

    def get_stable_state(self):

        if not self.buffer:
            return None

        # -------------------------
        # Pattern Aggregation
        # -------------------------

        patterns = [f["pattern"] for f in self.buffer]
        types = [f["pattern_type"] for f in self.buffer]

        stable_pattern = Counter(patterns).most_common(1)[0][0]

        # Prevent invalid pattern type
        if stable_pattern == "patterned":
            stable_type = Counter(types).most_common(1)[0][0]
        else:
            stable_type = "none"

        # -------------------------
        # Dominant / Secondary Colors
        # -------------------------

        dominant_colors = [
            f["dominant_color"]
            for f in self.buffer
            if f["dominant_color"]
        ]

        secondary_colors = [
            f["secondary_color"]
            for f in self.buffer
            if f["secondary_color"]
        ]

        stable_dominant = (
            Counter(dominant_colors).most_common(1)[0][0]
            if dominant_colors else None
        )

        stable_secondary = (
            Counter(secondary_colors).most_common(1)[0][0]
            if secondary_colors else None
        )

        # -------------------------
        # Color Distribution Aggregation
        # -------------------------

        color_accumulator = defaultdict(float)

        for frame in self.buffer:

            for c in frame["distribution"]:

                color_accumulator[c["color"]] += c["ratio"]

        total_ratio_sum = sum(color_accumulator.values())

        distribution = []

        if total_ratio_sum > 0:

            for color, total_ratio in color_accumulator.items():

                distribution.append({
                    "color": color,
                    "ratio": total_ratio / total_ratio_sum
                })

        distribution = sorted(
            distribution,
            key=lambda x: x["ratio"],
            reverse=True
        )

        # -------------------------
        # Final Fabric State
        # -------------------------

        return {
            "pattern": stable_pattern,
            "pattern_type": stable_type,
            "dominant_color": stable_dominant,
            "secondary_color": stable_secondary,
            "color_distribution": distribution,
            "window_size": len(self.buffer),
            "last_update": self.latest_frame_timestamp
        }


# Global instance used across the system
fabric_state = FabricStateManager()