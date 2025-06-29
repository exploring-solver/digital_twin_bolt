print(">>> main.py is loading")

from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
# import pickle
import joblib
from utils.preprocessing import prepare_input

# --- Load model and scalers ---
model = tf.keras.models.load_model("model/lstm_model.h5",compile=False)

input_scaler = joblib.load("model/input_scaler.pkl")
target_scaler = joblib.load("model/target_scaler.pkl")


# --- Config ---
WINDOW_SIZE = model.input_shape[1]
INPUT_FEATURES = ["throttle_pos", "rpm", "coolant_temp", "pressure", "vibration"]
TARGET_FEATURES = ["rpm", "coolant_temp", "pressure", "vibration"]

app = FastAPI()

class SensorWindow(BaseModel):
    window: list  # list of lists: shape = (window_size, num_features)

@app.post("/predict")
def predict(sensor: SensorWindow):
    # Step 1: prepare input
    X = prepare_input(sensor.window, input_scaler, WINDOW_SIZE)

    # Step 2: predict
    pred_scaled = model.predict(X)[0]

    # Step 3: inverse transform
    pred_real = target_scaler.inverse_transform([pred_scaled])[0]
    print("Predicted values:", dict(zip(TARGET_FEATURES, map(float, pred_real))))


    # Step 4: format
    return dict(zip(TARGET_FEATURES, map(float, pred_real)))
print("✅ FastAPI app object:", app)
