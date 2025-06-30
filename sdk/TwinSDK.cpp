// TwinSDK.cpp
#include "TwinSDK.h"

TwinSDK* TwinSDK::instance = nullptr;

TwinSDK::TwinSDK(const String& token, const String& sensor, const String& project) 
    : projectToken(token), sensorId(sensor), projectId(project),
      apiBaseUrl("http://your-server.com/api"),
      mqttBroker("your-mqtt-broker.com"), mqttPort(1883),
      mqttClient(wifiClient), isConnected(false),
      lastHeartbeat(0), heartbeatInterval(30000),
      commandHandler(nullptr), errorHandler(nullptr) {
    
    instance = this;
    mqttClient.setCallback(mqttCallback);
}

bool TwinSDK::initialize(const String& wifiSSID, const String& wifiPassword) {
    // Connect to WiFi
    WiFi.begin(wifiSSID.c_str(), wifiPassword.c_str());
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi connection failed");
        return false;
    }
    
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    
    // Connect to MQTT
    mqttClient.setServer(mqttBroker.c_str(), mqttPort);
    
    String clientId = "twin-sdk-" + sensorId + "-" + String(millis());
    if (mqttClient.connect(clientId.c_str())) {
        Serial.println("Connected to MQTT broker");
        isConnected = true;
        
        // Subscribe to commands
        String commandTopic = "sensors/" + projectId + "/" + sensorId + "/commands";
        mqttClient.subscribe(commandTopic.c_str());
        
        return true;
    } else {
        Serial.print("MQTT connection failed, rc=");
        Serial.println(mqttClient.state());
        return false;
    }
}

bool TwinSDK::registerSensor(const String& sensorType, const String& metadata) {
    if (WiFi.status() != WL_CONNECTED) return false;
    
    httpClient.begin(apiBaseUrl + "/sensors/register");
    httpClient.addHeader("Content-Type", "application/json");
    httpClient.addHeader("X-Project-Token", projectToken);
    
    StaticJsonDocument<512> doc;
    doc["sensorType"] = sensorType;
    doc["sensorId"] = sensorId;
    
    JsonObject meta = doc.createNestedObject("metadata");
    meta["name"] = sensorId;
    meta["location"] = "ESP32 Device";
    meta["model"] = "ESP32";
    meta["firmware"] = "1.0.0";
    
    String payload;
    serializeJson(doc, payload);
    
    int httpResponseCode = httpClient.POST(payload);
    
    if (httpResponseCode == 200) {
        String response = httpClient.getString();
        Serial.println("Sensor registered successfully");
        Serial.println(response);
        httpClient.end();
        return true;
    } else {
        Serial.print("Registration failed: ");
        Serial.println(httpResponseCode);
        httpClient.end();
        return false;
    }
}

bool TwinSDK::sendData(const String& jsonData) {
    if (!isConnected) return false;
    
    String topic = "sensors/" + projectId + "/" + sensorId + "/data";
    
    StaticJsonDocument<512> doc;
    doc["sensorId"] = sensorId;
    doc["timestamp"] = millis();
    
    // Parse the input JSON data
    JsonObject reading = doc.createNestedObject("reading");
    DynamicJsonDocument inputDoc(256);
    deserializeJson(inputDoc, jsonData);
    reading = inputDoc.as<JsonObject>();
    
    String payload;
    serializeJson(doc, payload);
    
    return mqttClient.publish(topic.c_str(), payload.c_str());
}

bool TwinSDK::sendData(float value, const String& unit) {
    StaticJsonDocument<128> doc;
    doc["value"] = value;
    if (unit.length() > 0) {
        doc["unit"] = unit;
    }
    
    String jsonData;
    serializeJson(doc, jsonData);
    
    return sendData(jsonData);
}

void TwinSDK::mqttCallback(char* topic, byte* payload, unsigned int length) {
    if (instance) {
        instance->onMqttMessage(topic, payload, length);
    }
}

void TwinSDK::onMqttMessage(char* topic, byte* payload, unsigned int length) {
    String message;
    for (int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    
    String topicStr = String(topic);
    
    if (topicStr.indexOf("/commands") > 0) {
        if (commandHandler) {
            commandHandler(message);
        }
    }
}

void TwinSDK::loop() {
    if (!mqttClient.connected()) {
        // Attempt to reconnect
        String clientId = "twin-sdk-" + sensorId + "-" + String(millis());
        if (mqttClient.connect(clientId.c_str())) {
            isConnected = true;
            String commandTopic = "sensors/" + projectId + "/" + sensorId + "/commands";
            mqttClient.subscribe(commandTopic.c_str());
        } else {
            isConnected = false;
        }
    }
    
    mqttClient.loop();
    
    // Send heartbeat
    unsigned long now = millis();
    if (now - lastHeartbeat > heartbeatInterval) {
        sendData("{\"heartbeat\": true}");
        lastHeartbeat = now;
    }
}

void TwinSDK::setCommandHandler(void (*handler)(const String& command)) {
    commandHandler = handler;
}

void TwinSDK::setErrorHandler(void (*handler)(const String& error)) {
    errorHandler = handler;
}

bool TwinSDK::isConnectedToMQTT() {
    return isConnected;
}

bool TwinSDK::isConnectedToWiFi() {
    return WiFi.status() == WL_CONNECTED;
}

void TwinSDK::disconnect() {
    mqttClient.disconnect();
    WiFi.disconnect();
    isConnected = false;
}