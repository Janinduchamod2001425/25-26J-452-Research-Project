import numpy as np
import joblib
import os
from tensorflow.keras.models import load_model

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "models", "modelA_interval_lstm.h5")
SCALER_PATH = os.path.join(BASE_DIR, "models", "modelA_scaler.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "models", "defect_encoder.pkl")

model = load_model(MODEL_PATH, compile=False)
model.compile(optimizer="adam", loss="mse")

scaler = joblib.load(SCALER_PATH)
encoder = joblib.load(ENCODER_PATH)

WINDOW = 5


def preprocess_defects(defects):

    sequence = []
    last_position = None

    for d in defects:

        defect_enc = encoder.transform([d.defect_type])[0]

        if last_position is None:
            interval = 0
        else:
            interval = d.position_cm - last_position

        sequence.append([d.position_cm, interval, defect_enc])

        last_position = d.position_cm

    return np.array(sequence)


def predict_from_defects(defects, steps=30):

    sequence = preprocess_defects(defects)

    if len(sequence) < WINDOW:
        raise ValueError("Need at least 5 defects for prediction")

    positions = sequence[:,0]
    defects_enc = sequence[:,2]

    # check defect type consistency
    if len(set(defects_enc)) != 1:
        return []

    intervals = np.diff(positions)

    std = intervals.std()
    mean_interval = intervals.mean()

    slope = np.polyfit(range(len(intervals)), intervals, 1)[0]

    REPEAT_THRESHOLD = 1.5
    DRIFT_SLOPE_THRESHOLD = 1.0

    # ----------------------------
    # Pattern classification
    # ----------------------------

    if std < REPEAT_THRESHOLD and abs(slope) < 0.5:
        pattern_type = "Repeating"

    elif abs(slope) > DRIFT_SLOPE_THRESHOLD:
        pattern_type = "Drifting"

    else:
        pattern_type = "Drifting"

    last_position = int(positions[-1])
    future_positions = []

    # ----------------------------
    # Repeating pattern
    # ----------------------------

    if pattern_type == "Repeating":

        mean_interval = int(round(mean_interval))

        for _ in range(steps):
            last_position += mean_interval
            future_positions.append(last_position)

        return future_positions

    # ----------------------------
    # LSTM prediction
    # ----------------------------

    seq_scaled = scaler.transform(sequence)

    current = seq_scaled.reshape(1, WINDOW, -1)

    for _ in range(steps):

        pred_interval_scaled = model.predict(current, verbose=0)[0][0]

        dummy = np.zeros((1,3))
        dummy[0,1] = pred_interval_scaled

        interval_real = scaler.inverse_transform(dummy)[0,1]
        interval_real = max(1, int(round(interval_real)))

        last_position += interval_real
        future_positions.append(last_position)

        new_row = current[0,-1].copy()

        dummy2 = np.zeros((1,3))
        dummy2[0,0] = last_position

        pos_scaled = scaler.transform(dummy2)[0,0]

        new_row[0] = pos_scaled
        new_row[1] = pred_interval_scaled

        current = np.concatenate(
            [current[:,1:,:], new_row.reshape(1,1,-1)],
            axis=1
        )

    return future_positions