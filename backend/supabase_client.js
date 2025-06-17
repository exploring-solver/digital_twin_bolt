import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client for SCADA Digital Twin data storage
 * Handles sensor data persistence, device management, and real-time subscriptions
 */

let supabaseClient = null

/**
 * Initialize Supabase client with environment variables
 * Call this when Supabase is configured in the project
 */
export function initializeSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found. Database features will be disabled.')
    return null
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseKey)
  console.log('Supabase client initialized for Digital Twin platform')
  
  return supabaseClient
}

/**
 * Get the current Supabase client instance
 */
export function getSupabaseClient() {
  return supabaseClient
}

/**
 * Store sensor data in the database
 * @param {Object} sensorData - Sensor reading data
 */
export async function storeSensorData(sensorData) {
  if (!supabaseClient) {
    console.warn('Supabase not initialized. Cannot store sensor data.')
    return { error: 'Database not available' }
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('sensors')
      .insert({
        sensor_id: sensorData.sensorId,
        device_id: sensorData.deviceId,
        type: sensorData.sensorType,
        value: sensorData.value,
        unit: sensorData.unit || null,
        quality: sensorData.quality || 'good',
        timestamp: new Date(sensorData.timestamp).toISOString()
      })
    
    if (error) {
      console.error('Error storing sensor data:', error)
      return { error }
    }
    
    return { data }
  } catch (error) {
    console.error('Database error:', error)
    return { error }
  }
}

/**
 * Store device status information
 * @param {Object} deviceStatus - Device status data
 */
export async function storeDeviceStatus(deviceStatus) {
  if (!supabaseClient) {
    console.warn('Supabase not initialized. Cannot store device status.')
    return { error: 'Database not available' }
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('devices')
      .upsert({
        device_id: deviceStatus.deviceId,
        name: deviceStatus.name || deviceStatus.deviceId,
        type: deviceStatus.type || 'unknown',
        status: deviceStatus.status,
        last_update: new Date().toISOString(),
        metadata: deviceStatus.details || {}
      })
    
    if (error) {
      console.error('Error storing device status:', error)
      return { error }
    }
    
    return { data }
  } catch (error) {
    console.error('Database error:', error)
    return { error }
  }
}

/**
 * Retrieve recent sensor data for a specific sensor
 * @param {string} sensorId - Sensor identifier
 * @param {number} limit - Number of records to retrieve
 */
export async function getSensorHistory(sensorId, limit = 100) {
  if (!supabaseClient) {
    return { error: 'Database not available' }
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('sensors')
      .select('*')
      .eq('sensor_id', sensorId)
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error retrieving sensor history:', error)
      return { error }
    }
    
    return { data }
  } catch (error) {
    console.error('Database error:', error)
    return { error }
  }
}

/**
 * Retrieve all devices and their current status
 */
export async function getDevices() {
  if (!supabaseClient) {
    return { error: 'Database not available' }
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('devices')
      .select('*')
      .order('device_id')
    
    if (error) {
      console.error('Error retrieving devices:', error)
      return { error }
    }
    
    return { data }
  } catch (error) {
    console.error('Database error:', error)
    return { error }
  }
}

/**
 * Subscribe to real-time sensor data updates
 * @param {Function} callback - Function to call when data updates
 */
export function subscribeToSensorUpdates(callback) {
  if (!supabaseClient) {
    console.warn('Supabase not initialized. Cannot subscribe to updates.')
    return null
  }
  
  const subscription = supabaseClient
    .channel('sensor_updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sensors'
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()
  
  console.log('Subscribed to real-time sensor updates')
  return subscription
}

/**
 * Subscribe to device status changes
 * @param {Function} callback - Function to call when device status changes
 */
export function subscribeToDeviceUpdates(callback) {
  if (!supabaseClient) {
    console.warn('Supabase not initialized. Cannot subscribe to updates.')
    return null
  }
  
  const subscription = supabaseClient
    .channel('device_updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'devices'
      },
      (payload) => {
        callback(payload.new || payload.old)
      }
    )
    .subscribe()
  
  console.log('Subscribed to real-time device updates')
  return subscription
}

/**
 * Store alarm/alert information
 * @param {Object} alarmData - Alarm data
 */
export async function storeAlarm(alarmData) {
  if (!supabaseClient) {
    return { error: 'Database not available' }
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('alarms')
      .insert({
        alarm_id: alarmData.alarmId || `alarm_${Date.now()}`,
        device_id: alarmData.deviceId,
        sensor_id: alarmData.sensorId,
        severity: alarmData.severity || 'warning',
        message: alarmData.message,
        value: alarmData.value,
        threshold: alarmData.threshold,
        acknowledged: false,
        timestamp: new Date(alarmData.timestamp || Date.now()).toISOString()
      })
    
    if (error) {
      console.error('Error storing alarm:', error)
      return { error }
    }
    
    return { data }
  } catch (error) {
    console.error('Database error:', error)
    return { error }
  }
}

/**
 * Get active alarms
 */
export async function getActiveAlarms() {
  if (!supabaseClient) {
    return { error: 'Database not available' }
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('alarms')
      .select('*')
      .eq('acknowledged', false)
      .order('timestamp', { ascending: false })
    
    if (error) {
      console.error('Error retrieving alarms:', error)
      return { error }
    }
    
    return { data }
  } catch (error) {
    console.error('Database error:', error)
    return { error }
  }
}

/**
 * Acknowledge an alarm
 * @param {string} alarmId - Alarm identifier
 * @param {string} acknowledgedBy - User who acknowledged the alarm
 */
export async function acknowledgeAlarm(alarmId, acknowledgedBy) {
  if (!supabaseClient) {
    return { error: 'Database not available' }
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('alarms')
      .update({
        acknowledged: true,
        acknowledged_by: acknowledgedBy,
        acknowledged_at: new Date().toISOString()
      })
      .eq('alarm_id', alarmId)
    
    if (error) {
      console.error('Error acknowledging alarm:', error)
      return { error }
    }
    
    return { data }
  } catch (error) {
    console.error('Database error:', error)
    return { error }
  }
}

// Initialize Supabase on module load if credentials are available
initializeSupabase()