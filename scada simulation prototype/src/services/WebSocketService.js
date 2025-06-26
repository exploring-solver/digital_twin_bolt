import { io } from 'socket.io-client';

export class WebSocketService {
  constructor() {
    this.socket = null;
    this.eventListeners = new Map();
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  connect() {
    try {
      this.socket = io('http://localhost:3001', {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: this.maxReconnectDelay,
        maxReconnectionAttempts: this.maxReconnectAttempts
      });

      this.socket.on('connect', () => {
        console.log('Connected to SCADA server');
        this.reconnectAttempts = 0;
        this.emit('connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from SCADA server');
        this.emit('disconnected');
      });

      this.socket.on('sensor_data', (data) => {
        this.emit('sensor_data', data);
      });

      this.socket.on('alerts', (alerts) => {
        this.emit('alerts', alerts);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          this.emit('connection_failed');
        }
      });

    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  subscribeTo(sensorTypes) {
    if (!this.socket) return;
  
    const trySubscribe = () => {
      console.log('[WebSocket] Emitting subscribe_sensors');
      this.socket.emit('subscribe_sensors', sensorTypes);
    };
  
    if (this.socket.connected) {
      trySubscribe();
    } else {
      this.socket.once('connect', trySubscribe);
    }
  }  

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }

  // API methods for fetching historical data
  async fetchSensorHistory(startTime, endTime, sensorType) {
    try {
      const params = new URLSearchParams();
      if (startTime) params.append('startTime', startTime);
      if (endTime) params.append('endTime', endTime);
      if (sensorType) params.append('sensorType', sensorType);

      const response = await fetch(`http://localhost:3001/api/sensors/history?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch sensor history:', error);
      return [];
    }
  }

  async fetchCurrentSensorData() {
    try {
      const response = await fetch('http://localhost:3001/api/sensors/current');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch current sensor data:', error);
      return null;
    }
  }
}