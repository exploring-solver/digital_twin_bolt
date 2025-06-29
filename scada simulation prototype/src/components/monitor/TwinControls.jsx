import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const TwinControls = ({ digitalTwin, realTimeData }) => {
  const [controlMode, setControlMode] = useState('monitor'); // monitor, operate, configure
  const [operationParams, setOperationParams] = useState({
    power: 100,
    speed: 50,
    sensitivity: 75
  });

  const getControlsForTwinType = () => {
    switch (digitalTwin.type) {
      case 'crane':
        return {
          operations: [
            { id: 'hoist_up', name: 'Hoist Up', icon: '⬆️', action: 'movement' },
            { id: 'hoist_down', name: 'Hoist Down', icon: '⬇️', action: 'movement' },
            { id: 'slew_left', name: 'Slew Left', icon: '↺', action: 'rotation' },
            { id: 'slew_right', name: 'Slew Right', icon: '↻', action: 'rotation' },
            { id: 'emergency_stop', name: 'Emergency Stop', icon: '🛑', action: 'safety' }
          ],
          parameters: [
            { id: 'load_limit', name: 'Load Limit', value: 8000, unit: 'kg', min: 0, max: 10000 },
            { id: 'wind_limit', name: 'Wind Limit', value: 25, unit: 'm/s', min: 0, max: 50 },
            { id: 'speed_limit', name: 'Speed Limit', value: 80, unit: '%', min: 0, max: 100 }
          ]
        };

      case 'building':
        return {
          operations: [
            { id: 'hvac_on', name: 'HVAC On', icon: '❄️', action: 'climate' },
            { id: 'hvac_off', name: 'HVAC Off', icon: '🔥', action: 'climate' },
            { id: 'lights_on', name: 'Lights On', icon: '💡', action: 'lighting' },
            { id: 'lights_off', name: 'Lights Off', icon: '🔅', action: 'lighting' },
            { id: 'security_arm', name: 'Arm Security', icon: '🔒', action: 'security' }
          ],
          parameters: [
            { id: 'target_temp', name: 'Target Temperature', value: 22, unit: '°C', min: 16, max: 30 },
            { id: 'humidity_target', name: 'Humidity Target', value: 45, unit: '%', min: 30, max: 70 },
            { id: 'occupancy_limit', name: 'Occupancy Limit', value: 100, unit: 'people', min: 0, max: 200 }
          ]
        };

      case 'factory':
        return {
          operations: [
            { id: 'start_production', name: 'Start Production', icon: '▶️', action: 'production' },
            { id: 'stop_production', name: 'Stop Production', icon: '⏹️', action: 'production' },
            { id: 'quality_check', name: 'Quality Check', icon: '🔍', action: 'quality' },
            { id: 'maintenance_mode', name: 'Maintenance Mode', icon: '🔧', action: 'maintenance' },
            { id: 'emergency_shutdown', name: 'Emergency Shutdown', icon: '🚨', action: 'safety' }
          ],
          parameters: [
            { id: 'production_rate', name: 'Production Rate', value: 85, unit: 'units/hr', min: 0, max: 150 },
            { id: 'quality_threshold', name: 'Quality Threshold', value: 95, unit: '%', min: 80, max: 100 },
            { id: 'safety_level', name: 'Safety Level', value: 100, unit: '%', min: 90, max: 100 }
          ]
        };

      default:
        return {
          operations: [],
          parameters: []
        };
    }
  };

  const controls = getControlsForTwinType();

  const handleOperation = async (operation) => {
    console.log(`Executing operation: ${operation.name}`);
    
    // In a real implementation, this would send commands to the actual twin
    try {
      const response = await fetch(`/api/twins/${digitalTwin.id}/operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: operation.id,
          parameters: operationParams
        })
      });
      
      if (response.ok) {
        console.log(`Operation ${operation.name} executed successfully`);
      }
    } catch (error) {
      console.error('Failed to execute operation:', error);
    }
  };

  const handleParameterChange = (parameterId, value) => {
    setOperationParams(prev => ({
      ...prev,
      [parameterId]: value
    }));
  };

  const modes = [
    { id: 'monitor', name: 'Monitor Only', icon: '👁️', description: 'View-only mode' },
    { id: 'operate', name: 'Operate', icon: '🎮', description: 'Send commands to twin' },
    { id: 'configure', name: 'Configure', icon: '⚙️', description: 'Modify twin settings' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Twin Controls</h2>
          <p className="text-gray-400">
            Operate and configure {digitalTwin.name}
          </p>
        </div>
        
        {/* Mode Selector */}
        <div className="flex space-x-2">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setControlMode(mode.id)}
              className={`
                px-4 py-2 rounded-lg flex items-center space-x-2 transition-all
                ${controlMode === mode.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              <span>{mode.icon}</span>
              <span>{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Safety Warning */}
      {controlMode === 'operate' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h4 className="font-semibold text-yellow-400">Operate Mode Active</h4>
              <p className="text-sm text-yellow-300">
                Commands sent in this mode will affect the physical twin. Ensure safety protocols are followed.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operations Panel */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Operations</h3>
            
            {controlMode === 'monitor' && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-4">👁️</div>
                <div className="text-lg mb-2">Monitor Mode</div>
                <div className="text-sm">
                  Switch to Operate mode to send commands to the twin
                </div>
              </div>
            )}

            {controlMode !== 'monitor' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {controls.operations.map((operation, index) => (
                  <motion.button
                    key={operation.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleOperation(operation)}
                    disabled={controlMode === 'monitor'}
                    className={`
                      p-4 rounded-lg border transition-all hover:scale-105
                      ${operation.action === 'safety'
                        ? 'border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : operation.action === 'movement' || operation.action === 'production'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                        : 'border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                      }
                      ${controlMode === 'monitor' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="text-3xl mb-2">{operation.icon}</div>
                    <div className="font-medium">{operation.name}</div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Parameters Panel */}
        <div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Parameters</h3>
            
            <div className="space-y-4">
              {controls.parameters.map((param, index) => (
                <motion.div
                  key={param.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-300">
                      {param.name}
                    </label>
                    <span className="text-sm text-gray-400">
                      {param.value} {param.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    value={param.value}
                    disabled={controlMode === 'monitor'}
                    onChange={(e) => handleParameterChange(param.id, Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{param.min} {param.unit}</span>
                    <span>{param.max} {param.unit}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Status Panel */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Control Status</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Connection:</span>
                <span className="text-green-400 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Connected</span>
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Mode:</span>
                <span className="text-blue-400 capitalize">{controlMode}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Last Command:</span>
                <span className="text-gray-300">--:--</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Response Time:</span>
                <span className="text-gray-300">45ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Command History */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Command History</h3>
        
        <div className="space-y-2">
          {[
            { time: '14:32:15', command: 'Load Limit Updated', status: 'success', user: 'Operator 1' },
            { time: '14:30:45', command: 'HVAC Temperature Set', status: 'success', user: 'System' },
            { time: '14:28:12', command: 'Emergency Stop Test', status: 'success', user: 'Safety Team' },
            { time: '14:25:33', command: 'Production Rate Adjusted', status: 'failed', user: 'Operator 2' },
            { time: '14:22:08', command: 'System Health Check', status: 'success', user: 'System' }
          ].map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400 font-mono">{entry.time}</span>
                <span className="text-sm text-white">{entry.command}</span>
                <span className="text-xs text-gray-500">by {entry.user}</span>
              </div>
              <div className={`
                px-2 py-1 rounded text-xs font-medium
                ${entry.status === 'success' 
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
                }
              `}>
                {entry.status}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};