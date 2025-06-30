import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import LSTM, Dense, RepeatVector, TimeDistributed, Input
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
import warnings
warnings.filterwarnings('ignore')

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

class EngineAnomalyDetector:
    """
`    General-purpose LSTM Autoencoder-based anomaly detection system for piston engines.
`    Supports cars, bikes, tractors, and generators with different operating characteristics.
    """
    
    def __init__(self):
        self.engine_schema_bank = self._define_engine_schemas()
        self.scaler = StandardScaler()
        self.model = None
        self.threshold = None
        self.feature_names = ["throttle_pos", "rpm", "coolant_temp", "pressure", "vibration"]
        self.window_size = 24
        self.is_trained = False
        
    def _define_engine_schemas(self):
        """
        Define min-max value ranges for different engine types.
        Based on real-world specifications and operating conditions.
        """
        schemas = {
            "car": {
                "throttle_pos": (0, 100),      # Throttle position percentage
                "rpm": (600, 6500),            # Idle to redline
                "coolant_temp": (70, 110),     # Celsius - normal operating range
                "pressure": (10, 45),          # Oil pressure (PSI)
                "vibration": (0.1, 2.5)       # Vibration amplitude (m/s²)
            },
            "bike": {
                "throttle_pos": (0, 100),
                "rpm": (800, 12000),           # Higher RPM range for motorcycles
                "coolant_temp": (65, 105),     # Slightly cooler operating temp
                "pressure": (8, 40),           # Lower oil pressure
                "vibration": (0.2, 4.0)       # Higher vibration due to single/twin cylinders
            },
            "tractor": {
                "throttle_pos": (0, 100),
                "rpm": (500, 2500),            # Lower RPM range for torque
                "coolant_temp": (75, 115),     # Higher operating temperatures
                "pressure": (15, 60),          # Higher oil pressure for heavy duty
                "vibration": (0.3, 3.5)       # Moderate vibration
            },
            "generator": {
                "throttle_pos": (20, 85),      # More stable throttle range
                "rpm": (1500, 3600),          # Fixed or narrow RPM range
                "coolant_temp": (80, 105),     # Consistent operating temp
                "pressure": (12, 50),          # Steady pressure
                "vibration": (0.1, 1.8)       # Lower vibration (stationary)
            }
        }
        return schemas
    
    def generate_engine_data(self, engine_type, hours=24, sampling_rate_sec=30):
        """
        Generate synthetic time-series engine sensor data for 24 hours.
        
        Args:
            engine_type (str): Type of engine ("car", "bike", "tractor", "generator")
            hours (int): Duration of data generation in hours
            sampling_rate_sec (int): Sampling rate in seconds
            
        Returns:
            pd.DataFrame: Synthetic sensor data with realistic patterns
        """
        if engine_type not in self.engine_schema_bank:
            raise ValueError(f"Engine type '{engine_type}' not supported. Choose from: {list(self.engine_schema_bank.keys())}")
        
        schema = self.engine_schema_bank[engine_type]
        total_samples = int((hours * 3600) / sampling_rate_sec)
        
        # Generate time vector
        time_vec = np.arange(0, total_samples * sampling_rate_sec, sampling_rate_sec)
        
        # Generate base patterns for each sensor
        data = {"t_sec": time_vec}
        
        # Create realistic engine operation cycles
        if engine_type == "car":
            # Car: Variable driving patterns
            base_rpm = self._generate_driving_pattern(total_samples, schema["rpm"])
            base_throttle = self._generate_throttle_pattern(base_rpm, schema)
        elif engine_type == "bike":
            # Bike: More aggressive acceleration patterns
            base_rpm = self._generate_bike_pattern(total_samples, schema["rpm"])
            base_throttle = self._generate_throttle_pattern(base_rpm, schema)
        elif engine_type == "tractor":
            # Tractor: Steady work patterns with load variations
            base_rpm = self._generate_tractor_pattern(total_samples, schema["rpm"])
            base_throttle = self._generate_throttle_pattern(base_rpm, schema)
        else:  # generator
            # Generator: Very stable operation
            base_rpm = self._generate_generator_pattern(total_samples, schema["rpm"])
            base_throttle = self._generate_throttle_pattern(base_rpm, schema)
        
        # Add realistic correlations between sensors
        data["rpm"] = base_rpm
        data["throttle_pos"] = base_throttle
        
        # Coolant temperature: Correlated with RPM and load
        temp_base = (schema["coolant_temp"][0] + schema["coolant_temp"][1]) / 2
        temp_variation = (data["rpm"] - schema["rpm"][0]) / (schema["rpm"][1] - schema["rpm"][0]) * 20
        data["coolant_temp"] = temp_base + temp_variation + np.random.normal(0, 2, total_samples)
        data["coolant_temp"] = np.clip(data["coolant_temp"], *schema["coolant_temp"])
        
        # Oil pressure: Correlated with RPM
        pressure_base = (schema["pressure"][0] + schema["pressure"][1]) / 2
        pressure_variation = (data["rpm"] - schema["rpm"][0]) / (schema["rpm"][1] - schema["rpm"][0]) * 15
        data["pressure"] = pressure_base + pressure_variation + np.random.normal(0, 1.5, total_samples)
        data["pressure"] = np.clip(data["pressure"], *schema["pressure"])
        
        # Vibration: Correlated with RPM and throttle
        vib_base = (schema["vibration"][0] + schema["vibration"][1]) / 2
        rpm_factor = (data["rpm"] - schema["rpm"][0]) / (schema["rpm"][1] - schema["rpm"][0])
        throttle_factor = data["throttle_pos"] / 100
        vib_variation = (rpm_factor * 0.6 + throttle_factor * 0.4) * schema["vibration"][1]
        data["vibration"] = vib_base + vib_variation + np.random.normal(0, 0.2, total_samples)
        data["vibration"] = np.clip(data["vibration"], *schema["vibration"])
        
        return pd.DataFrame(data)
    
    def _generate_driving_pattern(self, samples, rpm_range):
        """Generate realistic car driving RPM pattern."""
        # Create cycles of acceleration, cruising, and deceleration
        pattern = np.zeros(samples)
        idle_rpm = rpm_range[0]
        max_rpm = rpm_range[1]
        
        i = 0
        while i < samples:
            # Idle period
            idle_duration = np.random.randint(30, 120)
            pattern[i:i+idle_duration] = idle_rpm + np.random.normal(0, 50, idle_duration)
            i += idle_duration
            
            # Acceleration phase
            if i < samples:
                accel_duration = np.random.randint(20, 60)
                target_rpm = np.random.uniform(1500, max_rpm * 0.8)
                pattern[i:i+accel_duration] = np.linspace(idle_rpm, target_rpm, accel_duration)
                i += accel_duration
            
            # Cruising phase
            if i < samples:
                cruise_duration = np.random.randint(60, 200)
                cruise_rpm = pattern[i-1] if i > 0 else target_rpm
                pattern[i:i+cruise_duration] = cruise_rpm + np.random.normal(0, 100, cruise_duration)
                i += cruise_duration
        
        return np.clip(pattern[:samples], *rpm_range)
    
    def _generate_bike_pattern(self, samples, rpm_range):
        """Generate realistic motorcycle RPM pattern with more aggressive acceleration."""
        pattern = np.zeros(samples)
        idle_rpm = rpm_range[0]
        max_rpm = rpm_range[1]
        
        i = 0
        while i < samples:
            # Idle/low RPM
            low_duration = np.random.randint(20, 80)
            pattern[i:i+low_duration] = idle_rpm + np.random.normal(0, 100, low_duration)
            i += low_duration
            
            # Quick acceleration (bikes accelerate faster)
            if i < samples:
                accel_duration = np.random.randint(10, 30)
                target_rpm = np.random.uniform(2000, max_rpm * 0.9)
                pattern[i:i+accel_duration] = np.linspace(pattern[i-1], target_rpm, accel_duration)
                i += accel_duration
            
            # High RPM cruising
            if i < samples:
                cruise_duration = np.random.randint(40, 100)
                cruise_rpm = pattern[i-1] if i > 0 else target_rpm
                pattern[i:i+cruise_duration] = cruise_rpm + np.random.normal(0, 200, cruise_duration)
                i += cruise_duration
        
        return np.clip(pattern[:samples], *rpm_range)
    
    def _generate_tractor_pattern(self, samples, rpm_range):
        """Generate realistic tractor RPM pattern with steady work cycles."""
        pattern = np.zeros(samples)
        idle_rpm = rpm_range[0]
        work_rpm = rpm_range[1] * 0.7  # Tractors typically work at 70% max RPM
        
        i = 0
        while i < samples:
            # Idle period
            idle_duration = np.random.randint(50, 150)
            pattern[i:i+idle_duration] = idle_rpm + np.random.normal(0, 25, idle_duration)
            i += idle_duration
            
            # Work period - steady RPM with load variations
            if i < samples:
                work_duration = np.random.randint(200, 500)
                base_work_rpm = np.random.uniform(work_rpm * 0.8, work_rpm * 1.1)
                # Add load variations (PTO, hydraulics, etc.)
                load_variations = np.sin(np.linspace(0, 4*np.pi, work_duration)) * 200
                pattern[i:i+work_duration] = base_work_rpm + load_variations + np.random.normal(0, 50, work_duration)
                i += work_duration
        
        return np.clip(pattern[:samples], *rpm_range)
    
    def _generate_generator_pattern(self, samples, rpm_range):
        """Generate realistic generator RPM pattern - very stable."""
        # Generators typically run at fixed RPM (1800 or 3600 for 60Hz)
        target_rpm = 1800 if rpm_range[1] >= 1800 else rpm_range[1] * 0.9
        
        # Very stable with minimal variation
        pattern = np.full(samples, target_rpm)
        pattern += np.random.normal(0, 10, samples)  # Minimal variation
        
        return np.clip(pattern, *rpm_range)
    
    def _generate_throttle_pattern(self, rpm_data, schema):
        """Generate throttle position based on RPM pattern."""
        rpm_min, rpm_max = schema["rpm"]
        throttle_min, throttle_max = schema["throttle_pos"]
        
        # Throttle roughly correlates with RPM but with some lag and nonlinearity
        normalized_rpm = (rpm_data - rpm_min) / (rpm_max - rpm_min)
        
        # Nonlinear relationship (throttle curve)
        throttle = throttle_min + (throttle_max - throttle_min) * (normalized_rpm ** 0.7)
        
        # Add noise and lag
        throttle += np.random.normal(0, 5, len(rpm_data))
        
        return np.clip(throttle, throttle_min, throttle_max)
    
    def create_sequences(self, data, window_size=None):
        """
        Create input sequences for LSTM training.
        
        Args:
            data (np.array): Preprocessed sensor data
            window_size (int): Size of the sliding window
            
        Returns:
            np.array: Sequences of shape (num_windows, window_size, n_features)
        """
        if window_size is None:
            window_size = self.window_size
            
        sequences = []
        for i in range(len(data) - window_size + 1):
            sequences.append(data[i:i + window_size])
        
        return np.array(sequences)
    
    def build_lstm_autoencoder(self, n_features, window_size=None):
        """
        Build LSTM Autoencoder architecture.
        
        Args:
            n_features (int): Number of input features
            window_size (int): Input sequence length
            
        Returns:
            tf.keras.Model: Compiled LSTM Autoencoder model
        """
        if window_size is None:
            window_size = self.window_size
            
        # Input layer
        input_layer = Input(shape=(window_size, n_features), name='input')
        
        # Encoder layers
        encoder_lstm1 = LSTM(128, return_sequences=True, name='encoder_lstm1')(input_layer)
        encoder_lstm2 = LSTM(64, return_sequences=False, name='encoder_lstm2')(encoder_lstm1)
        
        # Bottleneck
        bottleneck = Dense(32, activation='relu', name='bottleneck')(encoder_lstm2)
        
        # Repeat vector to prepare for decoder
        repeat_vector = RepeatVector(window_size, name='repeat_vector')(bottleneck)
        
        # Decoder layers
        decoder_lstm1 = LSTM(64, return_sequences=True, name='decoder_lstm1')(repeat_vector)
        decoder_lstm2 = LSTM(128, return_sequences=True, name='decoder_lstm2')(decoder_lstm1)
        
        # Output layer
        output_layer = TimeDistributed(Dense(n_features, activation='linear'), name='output')(decoder_lstm2)
        
        # Create and compile model
        model = Model(inputs=input_layer, outputs=output_layer, name='LSTM_Autoencoder')
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def train(self, engine_types=None, hours_per_type=24, validation_split=0.2, epochs=100, batch_size=32):
        """
        Train the LSTM Autoencoder on mixed engine data.
        
        Args:
            engine_types (list): List of engine types to include in training
            hours_per_type (int): Hours of data per engine type
            validation_split (float): Fraction of data for validation
            epochs (int): Training epochs
            batch_size (int): Batch size for training
        """
        if engine_types is None:
            engine_types = ["car", "bike", "tractor", "generator"]
        
        print("🔧 Generating synthetic engine data...")
        
        # Generate and stack data from different engine types
        all_data = []
        for engine_type in engine_types:
            print(f"   Generating {engine_type} data ({hours_per_type}h)...")
            engine_data = self.generate_engine_data(engine_type, hours=hours_per_type)
            all_data.append(engine_data)
        
        # Combine all data
        combined_data = pd.concat(all_data, ignore_index=True)
        print(f"✅ Generated {len(combined_data):,} data points across {len(engine_types)} engine types")
        
        # Prepare features (exclude time column)
        feature_data = combined_data[self.feature_names].values
        
        # Preprocess with StandardScaler
        print("🔄 Preprocessing data with StandardScaler...")
        scaled_data = self.scaler.fit_transform(feature_data)
        
        # Create sequences
        print(f"📊 Creating sequences with window size {self.window_size}...")
        sequences = self.create_sequences(scaled_data)
        print(f"✅ Created {len(sequences):,} sequences of shape {sequences.shape}")
        
        # Split into train and validation
        X_train, X_val = train_test_split(sequences, test_size=validation_split, random_state=42)
        print(f"📚 Training set: {len(X_train):,} sequences")
        print(f"🔍 Validation set: {len(X_val):,} sequences")
        
        # Build model
        print("🏗️ Building LSTM Autoencoder...")
        self.model = self.build_lstm_autoencoder(n_features=len(self.feature_names))
        print(f"✅ Model built with {self.model.count_params():,} parameters")
        
        # Training callbacks
        callbacks = [
            EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True),
            ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=8, min_lr=1e-6)
        ]
        
        # Train model
        print("🚀 Training LSTM Autoencoder...")
        history = self.model.fit(
            X_train, X_train,  # Autoencoder: input = output
            validation_data=(X_val, X_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        # Calculate reconstruction errors on training data for threshold
        print("🎯 Calculating anomaly detection threshold...")
        train_predictions = self.model.predict(X_train, verbose=0)
        train_mse = np.mean(np.square(X_train - train_predictions), axis=(1, 2))
        
        # Set threshold at 95th percentile
        self.threshold = np.percentile(train_mse, 95)
        print(f"✅ Anomaly threshold set to: {self.threshold:.6f}")
        
        self.is_trained = True
        
        # Plot training history
        self._plot_training_history(history)
        
        return history
    
    def _plot_training_history(self, history):
        """Plot training and validation loss."""
        plt.figure(figsize=(12, 4))
        
        plt.subplot(1, 2, 1)
        plt.plot(history.history['loss'], label='Training Loss')
        plt.plot(history.history['val_loss'], label='Validation Loss')
        plt.title('Model Loss During Training')
        plt.xlabel('Epoch')
        plt.ylabel('MSE Loss')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        plt.subplot(1, 2, 2)
        plt.plot(history.history['mae'], label='Training MAE')
        plt.plot(history.history['val_mae'], label='Validation MAE')
        plt.title('Model MAE During Training')
        plt.xlabel('Epoch')
        plt.ylabel('Mean Absolute Error')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.show()
    
    def detect_anomaly(self, sensor_input, engine_type="car"):
        """
        Detect anomaly in a single sensor reading.
        
        Args:
            sensor_input (dict): Dictionary with sensor values
            engine_type (str): Type of engine for clipping values
            
        Returns:
            dict: Detection results with MSE, status, and diagnostics
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before detecting anomalies. Call train() first.")
        
        # Validate input
        required_features = set(self.feature_names)
        provided_features = set(sensor_input.keys())
        if not required_features.issubset(provided_features):
            missing = required_features - provided_features
            raise ValueError(f"Missing required features: {missing}")
        
        # Clip values using engine schema
        if engine_type not in self.engine_schema_bank:
            print(f"⚠️ Unknown engine type '{engine_type}', using 'car' schema")
            engine_type = "car"
        
        schema = self.engine_schema_bank[engine_type]
        clipped_input = {}
        out_of_bounds = {}
        
        for feature in self.feature_names:
            original_value = sensor_input[feature]
            min_val, max_val = schema[feature]
            clipped_value = np.clip(original_value, min_val, max_val)
            clipped_input[feature] = clipped_value
            
            # Check if value was out of bounds
            if original_value < min_val or original_value > max_val:
                out_of_bounds[feature] = {
                    'original': original_value,
                    'clipped': clipped_value,
                    'bounds': (min_val, max_val),
                    'severity': 'HIGH' if (original_value < min_val * 0.8 or original_value > max_val * 1.2) else 'MEDIUM'
                }
        
        # Convert to array and normalize
        feature_array = np.array([clipped_input[feature] for feature in self.feature_names]).reshape(1, -1)
        normalized_input = self.scaler.transform(feature_array)
        
        # For single reading, we need to create a sequence
        # We'll repeat the reading to create a window
        sequence = np.tile(normalized_input, (self.window_size, 1)).reshape(1, self.window_size, len(self.feature_names))
        
        # Get reconstruction
        reconstruction = self.model.predict(sequence, verbose=0)
        
        # Calculate MSE
        mse = np.mean(np.square(sequence - reconstruction))
        
        # Determine status
        is_anomaly = mse > self.threshold
        status = "ANOMALY ❌" if is_anomaly else "NORMAL ✅"
        
        # Feature-wise reconstruction errors for diagnostics
        feature_errors = {}
        for i, feature in enumerate(self.feature_names):
            feature_mse = np.mean(np.square(sequence[0, :, i] - reconstruction[0, :, i]))
            feature_errors[feature] = feature_mse
        
        # Most problematic feature
        most_problematic = max(feature_errors, key=feature_errors.get) if feature_errors else None
        
        return {
            'mse': float(mse),
            'threshold': float(self.threshold),
            'status': status,
            'is_anomaly': is_anomaly,
            'confidence': float(min(mse / self.threshold, 2.0)) if self.threshold > 0 else 0.0,
            'out_of_bounds': out_of_bounds,
            'feature_errors': feature_errors,
            'most_problematic_feature': most_problematic,
            'engine_type': engine_type
        }
    
    def diagnose_anomaly(self, detection_result):
        """
        Provide detailed diagnostics for anomaly detection result.
        
        Args:
            detection_result (dict): Result from detect_anomaly()
            
        Returns:
            str: Formatted diagnostic report
        """
        result = detection_result
        report = []
        
        report.append("=" * 50)
        report.append("🔧 ENGINE ANOMALY DETECTION REPORT")
        report.append("=" * 50)
        
        # Overall status
        report.append(f"Status: {result['status']}")
        report.append(f"MSE Score: {result['mse']:.6f}")
        report.append(f"Threshold: {result['threshold']:.6f}")
        report.append(f"Confidence: {result['confidence']:.2f}x threshold")
        report.append(f"Engine Type: {result['engine_type'].upper()}")
        report.append("")
        
        # Out of bounds analysis
        if result['out_of_bounds']:
            report.append("⚠️ OUT OF BOUNDS FEATURES:")
            for feature, info in result['out_of_bounds'].items():
                report.append(f"  • {feature.upper()}:")
                report.append(f"    - Original: {info['original']:.2f}")
                report.append(f"    - Clipped to: {info['clipped']:.2f}")
                report.append(f"    - Expected range: {info['bounds'][0]:.1f} - {info['bounds'][1]:.1f}")
                report.append(f"    - Severity: {info['severity']}")
            report.append("")
        
        # Feature-wise error analysis
        if result['feature_errors']:
            report.append("📊 FEATURE-WISE RECONSTRUCTION ERRORS:")
            sorted_errors = sorted(result['feature_errors'].items(), key=lambda x: x[1], reverse=True)
            for feature, error in sorted_errors:
                emoji = "🔴" if error > result['threshold'] / len(self.feature_names) else "🟡" if error > result['threshold'] / (len(self.feature_names) * 2) else "🟢"
                report.append(f"  {emoji} {feature.upper()}: {error:.6f}")
            report.append("")
        
        # Most problematic feature
        if result['most_problematic_feature']:
            report.append(f"🎯 MOST PROBLEMATIC: {result['most_problematic_feature'].upper()}")
            report.append("")
        
        # Recommendations
        report.append("💡 RECOMMENDATIONS:")
        if result['is_anomaly']:
            if result['out_of_bounds']:
                report.append("  • Check sensors for out-of-range readings")
                report.append("  • Verify sensor calibration and connections")
            report.append("  • Inspect engine components related to problematic features")
            report.append("  • Consider immediate maintenance check")
            if result['confidence'] > 1.5:
                report.append("  • HIGH PRIORITY: Anomaly confidence is very high")
        else:
            report.append("  • Engine operating within normal parameters")
            report.append("  • Continue routine monitoring")
        
        report.append("=" * 50)
        
        return "\n".join(report)
    
    def batch_detect(self, data_df, engine_type="car"):
        """
        Detect anomalies in batch data.
        
        Args:
            data_df (pd.DataFrame): DataFrame with sensor readings
            engine_type (str): Engine type for clipping
            
        Returns:
            pd.DataFrame: DataFrame with anomaly detection results
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before detecting anomalies.")
        
        results = []
        for idx, row in data_df.iterrows():
            sensor_reading = row[self.feature_names].to_dict()
            result = self.detect_anomaly(sensor_reading, engine_type)
            results.append({
                'index': idx,
                'mse': result['mse'],
                'is_anomaly': result['is_anomaly'],
                'confidence': result['confidence'],
                'status': result['status']
            })
        
        return pd.DataFrame(results)

# Example usage and demonstration
def main():
    """
    Demonstration of the Engine Anomaly Detection System
    """
    print("🚀 LSTM Autoencoder Engine Anomaly Detection System")
    print("=" * 60)
    
    # Initialize detector
    detector = EngineAnomalyDetector()
    
    # Train the model
    print("\n1️⃣ TRAINING PHASE")
    history = detector.train(
        engine_types=["car", "bike", "tractor", "generator"],
        hours_per_type=12,  # Reduced for demo
        epochs=50,          # Reduced for demo
        batch_size=64
    )
    
    print("\n2️⃣ TESTING PHASE")
    
    # Test with normal readings
    print("\n🔍 Testing with NORMAL readings:")
    normal_reading = {
        "throttle_pos": 45.0,
        "rpm": 2500.0,
        "coolant_temp": 85.0,
        "pressure": 25.0,
        "vibration": 1.2
    }
    
    result = detector.detect_anomaly(normal_reading, engine_type="car")
    print(f"Result: {result['status']} (MSE: {result['mse']:.6f})")
    
    # Test with anomalous readings
    print("\n🚨 Testing with ANOMALOUS readings:")
    anomalous_reading = {
        "throttle_pos": 80.0,
        "rpm": 6000.0,    # High RPM
        "coolant_temp": 125.0,  # Overheating!
        "pressure": 5.0,        # Low pressure!
        "vibration": 5.5        # High vibration!
    }
    
    result = detector.detect_anomaly(anomalous_reading, engine_type="car")
    print(f"Result: {result['status']} (MSE: {result['mse']:.6f})")
    
    # Show detailed diagnosis
    print("\n📋 DETAILED DIAGNOSIS:")
    diagnosis = detector.diagnose_anomaly(result)
    print(diagnosis)
    
    print("\n✅ Demo completed!")

if __name__ == "_main_":
    main()