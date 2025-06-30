// Example Arduino sketch using the SDK
void setup() {
    Serial.begin(115200);
    
    // Initialize SDK
    TwinSDK sdk("dt_abc123xyz", "esp32-sensor-01", "project-123");
    
    // Set up command handler
    sdk.setCommandHandler([](const String& command) {
        Serial.println("Received command: " + command);
        
        // Parse and handle commands
        DynamicJsonDocument doc(256);
        deserializeJson(doc, command);
        
        String operation = doc["operation"];
        if (operation == "led_on") {
            digitalWrite(LED_BUILTIN, HIGH);
        } else if (operation == "led_off") {
            digitalWrite(LED_BUILTIN, LOW);
        }
    });
    
    // Initialize with WiFi credentials
    if (sdk.initialize("YourWiFiSSID", "YourWiFiPassword")) {
        Serial.println("SDK initialized successfully");
        
        // Register sensor
        sdk.registerSensor("temperature", "{\"location\": \"Office\"}");
    } else {
        Serial.println("SDK initialization failed");
    }
}

void loop() {
    static unsigned long lastReading = 0;
    static TwinSDK sdk("dt_abc123xyz", "esp32-sensor-01", "project-123");
    
    // Handle SDK maintenance
    sdk.loop();
    
    // Send sensor data every 5 seconds
    if (millis() - lastReading > 5000) {
        // Read temperature from sensor (example)
        float temperature = 25.0 + random(-50, 50) / 10.0;
        float humidity = 60.0 + random(-200, 200) / 10.0;
        
        // Send data
        String sensorData = "{\"temperature\": " + String(temperature) + 
                           ", \"humidity\": " + String(humidity) + "}";
        
        if (sdk.sendData(sensorData)) {
            Serial.println("Data sent successfully");
        } else {
            Serial.println("Failed to send data");
        }
        
        lastReading = millis();
    }
}

#endif