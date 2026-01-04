import numpy as np
import joblib
from tensorflow.keras.models import load_model
import os

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "modelA_lstm.keras")
SCALER_PATH = os.path.join(BASE_DIR, "models", "modelA_scaler.pkl")

# Load once (IMPORTANT)
model = load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

WINDOW = 10
MIN_STEP = 0.002

def predict_next_positions(sequence, steps=10):
    """
    sequence shape: (WINDOW, features)
    """
    sequence = np.array(sequence)

    # Scale input
    sequence_scaled = scaler.transform(sequence)

    current = sequence_scaled.reshape(1, WINDOW, -1)
    last_pos = current[0, -1, 0]

    future_positions = []

    for _ in range(steps):
        pred_pos, pred_prob, pred_interval = model.predict(current, verbose=0)

        next_pos = float(pred_pos[0][0])

        # Physical constraint
        if next_pos <= last_pos:
            next_pos = last_pos + MIN_STEP

        future_positions.append(next_pos)

        new_row = current[0, -1].copy()
        new_row[0] = next_pos

        current = np.concatenate(
            [current[:, 1:, :], new_row.reshape(1, 1, -1)],
            axis=1
        )

        last_pos = next_pos

    # Inverse scale (only position column)
    real_positions = scaler.inverse_transform(
        np.column_stack([future_positions, np.zeros((steps, 3))])
    )[:, 0]

    return real_positions.round(2).tolist()
