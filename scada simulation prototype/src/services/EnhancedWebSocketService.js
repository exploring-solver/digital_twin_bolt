import { io } from 'socket.io-client';

export class EnhancedWebSocketService {
  constructor() {
    this.socket = null;
    this.activeTwins = new Set();
    this.eventCallbacks = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(serverUrl = 'http://localhost:3001') {
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Enhanced WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('platform_connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Enhanced WebSocket disconnected:', reason);
      this.emit('platform_disconnected', reason);
      this.handleReconnect();
    });

    this.socket.on('twin_data', (data) => {
      const { twinId, sensorData } = data;
      this.emit(`twin_data_${twinId}`, sensorData);
    });

    this.socket.on('twin_alerts', (data) => {
      const { twinId, alerts } = data;
      this.emit(`twin_alerts_${twinId}`, alerts);
    });

    return this;
  }

  connectToTwin(twinId) {
    if (this.socket && !this.activeTwins.has(twinId)) {
      this.socket.emit('subscribe_twin', twinId);
      this.activeTwins.add(twinId);
      console.log(`Subscribed to twin: ${twinId}`);
    }
  }

  disconnectFromTwin(twinId) {
    if (this.socket && this.activeTwins.has(twinId)) {
      this.socket.emit('unsubscribe_twin', twinId);
      this.activeTwins.delete(twinId);
      console.log(`Unsubscribed from twin: ${twinId}`);
    }
  }

  on(event, callback) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }
    this.eventCallbacks.get(event).add(callback);
  }

  off(event, callback) {
    if (this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Reconnection attempt ${this.reconnectAttempts}`);
        this.socket.connect();
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }

  disconnect() {
    if (this.socket) {
      this.activeTwins.forEach(twinId => {
        this.disconnectFromTwin(twinId);
      });
      this.socket.disconnect();
      this.socket = null;
    }
  }
}