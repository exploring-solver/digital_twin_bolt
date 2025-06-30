import { initializeMQTT, PORT, server } from "../index.js";
import { EnhancedDatabaseService } from "./EnhancedDatabaseService.js";
import { LoggingService } from "./LoggingService.js";
import { v4 as uuidv4 } from 'uuid';
import mqtt from 'mqtt';
export class MQTTBrokerService {
  constructor() {
    this.client = null;
    this.logger = new LoggingService();
    this.subscriptions = new Map();
    this.databaseService = new EnhancedDatabaseService();
  }

  async connect() {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    const options = {
      clientId: `digital-twin-server-${uuidv4()}`,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      keepalive: 60,
      reconnectPeriod: 1000,
      clean: true
    };

    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(brokerUrl, options);
      
      this.client.on('connect', () => {
        this.logger.info('Connected to MQTT broker');
        resolve();
      });
      
      this.client.on('error', (error) => {
        this.logger.error('MQTT connection error', error);
        reject(error);
      });
      
      this.client.on('message', (topic, message) => {
        if (this.subscriptions.has(topic)) {
          this.subscriptions.get(topic)(topic, message);
        }
      });
    });
  }

  subscribe(topic, callback) {
    if (this.client) {
      this.client.subscribe(topic);
      this.subscriptions.set(topic, callback);
      this.logger.info(`Subscribed to MQTT topic: ${topic}`);
    }
  }

  publish(topic, message) {
    return new Promise((resolve, reject) => {
      if (this.client) {
        this.client.publish(topic, message, (error) => {
          if (error) {
            this.logger.error('MQTT publish error', error);
            reject(error);
          } else {
            resolve();
          }
        });
      } else {
        reject(new Error('MQTT client not connected'));
      }
    });
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }
}

// Initialize and start server
const initializeServer = async () => {
  const logger = new LoggingService();
  const databaseService = new EnhancedDatabaseService();
  try {
    await databaseService.initialize();
    await initializeMQTT();
    
    server.listen(PORT, () => {
      logger.info(`Enhanced Digital Twin Platform running on port ${PORT}`);
      console.log(`🌐 Digital Twin Platform with MQTT started on http://localhost:${PORT}`);
      console.log(`📡 MQTT topics: sensors/+/+/data, twins/+/commands, twins/+/responses`);
    });
  } catch (error) {
    logger.error('Failed to initialize server', error);
    process.exit(1);
  }
};

initializeServer();