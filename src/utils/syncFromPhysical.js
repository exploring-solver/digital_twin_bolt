import { useDigitalTwinStore } from '../store/digitalTwinStore'
import config from './config.json'

let websocket = null
let reconnectInterval = null

/**
 * Initialize WebSocket connection for real-time SCADA data
 * Handles connection management and data synchronization
 */
export function initializeWebSocket() {
  const { setConnectionStatus, updateSensorData } = useDigitalTwinStore.getState()
  
  // Connect to WebSocket server
  const connect = () => {
    try {
      websocket = new WebSocket(config.scadaConfig.protocols.websocket.url)
      
      websocket.onopen = () => {
        console.log('WebSocket connected to SCADA system')
        setConnectionStatus('Connected to SCADA', true)
        
        // Clear reconnection interval
        if (reconnectInterval) {
          clearInterval(reconnectInterval)
          reconnectInterval = null
        }
      }
      
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          processSCADAMessage(data)
        } catch (error) {
          console.error('Error parsing SCADA message:', error)
        }
      }
      
      websocket.onclose = () => {
        console.log('WebSocket disconnected from SCADA system')
        setConnectionStatus('Disconnected - Attempting reconnect...', false)
        
        // Attempt to reconnect
        if (!reconnectInterval) {
          reconnectInterval = setInterval(() => {
            console.log('Attempting to reconnect...')
            connect()
          }, config.scadaConfig.protocols.websocket.reconnectInterval)
        }
      }
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('Connection Error', false)
      }
      
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
      setConnectionStatus('Failed to Connect', false)
      
      // Start mock data if WebSocket fails
      startMockDataSimulation()
    }
  }
  
  connect()
}

/**
 * Process incoming SCADA messages and update sensor data
 * @param {Object} message - SCADA message containing sensor data
 */
function processSCADAMessage(message) {
  const { updateSensorData } = useDigitalTwinStore.getState()
  
  switch (message.type) {
    case 'sensor_data':
      updateSensorData(message.sensorId, {
        value: message.value,
        type: message.sensorType,
        deviceId: message.deviceId,
        quality: message.quality || 'good',
        timestamp: message.timestamp || Date.now()
      })
      break
      
    case 'device_status':
      // Handle device status updates
      console.log('Device status update:', message)
      break
      
    case 'alarm':
      // Handle alarm conditions
      console.log('SCADA Alarm:', message)
      break
      
    default:
      console.log('Unknown SCADA message type:', message.type)
  }
}

/**
 * Start mock data simulation when real SCADA connection is unavailable
 * Generates realistic sensor data for development and testing
 */
function startMockDataSimulation() {
  const { setConnectionStatus, updateSensorData } = useDigitalTwinStore.getState()
  
  setConnectionStatus('Using Mock Data', true)
  
  // Define mock sensors
  const mockSensors = [
    { id: 'pump_001_temp', type: 'temperature', deviceId: 'pump_001', baseValue: 65, variance: 15 },
    { id: 'pump_001_vibration', type: 'vibration', deviceId: 'pump_001', baseValue: 3, variance: 2 },
    { id: 'vessel_001_pressure', type: 'pressure', deviceId: 'vessel_001', baseValue: 75, variance: 10 },
    { id: 'vessel_001_temp', type: 'temperature', deviceId: 'vessel_001', baseValue: 80, variance: 12 },
    { id: 'flow_001_rate', type: 'flow', deviceId: 'flow_001', baseValue: 45, variance: 20 },
    { id: 'flow_001_temp', type: 'temperature', deviceId: 'flow_001', baseValue: 55, variance: 8 }
  ]
  
  // Generate mock data at regular intervals
  setInterval(() => {
    mockSensors.forEach(sensor => {
      const value = generateMockValue(sensor.baseValue, sensor.variance)
      
      updateSensorData(sensor.id, {
        value: value,
        type: sensor.type,
        deviceId: sensor.deviceId,
        quality: 'good',
        timestamp: Date.now()
      })
    })
  }, config.scadaConfig.updateInterval)
}

/**
 * Generate realistic mock sensor values with some variance
 * @param {number} baseValue - Base sensor value
 * @param {number} variance - Maximum variance from base value
 * @returns {number} Generated sensor value
 */
function generateMockValue(baseValue, variance) {
  const randomVariance = (Math.random() - 0.5) * variance
  const value = baseValue + randomVariance
  
  // Add some occasional spikes for testing alert conditions
  if (Math.random() < 0.05) { // 5% chance of spike
    return value + variance * 1.5
  }
  
  return Math.max(0, value) // Ensure non-negative values
}

/**
 * Send command to SCADA system (for future control functionality)
 * @param {string} deviceId - Target device ID
 * @param {string} command - Command to execute
 * @param {Object} parameters - Command parameters
 */
export function sendSCADACommand(deviceId, command, parameters = {}) {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    const message = {
      type: 'command',
      deviceId,
      command,
      parameters,
      timestamp: Date.now()
    }
    
    websocket.send(JSON.stringify(message))
    console.log('Sent SCADA command:', message)
  } else {
    console.warn('Cannot send command: WebSocket not connected')
  }
}

/**
 * PHASE 3 PLACEHOLDER: Advanced simulation state management
 * Will handle complex simulation scenarios and state changes
 */
export function simulateStateChange(params) {
  // TODO: Implement advanced simulation capabilities
  // - Multi-device scenario simulation
  // - Cascade failure modeling
  // - Emergency response simulation
  console.log('Simulation state change placeholder:', params)
}

/**
 * Close WebSocket connection and cleanup
 */
export function closeConnection() {
  if (websocket) {
    websocket.close()
    websocket = null
  }
  
  if (reconnectInterval) {
    clearInterval(reconnectInterval)
    reconnectInterval = null
  }
}