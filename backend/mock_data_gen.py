#!/usr/bin/env python3
"""
Mock SCADA Data Generator
Generates realistic industrial sensor data for testing the Digital Twin platform
Simulates temperature, pressure, flow, and vibration sensors with realistic patterns
"""

import json
import time
import random
import math
import websocket
import threading
from datetime import datetime
from typing import Dict, List, Any

class SCADADataGenerator:
    """
    Generates mock SCADA sensor data with realistic patterns and anomalies
    """
    
    def __init__(self, websocket_url: str = "ws://localhost:8080"):
        self.websocket_url = websocket_url
        self.ws = None
        self.running = False
        
        # Define sensor configurations
        self.sensors = {
            'pump_001_temp': {
                'type': 'temperature',
                'device_id': 'pump_001',
                'base_value': 65.0,
                'variance': 15.0,
                'unit': 'celsius',
                'min_value': 20.0,
                'max_value': 120.0,
                'drift_rate': 0.1
            },
            'pump_001_vibration': {
                'type': 'vibration',
                'device_id': 'pump_001',
                'base_value': 3.0,
                'variance': 2.0,
                'unit': 'mm/s',
                'min_value': 0.0,
                'max_value': 15.0,
                'drift_rate': 0.05
            },
            'vessel_001_pressure': {
                'type': 'pressure',
                'device_id': 'vessel_001',
                'base_value': 75.0,
                'variance': 10.0,
                'unit': 'psi',
                'min_value': 0.0,
                'max_value': 150.0,
                'drift_rate': 0.2
            },
            'vessel_001_temp': {
                'type': 'temperature',
                'device_id': 'vessel_001',
                'base_value': 80.0,
                'variance': 12.0,
                'unit': 'celsius',
                'min_value': 20.0,
                'max_value': 150.0,
                'drift_rate': 0.15
            },
            'flow_001_rate': {
                'type': 'flow',
                'device_id': 'flow_001',
                'base_value': 45.0,
                'variance': 20.0,
                'unit': 'l/min',
                'min_value': 0.0,
                'max_value': 100.0,
                'drift_rate': 0.3
            },
            'flow_001_temp': {
                'type': 'temperature',
                'device_id': 'flow_001',
                'base_value': 55.0,
                'variance': 8.0,
                'unit': 'celsius',
                'min_value': 20.0,
                'max_value': 100.0,
                'drift_rate': 0.1
            }
        }
        
        # Simulation state
        self.sensor_states = {}
        self.simulation_time = 0
        self.anomaly_probability = 0.05  # 5% chance of anomaly per reading
        
        # Initialize sensor states
        for sensor_id, config in self.sensors.items():
            self.sensor_states[sensor_id] = {
                'current_value': config['base_value'],
                'drift_offset': 0.0,
                'last_anomaly': 0,
                'trend_direction': random.choice([-1, 1])
            }
    
    def connect_websocket(self):
        """Establish WebSocket connection to SCADA server"""
        try:
            self.ws = websocket.WebSocket()
            self.ws.connect(self.websocket_url)
            print(f"Connected to SCADA server at {self.websocket_url}")
            return True
        except Exception as e:
            print(f"Failed to connect to WebSocket: {e}")
            return False
    
    def generate_sensor_value(self, sensor_id: str) -> float:
        """
        Generate realistic sensor value with patterns, drift, and anomalies
        """
        config = self.sensors[sensor_id]
        state = self.sensor_states[sensor_id]
        
        # Base value with normal variance
        base = config['base_value']
        variance = config['variance']
        
        # Add normal random variation
        normal_variation = random.gauss(0, variance * 0.3)
        
        # Add gradual drift over time
        drift_rate = config['drift_rate']
        state['drift_offset'] += random.gauss(0, drift_rate) * state['trend_direction']
        
        # Limit drift to reasonable bounds
        max_drift = variance * 0.5
        state['drift_offset'] = max(-max_drift, min(max_drift, state['drift_offset']))
        
        # Occasionally reverse drift direction
        if random.random() < 0.01:  # 1% chance per reading
            state['trend_direction'] *= -1
        
        # Add cyclic patterns (simulating daily/operational cycles)
        cycle_amplitude = variance * 0.2
        cycle_value = cycle_amplitude * math.sin(self.simulation_time * 0.01)
        
        # Calculate base value
        value = base + normal_variation + state['drift_offset'] + cycle_value
        
        # Add anomalies
        if random.random() < self.anomaly_probability:
            anomaly_type = random.choice(['spike', 'drop', 'noise'])
            
            if anomaly_type == 'spike':
                value += variance * random.uniform(1.5, 3.0)
            elif anomaly_type == 'drop':
                value -= variance * random.uniform(1.0, 2.0)
            elif anomaly_type == 'noise':
                value += random.gauss(0, variance * 0.8)
            
            state['last_anomaly'] = self.simulation_time
            print(f"Generated {anomaly_type} anomaly for {sensor_id}: {value:.2f}")
        
        # Ensure value stays within realistic bounds
        value = max(config['min_value'], min(config['max_value'], value))
        
        # Update state
        state['current_value'] = value
        
        return round(value, 2)
    
    def generate_device_status(self, device_id: str) -> Dict[str, Any]:
        """Generate device status information"""
        # Get all sensors for this device
        device_sensors = [s for s in self.sensors.keys() if self.sensors[s]['device_id'] == device_id]
        
        # Determine overall device health
        critical_count = 0
        warning_count = 0
        
        for sensor_id in device_sensors:
            config = self.sensors[sensor_id]
            current_value = self.sensor_states[sensor_id]['current_value']
            
            # Simple threshold-based health assessment
            if config['type'] == 'temperature':
                if current_value > 90:
                    critical_count += 1
                elif current_value > 75:
                    warning_count += 1
            elif config['type'] == 'pressure':
                if current_value > 95:
                    critical_count += 1
                elif current_value > 80:
                    warning_count += 1
            elif config['type'] == 'vibration':
                if current_value > 8:
                    critical_count += 1
                elif current_value > 5:
                    warning_count += 1
            elif config['type'] == 'flow':
                if current_value < 10:
                    critical_count += 1
                elif current_value < 20:
                    warning_count += 1
        
        # Determine status
        if critical_count > 0:
            status = 'critical'
        elif warning_count > 0:
            status = 'warning'
        else:
            status = 'normal'
        
        return {
            'device_id': device_id,
            'status': status,
            'sensor_count': len(device_sensors),
            'critical_sensors': critical_count,
            'warning_sensors': warning_count,
            'last_maintenance': '2024-01-15T10:30:00Z',  # Mock data
            'uptime_hours': random.randint(100, 8760)  # Mock uptime
        }
    
    def send_sensor_data(self, sensor_id: str, value: float):
        """Send sensor data via WebSocket"""
        config = self.sensors[sensor_id]
        
        message = {
            'type': 'sensor_data',
            'sensorId': sensor_id,
            'sensorType': config['type'],
            'deviceId': config['device_id'],
            'value': value,
            'unit': config['unit'],
            'quality': 'good',
            'timestamp': int(time.time() * 1000)
        }
        
        try:
            self.ws.send(json.dumps(message))
        except Exception as e:
            print(f"Error sending sensor data: {e}")
            return False
        
        return True
    
    def send_device_status(self, device_id: str):
        """Send device status via WebSocket"""
        status_data = self.generate_device_status(device_id)
        
        message = {
            'type': 'device_status',
            'deviceId': device_id,
            'status': status_data['status'],
            'details': status_data,
            'timestamp': int(time.time() * 1000)
        }
        
        try:
            self.ws.send(json.dumps(message))
        except Exception as e:
            print(f"Error sending device status: {e}")
            return False
        
        return True
    
    def run_simulation(self, update_interval: float = 1.0):
        """Run the main simulation loop"""
        print("Starting SCADA data simulation...")
        print(f"Generating data for {len(self.sensors)} sensors")
        print(f"Update interval: {update_interval} seconds")
        
        self.running = True
        
        while self.running:
            try:
                # Generate and send sensor data
                for sensor_id in self.sensors.keys():
                    value = self.generate_sensor_value(sensor_id)
                    
                    if not self.send_sensor_data(sensor_id, value):
                        print("Failed to send sensor data, attempting reconnection...")
                        if not self.connect_websocket():
                            print("Reconnection failed, stopping simulation")
                            break
                
                # Send device status updates (less frequently)
                if self.simulation_time % 10 == 0:  # Every 10 cycles
                    unique_devices = set(config['device_id'] for config in self.sensors.values())
                    for device_id in unique_devices:
                        self.send_device_status(device_id)
                
                # Increment simulation time
                self.simulation_time += 1
                
                # Wait for next update
                time.sleep(update_interval)
                
            except KeyboardInterrupt:
                print("\nSimulation interrupted by user")
                break
            except Exception as e:
                print(f"Simulation error: {e}")
                time.sleep(5)  # Wait before retrying
    
    def stop_simulation(self):
        """Stop the simulation"""
        self.running = False
        if self.ws:
            self.ws.close()
        print("SCADA simulation stopped")

def main():
    """Main function to run the SCADA data generator"""
    print("SCADA Mock Data Generator")
    print("=" * 40)
    
    # Initialize generator
    generator = SCADADataGenerator()
    
    # Connect to WebSocket server
    if not generator.connect_websocket():
        print("Could not connect to SCADA server. Make sure the server is running.")
        return
    
    try:
        # Run simulation
        generator.run_simulation(update_interval=1.0)
    except Exception as e:
        print(f"Simulation failed: {e}")
    finally:
        generator.stop_simulation()

if __name__ == "__main__":
    main()