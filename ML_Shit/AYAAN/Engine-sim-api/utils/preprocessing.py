import numpy as np

def prepare_input(window, input_scaler, window_size):
    window = np.array(window).reshape(-1, len(window[0]))
    scaled = input_scaler.transform(window)
    return scaled[-window_size:].reshape(1, window_size, -1)
