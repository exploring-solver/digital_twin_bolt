import gradio as gr
from normalization_engine import BaseEngine
from sklearn.ensemble import IsolationForest
import numpy as np

# Setup
engine_type = "petrol"
normalizer = BaseEngine(engine_type)
schema = normalizer.schema

# Simulate and train model
def generate_normal_data(engine_type, n_samples=200):
    engine = BaseEngine(engine_type)
    schema = engine.schema
    data = []
    for _ in range(n_samples):
        sample = {sensor: np.random.uniform(min_val, max_val) for sensor, (min_val, max_val) in schema.items()}
        data.append(sample)
    return data

normal_data = generate_normal_data(engine_type)
X = np.array([[v for v in normalizer.normalize(d).values()] for d in normal_data])
model = IsolationForest(contamination=0.05).fit(X)

# Predict function
def detect(rpm, coolant_temp, throttle_pos, pressure, vibration, air_temp):
    input_data = {
        "rpm": rpm,
        "coolant_temp": coolant_temp,
        "throttle_pos": throttle_pos,
        "pressure": pressure,
        "vibration": vibration,
        "air_temp": air_temp
    }
    norm_input = list(normalizer.normalize(input_data).values())
    result = model.predict([norm_input])[0]
    return "⚠️ Anomaly" if result == -1 else "✅ Normal"

# Gradio Interface
inputs = [gr.Number(label=k) for k in schema.keys()]
iface = gr.Interface(fn=detect, inputs=inputs, outputs="text", title="Engine Health Check")
iface.launch()
