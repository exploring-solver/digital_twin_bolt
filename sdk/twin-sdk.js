// sdk/twin-sdk.js
export class TwinSDK {
  constructor(options = {}) {
    this.projectToken = options.projectToken;
    this.apiBaseUrl = options.apiBaseUrl || 'http://localhost:3001/api';
    this.mqttBroker = options.mqttBroker || 'ws://localhost:1883';
    this.sensorId = options.sensorId;
    this.projectId = options.projectId;
    this.mqttClient = null;
    this.eventHandlers = new Map();
    this.isConnected = false;
    this.reconnectInterval = null;
    this.heartbeatInterval = null;
  }

  static init(options) {
    return new TwinSDK(options);
  }

  // Initialize and register sensor
  async initialize() {
    try {
      // Connect to MQTT if available
      await this.connectMQTT();
      
      // Start heartbeat
      this.startHeartbeat();
      
      console.log(`TwinSDK initialized for sensor: ${this.sensorId}`);
      return true;
    } catch (error) {
      console.error('SDK initialization failed:', error);
      return false;
    }
  }

  // Register sensor with the platform
  async registerSensor(sensorConfig) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/sensors/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Project-Token': this.projectToken
        },
        body: JSON.stringify({
          sensorType: sensorConfig.type,
          sensorId: this.sensorId,
          metadata: {
            name: sensorConfig.name || this.sensorId,
            location: sensorConfig.location || 'Unknown',
            model: sensorConfig.model || 'Generic',
            firmware: sensorConfig.firmware || '1.0.0',
            tags: sensorConfig.tags || [],
            capabilities: sensorConfig.capabilities || [],
            ...sensorConfig.metadata
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`Sensor registered successfully:`, result);
      return result;
    } catch (error) {
      console.error('Sensor registration failed:', error);
      throw error;
    }
  }

  // Send sensor data
  async sendData(reading, options = {}) {
    const payload = {
      sensorId: this.sensorId,
      reading: typeof reading === 'object' ? reading : { value: reading },
      timestamp: options.timestamp || new Date().toISOString(),
      metadata: {
        quality: options.quality || 'good',
        source: options.source || 'sensor',
        version: options.version || '1.0',
        ...options.metadata
      }
    };

    // Try MQTT first, fallback to HTTP
    if (this.mqttClient && this.isConnected) {
      return this.sendViaMQTT(payload);
    } else {
      return this.sendViaHTTP(payload);
    }
  }

  // Send data via MQTT
  async sendViaMQTT(payload) {
    const topic = `sensors/${this.projectId}/${this.sensorId}/data`;
    
    return new Promise((resolve, reject) => {
      this.mqttClient.publish(topic, JSON.stringify(payload), (error) => {
        if (error) {
          console.error('MQTT publish failed:', error);
          reject(error);
        } else {
          resolve({ success: true, method: 'mqtt' });
        }
      });
    });
  }

  // Send data via HTTP
  async sendViaHTTP(payload) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/data/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Project-Token': this.projectToken
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP send failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, method: 'http', ...result };
    } catch (error) {
      console.error('HTTP send failed:', error);
      throw error;
    }
  }

  // Event handler registration
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  // Emit events to handlers
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Connect to MQTT broker
  async connectMQTT() {
    try {
      // Dynamic import for different environments
      let mqtt;
      if (typeof window !== 'undefined') {
        // Browser environment
        mqtt = await import('mqtt/dist/mqtt.min.js');
      } else {
        // Node.js environment
        mqtt = await import('mqtt');
      }

      const options = {
        clientId: `twin-sdk-${this.sensorId}-${Date.now()}`,
        keepalive: 60,
        reconnectPeriod: 1000,
        clean: true
      };

      this.mqttClient = mqtt.connect(this.mqttBroker, options);

      return new Promise((resolve, reject) => {
        this.mqttClient.on('connect', () => {
          console.log('SDK connected to MQTT broker');
          this.isConnected = true;
          
          // Subscribe to commands for this sensor
          const commandTopic = `sensors/${this.projectId}/${this.sensorId}/commands`;
          this.mqttClient.subscribe(commandTopic);
          
          this.emit('connected');
          resolve();
        });

        this.mqttClient.on('error', (error) => {
          console.error('MQTT connection error:', error);
          this.isConnected = false;
          this.emit('error', error);
          reject(error);
        });

        this.mqttClient.on('close', () => {
          console.log('MQTT connection closed');
          this.isConnected = false;
          this.emit('disconnected');
          this.startReconnect();
        });

        this.mqttClient.on('message', (topic, message) => {
          try {
            const data = JSON.parse(message.toString());
            
            if (topic.includes('/commands')) {
              this.emit('command', data);
            } else if (topic.includes('/config')) {
              this.emit('config', data);
            }
          } catch (error) {
            console.error('Failed to parse MQTT message:', error);
          }
        });

        // Timeout for connection
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('MQTT connection timeout'));
          }
        }, 10000);
      });
    } catch (error) {
      console.error('Failed to connect to MQTT:', error);
      throw error;
    }
  }

  // Start heartbeat to maintain connection
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.sendData({ heartbeat: true, timestamp: new Date().toISOString() }, {
        metadata: { type: 'heartbeat' }
      }).catch(error => {
        console.warn('Heartbeat failed:', error);
      });
    }, 30000); // Every 30 seconds
  }

  // Start reconnection attempts
  startReconnect() {
    if (this.reconnectInterval) return;
    
    this.reconnectInterval = setInterval(() => {
      if (!this.isConnected) {
        console.log('Attempting to reconnect...');
        this.connectMQTT().catch(error => {
          console.error('Reconnection failed:', error);
        });
      } else {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
    }, 5000);
  }

  // Disconnect and cleanup
  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    if (this.mqttClient) {
      this.mqttClient.end();
      this.mqttClient = null;
    }
    
    this.isConnected = false;
    console.log('SDK disconnected');
  }

  // Utility method to send multiple readings
  async sendBatch(readings) {
    const promises = readings.map(reading => this.sendData(reading.data, reading.options));
    return Promise.all(promises);
  }

  // Get sensor configuration from server
  async getConfig() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/sensors/${this.sensorId}/config`, {
        headers: {
          'X-Project-Token': this.projectToken
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get config: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get sensor config:', error);
      throw error;
    }
  }
}