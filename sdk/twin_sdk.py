# twin_sdk.py
import json
import time
import threading
import requests
import paho.mqtt.client as mqtt
from typing import Dict, Any, Optional, Callable

class TwinSDK:
    def __init__(self, project_token: str, sensor_id: str, project_id: str, 
                 api_base_url: str = "http://localhost:3001/api",
                 mqtt_broker: str = "localhost"):
        self.project_token = project_token
        self.sensor_id = sensor_id
        self.project_id = project_id
        self.api_base_url = api_base_url
        self.mqtt_broker = mqtt_broker
        self.mqtt_client = None
        self.is_connected = False
        self.event_handlers = {}
        self.heartbeat_thread = None
        self.stop_heartbeat = False
    
    def initialize(self) -> bool:
        """Initialize SDK and connect to MQTT"""
        try:
            self.connect_mqtt()
            self.start_heartbeat()
            print(f"TwinSDK initialized for sensor: {self.sensor_id}")
            return True
        except Exception as e:
            print(f"SDK initialization failed: {e}")
            return False
    
    def register_sensor(self, sensor_config: Dict[str, Any]) -> Dict[str, Any]:
        """Register sensor with the platform"""
        url = f"{self.api_base_url}/sensors/register"
        headers = {
            "Content-Type": "application/json",
            "X-Project-Token": self.project_token
        }
        
        payload = {
            "sensorType": sensor_config.get("type"),
            "sensorId": self.sensor_id,
            "metadata": {
                "name": sensor_config.get("name", self.sensor_id),
                "location": sensor_config.get("location", "Unknown"),
                "model": sensor_config.get("model", "Generic"),
                "firmware": sensor_config.get("firmware", "1.0.0"),
                **sensor_config.get("metadata", {})
            }
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        print(f"Sensor registered successfully: {result}")
        return result
    
    def send_data(self, reading: Any, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Send sensor data"""
        if options is None:
            options = {}
        
        payload = {
            "sensorId": self.sensor_id,
            "reading": reading if isinstance(reading, dict) else {"value": reading},
            "timestamp": options.get("timestamp", time.time()),
            "metadata": {
                "quality": options.get("quality", "good"),
                "source": options.get("source", "sensor"),
                "version": options.get("version", "1.0"),
                **options.get("metadata", {})
            }
        }
        
        # Try MQTT first, fallback to HTTP
        if self.mqtt_client and self.is_connected:
            return self.send_via_mqtt(payload)
        else:
            return self.send_via_http(payload)
    
    def send_via_mqtt(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Send data via MQTT"""
        topic = f"sensors/{self.project_id}/{self.sensor_id}/data"
        
        result = self.mqtt_client.publish(topic, json.dumps(payload))
        
        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            return {"success": True, "method": "mqtt"}
        else:
            raise Exception(f"MQTT publish failed with code: {result.rc}")
    
    def send_via_http(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Send data via HTTP"""
        url = f"{self.api_base_url}/data/ingest"
        headers = {
            "Content-Type": "application/json",
            "X-Project-Token": self.project_token
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        return {"success": True, "method": "http", **result}
    
    def on(self, event: str, handler: Callable):
        """Register event handler"""
        if event not in self.event_handlers:
            self.event_handlers[event] = []
        self.event_handlers[event].append(handler)
    
    def emit(self, event: str, data: Any):
        """Emit event to handlers"""
        if event in self.event_handlers:
            for handler in self.event_handlers[event]:
                try:
                    handler(data)
                except Exception as e:
                    print(f"Error in event handler for {event}: {e}")
    
    def connect_mqtt(self):
        """Connect to MQTT broker"""
        def on_connect(client, userdata, flags, rc):
            if rc == 0:
                print("Connected to MQTT broker")
                self.is_connected = True
                
                # Subscribe to commands
                command_topic = f"sensors/{self.project_id}/{self.sensor_id}/commands"
                client.subscribe(command_topic)
                
                self.emit("connected", None)
            else:
                print(f"Failed to connect to MQTT broker: {rc}")
                self.emit("error", f"Connection failed: {rc}")
        
        def on_message(client, userdata, msg):
            try:
                data = json.loads(msg.payload.decode())
                
                if "/commands" in msg.topic:
                    self.emit("command", data)
                elif "/config" in msg.topic:
                    self.emit("config", data)
            except Exception as e:
                print(f"Failed to parse MQTT message: {e}")
        
        def on_disconnect(client, userdata, rc):
            print("Disconnected from MQTT broker")
            self.is_connected = False
            self.emit("disconnected", rc)
        
        self.mqtt_client = mqtt.Client(f"twin-sdk-{self.sensor_id}-{int(time.time())}")
        self.mqtt_client.on_connect = on_connect
        self.mqtt_client.on_message = on_message
        self.mqtt_client.on_disconnect = on_disconnect
        
        self.mqtt_client.connect(self.mqtt_broker, 1883, 60)
        self.mqtt_client.loop_start()
    
    def start_heartbeat(self):
        """Start heartbeat thread"""
        def heartbeat_loop():
            while not self.stop_heartbeat:
                try:
                    self.send_data(
                        {"heartbeat": True, "timestamp": time.time()},
                        {"metadata": {"type": "heartbeat"}}
                    )
                except Exception as e:
                    print(f"Heartbeat failed: {e}")
                
                time.sleep(30)  # Every 30 seconds
        
        self.heartbeat_thread = threading.Thread(target=heartbeat_loop)
        self.heartbeat_thread.daemon = True
        self.heartbeat_thread.start()
    
    def disconnect(self):
        """Disconnect and cleanup"""
        self.stop_heartbeat = True
        
        if self.heartbeat_thread:
            self.heartbeat_thread.join(timeout=1)
        
        if self.mqtt_client:
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()
        
        self.is_connected = False
        print("SDK disconnected")
        
