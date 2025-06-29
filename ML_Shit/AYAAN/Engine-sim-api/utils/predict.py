# utils/predict.py
import numpy as np

def predict_next_state_lstm(history_window, model, input_scaler, target_scaler, input_features, target_features, override_throttle=None):
    # history_window: list of dicts [{...}, {...}, ...]
    df_input = [list(row[feature] for feature in input_features) for row in history_window]
    X = np.array([df_input])  # shape: (1, window_size, input_dim)

    if override_throttle is not None:
        X[0, -1, input_features.index("throttle_pos")] = override_throttle

    X_scaled = input_scaler.transform(X[0])
    X_scaled = X_scaled.reshape(1, X.shape[1], X.shape[2])
    
    y_scaled = model.predict(X_scaled, verbose=0)
    y_pred = target_scaler.inverse_transform(y_scaled)[0]

    return dict(zip(target_features, y_pred.round(3)))
