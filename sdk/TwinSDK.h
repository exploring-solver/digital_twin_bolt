// TwinSDK.h
#ifndef TWIN_SDK_H
#define TWIN_SDK_H

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>

class TwinSDK {
private:
    String projectToken;
    String sensorId;
    String projectId;
    String apiBaseUrl;
    String mqttBroker;
    int mqttPort;
    
    WiFiClient wifiClient;
    PubSubClient mqttClient;
    HTTPClient httpClient;
    
    bool isConnected;
    unsigned long lastHeartbeat;
    unsigned long heartbeatInterval;
    
    void (*commandHandler)(const String& command);
    void (*errorHandler)(const String& error);
    
    void onMqttMessage(char* topic, byte* payload, unsigned int length);
    static TwinSDK* instance;
    static void mqttCallback(char* topic, byte* payload, unsigned int length);

public:
    TwinSDK(const String& token, const String& sensor, const String& project);
    
    bool initialize(const String& wifiSSID, const String& wifiPassword);
    bool registerSensor(const String& sensorType, const String& metadata = "{}");
    bool sendData(const String& jsonData);
    bool sendData(float value, const String& unit = "");
    
    void setCommandHandler(void (*handler)(const String& command));
    void setErrorHandler(void (*handler)(const String& error));
    
    void loop();
    void disconnect();
    
    bool isConnectedToMQTT();
    bool isConnectedToWiFi();
};