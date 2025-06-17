import { create } from 'zustand'

/**
 * Central state management for the Digital Twin platform
 * Manages sensor data, device states, and real-time synchronization
 */
export const useDigitalTwinStore = create((set, get) => ({
  // Connection state
  isConnected: false,
  connectionStatus: 'Disconnected',
  
  // Sensor data
  sensors: {},
  devices: {},
  
  // 3D Scene state
  sceneObjects: {},
  selectedDevice: null,
  
  // Actions
  setConnectionStatus: (status, connected = false) => set({ 
    connectionStatus: status, 
    isConnected: connected 
  }),
  
  updateSensorData: (sensorId, data) => set((state) => ({
    sensors: {
      ...state.sensors,
      [sensorId]: {
        ...state.sensors[sensorId],
        ...data,
        timestamp: Date.now()
      }
    }
  })),
  
  updateDeviceState: (deviceId, state) => set((prevState) => ({
    devices: {
      ...prevState.devices,
      [deviceId]: {
        ...prevState.devices[deviceId],
        ...state,
        lastUpdate: Date.now()
      }
    }
  })),
  
  updateSceneObject: (objectId, properties) => set((state) => ({
    sceneObjects: {
      ...state.sceneObjects,
      [objectId]: {
        ...state.sceneObjects[objectId],
        ...properties
      }
    }
  })),
  
  selectDevice: (deviceId) => set({ selectedDevice: deviceId }),
  
  // Get sensor status based on thresholds
  getSensorStatus: (sensorId) => {
    const sensor = get().sensors[sensorId]
    if (!sensor) return 'unknown'
    
    const { value, type } = sensor
    
    // Define thresholds based on sensor type
    const thresholds = {
      temperature: { warning: 75, critical: 90 },
      pressure: { warning: 80, critical: 95 },
      flow: { warning: 20, critical: 10 }
    }
    
    const threshold = thresholds[type]
    if (!threshold) return 'normal'
    
    if (value >= threshold.critical) return 'critical'
    if (value >= threshold.warning) return 'warning'
    return 'normal'
  }
}))