from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
import joblib

# ---- Load artifacts ----
model = tf.keras.models.load_model("autoencoder_model.keras")
scaler: MinMaxScaler = joblib.load("scaler.pkl")  # Must match training-time feature order
feature_order = ["throttle_pos", "rpm", "coolant_temp", "pressure", "vibration"]
threshold = 0.008  # Update this if you have a better percentile value

schema = {
    "throttle_pos": (0, 100),
    "rpm": (700, 6500),
    "coolant_temp": (60, 130),
    "pressure": (1.0, 4.2),
    "vibration": (0.12, 0.42)
}

# ---- FastAPI Setup ----
app = FastAPI(title="Engine Health Autoencoder API")

class SensorInput(BaseModel):
    throttle_pos: float
    rpm: float
    coolant_temp: float
    pressure: float
    vibration: float

# ✅ FIXED normalization: use DataFrame for column alignment
def normalize_input(sensor_input: dict):
    input_df = pd.DataFrame([sensor_input], columns=feature_order)
    scaled = scaler.transform(input_df)
    return scaled[0]

def classify_severity(error, threshold):
    if error < threshold:
        return "normal"
    elif error < threshold * 1.5:
        return "low"
    elif error < threshold * 2.5:
        return "medium"
    else:
        return "high"

@app.post("/predict")
def predict(input_data: SensorInput):
    input_dict = input_data.dict()
    norm_input = normalize_input(input_dict)

    # Create dummy sequence (24x features) with same normalized input
    repeated = np.repeat(norm_input[np.newaxis, :], 24, axis=0)
    repeated = repeated[np.newaxis, :, :]  # shape (1, 24, 5)

    # Predict reconstruction
    recon = model.predict(repeated, verbose=0)[0]
    error = np.mean((repeated[0] - recon) ** 2)
    severity = classify_severity(error, threshold)

    return {
        "severity": severity,
        "reconstruction_error": round(float(error), 6),
        "input": input_dict
    }

@app.post("/diagnostics")
def diagnostics(input_data: SensorInput):
    input_dict = input_data.dict()
    result = {}
    for key, value in input_dict.items():
        min_val, max_val = schema.get(key, (0, 1))
        if value < min_val:
            result[key] = "LOW ⚠️"
        elif value > max_val:
            result[key] = "HIGH ⚠️"
        else:
            result[key] = "OK ✅"
    return {"diagnostics": result}

print("✅ Engine Health API is ready.")
