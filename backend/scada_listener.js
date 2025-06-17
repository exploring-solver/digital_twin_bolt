import WebSocket, { WebSocketServer } from 'ws'
import { createClient } from '@supabase/supabase-js'

/**
 * SCADA WebSocket Server
 * Listens for real-time sensor data and broadcasts to connected clients
 * Integrates with Supabase for data persistence
 */

// Initialize Supabase client (will be configured when user connects)
let supabase = null

// WebSocket server configuration
const WS_PORT = 8080
const wss = new WebSocketServer({ port: WS_PORT })

console.log(`SCADA WebSocket server starting on port ${WS_PORT}`)

// Store connected clients
const clients = new Set()

// Mock SCADA data generator
let mockDataInterval = null

wss.on('connection', (ws) => {
  console.log('New client connected to SCADA server')
  clients.add(ws)
  
  // Start mock data generation if not already running
  if (!mockDataInterval) {
    startMockDataGeneration()
  }
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())
      handleClientMessage(data, ws)
    } catch (error) {
      console.error('Error parsing client message:', error)
    }
  })
  
  ws.on('close', () => {
    console.log('Client disconnected from SCADA server')
    clients.delete(ws)
    
    // Stop mock data if no clients connected
    if (clients.size === 0 && mockDataInterval) {
      clearInterval(mockDataInterval)
      mockDataInterval = null
    }
  })
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
    clients.delete(ws)
  })
})

/**
 * Handle incoming messages from clients
 * @param {Object} data - Message data from client
 * @param {WebSocket} ws - Client WebSocket connection
 */
function handleClientMessage(data, ws) {
  switch (data.type) {
    case 'command':
      handleSCADACommand(data)
      break
    case 'subscribe':
      handleSubscription(data, ws)
      break
    default:
      console.log('Unknown message type:', data.type)
  }
}

/**
 * Handle SCADA control commands
 * @param {Object} command - Command data
 */
function handleSCADACommand(command) {
  console.log('Received SCADA command:', command)
  
  // TODO: Implement actual SCADA command processing
  // - Device control logic
  // - Safety interlocks
  // - Command validation
  
  // Broadcast command acknowledgment
  broadcastToClients({
    type: 'command_ack',
    commandId: command.id,
    status: 'executed',
    timestamp: Date.now()
  })
}

/**
 * Handle client subscription requests
 * @param {Object} subscription - Subscription data
 * @param {WebSocket} ws - Client WebSocket
 */
function handleSubscription(subscription, ws) {
  console.log('Client subscription:', subscription)
  
  // TODO: Implement selective data streaming based on subscriptions
  // - Filter data by device/sensor type
  // - Adjust update frequency
  // - Custom data formats
}

/**
 * Start generating mock SCADA data for development
 */
function startMockDataGeneration() {
  console.log('Starting mock SCADA data generation')
  
  const sensors = [
    { id: 'pump_001_temp', type: 'temperature', deviceId: 'pump_001', baseValue: 65, variance: 15 },
    { id: 'pump_001_vibration', type: 'vibration', deviceId: 'pump_001', baseValue: 3, variance: 2 },
    { id: 'vessel_001_pressure', type: 'pressure', deviceId: 'vessel_001', baseValue: 75, variance: 10 },
    { id: 'vessel_001_temp', type: 'temperature', deviceId: 'vessel_001', baseValue: 80, variance: 12 },
    { id: 'flow_001_rate', type: 'flow', deviceId: 'flow_001', baseValue: 45, variance: 20 },
    { id: 'flow_001_temp', type: 'temperature', deviceId: 'flow_001', baseValue: 55, variance: 8 }
  ]
  
  mockDataInterval = setInterval(() => {
    sensors.forEach(sensor => {
      const value = generateSensorValue(sensor.baseValue, sensor.variance)
      const sensorData = {
        type: 'sensor_data',
        sensorId: sensor.id,
        sensorType: sensor.type,
        deviceId: sensor.deviceId,
        value: value,
        quality: 'good',
        timestamp: Date.now()
      }
      
      // Broadcast to all connected clients
      broadcastToClients(sensorData)
      
      // Store in Supabase if configured
      if (supabase) {
        storeSensorData(sensorData)
      }
    })
  }, 1000) // Update every second
}

/**
 * Generate realistic sensor values with variance and occasional anomalies
 * @param {number} baseValue - Base sensor value
 * @param {number} variance - Maximum variance from base
 * @returns {number} Generated sensor value
 */
function generateSensorValue(baseValue, variance) {
  // Normal variation
  let value = baseValue + (Math.random() - 0.5) * variance
  
  // Occasional spikes (5% chance)
  if (Math.random() < 0.05) {
    value += variance * (Math.random() > 0.5 ? 1.5 : -1.5)
  }
  
  // Gradual drift simulation (very slow)
  const drift = Math.sin(Date.now() / 100000) * variance * 0.1
  value += drift
  
  return Math.max(0, Number(value.toFixed(2)))
}

/**
 * Broadcast message to all connected clients
 * @param {Object} data - Data to broadcast
 */
function broadcastToClients(data) {
  const message = JSON.stringify(data)
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

/**
 * Store sensor data in Supabase database
 * @param {Object} sensorData - Sensor data to store
 */
async function storeSensorData(sensorData) {
  try {
    const { error } = await supabase
      .from('sensors')
      .insert({
        sensor_id: sensorData.sensorId,
        device_id: sensorData.deviceId,
        type: sensorData.sensorType,
        value: sensorData.value,
        quality: sensorData.quality,
        timestamp: new Date(sensorData.timestamp).toISOString()
      })
    
    if (error) {
      console.error('Error storing sensor data:', error)
    }
  } catch (error) {
    console.error('Database error:', error)
  }
}

/**
 * Initialize Supabase connection
 * @param {string} url - Supabase URL
 * @param {string} key - Supabase anon key
 */
export function initializeSupabase(url, key) {
  supabase = createClient(url, key)
  console.log('Supabase client initialized for SCADA data storage')
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down SCADA server...')
  
  if (mockDataInterval) {
    clearInterval(mockDataInterval)
  }
  
  wss.close(() => {
    console.log('SCADA server stopped')
    process.exit(0)
  })
})

console.log('SCADA WebSocket server ready for connections')