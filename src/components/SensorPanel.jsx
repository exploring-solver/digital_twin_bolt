import React from 'react'
import { useDigitalTwinStore } from '../store/digitalTwinStore'

/**
 * SCADA sensor monitoring panel
 * Displays real-time sensor data and device status
 */
function SensorPanel() {
  const { sensors, getSensorStatus, selectDevice, selectedDevice } = useDigitalTwinStore()

  const sensorTypes = ['temperature', 'pressure', 'flow']
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Sensor Monitoring</h2>
      
      {sensorTypes.map(type => (
        <div key={type} className="scada-panel rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3 capitalize">{type} Sensors</h3>
          
          <div className="space-y-2">
            {Object.entries(sensors)
              .filter(([_, sensor]) => sensor.type === type)
              .map(([sensorId, sensor]) => (
                <SensorCard 
                  key={sensorId}
                  sensorId={sensorId}
                  sensor={sensor}
                  status={getSensorStatus(sensorId)}
                  isSelected={selectedDevice === sensor.deviceId}
                  onSelect={() => selectDevice(sensor.deviceId)}
                />
              ))}
          </div>
        </div>
      ))}
      
      {/* System Overview */}
      <div className="scada-panel rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3">System Overview</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-400">Active Sensors</div>
            <div className="text-xl font-bold text-green-400">
              {Object.keys(sensors).length}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Alerts</div>
            <div className="text-xl font-bold text-yellow-400">
              {Object.values(sensors).filter(s => 
                getSensorStatus(Object.keys(sensors).find(id => sensors[id] === s)) === 'warning'
              ).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Individual sensor card component
 */
function SensorCard({ sensorId, sensor, status, isSelected, onSelect }) {
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'text-red-400 bg-red-900/20'
      case 'warning': return 'text-yellow-400 bg-yellow-900/20'
      case 'normal': return 'text-green-400 bg-green-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  const getUnit = () => {
    switch (sensor.type) {
      case 'temperature': return '°C'
      case 'pressure': return 'PSI'
      case 'flow': return 'L/min'
      default: return ''
    }
  }

  return (
    <div 
      className={`sensor-card p-3 rounded cursor-pointer border ${
        isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600 hover:border-slate-500'
      } ${getStatusColor()}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium text-sm">{sensorId}</div>
          <div className="text-xs text-slate-400">{sensor.deviceId}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">
            {sensor.value?.toFixed(1)} {getUnit()}
          </div>
          <div className={`text-xs capitalize ${status === 'normal' ? 'status-normal' : status === 'warning' ? 'status-warning' : 'status-critical'}`}>
            {status}
          </div>
        </div>
      </div>
      
      {sensor.timestamp && (
        <div className="text-xs text-slate-500 mt-1">
          Last update: {new Date(sensor.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

export default SensorPanel