import numpy as np

class BaseEngine:
    def __init__(self, engine_type):
        self.engine_type = engine_type
        self.schema = self._load_schema(engine_type)
    
    def _load_schema(self, engine_type):
        if engine_type == "petrol":
            return {
                "rpm": (800, 8000),
                "coolant_temp": (70, 105),
                "throttle_pos": (0, 100),
                "pressure": (2.0, 5.0),  # bar
                "vibration": (0.0, 1.5), # mm/s
                "air_temp": (15, 45)
            }
        elif engine_type == "diesel":
            return {
                "rpm": (600, 6000),
                "coolant_temp": (70, 100),
                "throttle_pos": (0, 100),
                "pressure": (2.5, 6.0),  # bar
                "vibration": (0.0, 1.7), # mm/s
                "air_temp": (10, 45)
            }
        elif engine_type == "rotary":
            return {
                "rpm": (1000, 9000),
                "coolant_temp": (70, 110),
                "throttle_pos": (0, 100),
                "pressure": (2.0, 4.5),
                "vibration": (0.0, 1.2),
                "air_temp": (15, 50)
            }
        else:
            raise ValueError("Unsupported engine type")

    def normalize(self, sensor_data):
        norm_data = {}
        for key, value in sensor_data.items():
            min_val, max_val = self.schema.get(key, (0, 1))
            norm_data[key] = (value - min_val) / (max_val - min_val)
        return norm_data

    def denormalize(self, norm_data):
        real_data = {}
        for key, value in norm_data.items():
            min_val, max_val = self.schema.get(key, (0, 1))
            real_data[key] = value * (max_val - min_val) + min_val
        return real_data