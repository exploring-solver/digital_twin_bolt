# Example usage:
if __name__ == "__main__":
    # Initialize SDK
    sdk = TwinSDK(
        project_token="dt_abc123xyz",
        sensor_id="temp-sensor-01",
        project_id="project-123"
    )
    
    # Register sensor
    sdk.register_sensor({
        "type": "temperature",
        "name": "Temperature Sensor 01",
        "location": "Boiler Room",
        "model": "DHT22"
    })
    
    # Set up event handlers
    sdk.on("command", lambda cmd: print(f"Received command: {cmd}"))
    sdk.on("connected", lambda _: print("SDK connected to platform"))
    
    # Initialize and start sending data
    if sdk.initialize():
        import random
        
        try:
            while True:
                # Send temperature reading
                temp = 20 + random.uniform(-5, 15)
                humidity = 40 + random.uniform(-10, 20)
                
                sdk.send_data({
                    "temperature": round(temp, 2),
                    "humidity": round(humidity, 2)
                })
                
                time.sleep(5)  # Send every 5 seconds
                
        except KeyboardInterrupt:
            print("Stopping...")
        finally:
            sdk.disconnect()