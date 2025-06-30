// ===== Enhanced Twin Controls with Real Operations =====

// components/monitor/EnhancedTwinControls.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const EnhancedTwinControls = ({ 
  digitalTwin, 
  realTimeData, 
  onParameterChange,
  onOperationExecute,
  onControlModeChange 
}) => {
  const [controlMode, setControlMode] = useState('monitor');
  const [operationParams, setOperationParams] = useState({});
  const [activeOperations, setActiveOperations] = useState(new Set());
  const [commandHistory, setCommandHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [lastCommandTime, setLastCommandTime] = useState(null);

  // Initialize parameters from twin config
  useEffect(() => {
    const initialParams = {};
    const controls = getControlsForTwinType();
    
    controls.parameters.forEach(param => {
      initialParams[param.id] = param.value;
    });
    
    setOperationParams(initialParams);
  }, [digitalTwin.type]);

  // Simulate connection status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(Math.random() > 0.05 ? 'connected' : 'disconnected');
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getControlsForTwinType = () => {
    switch (digitalTwin.type) {
      case 'crane':
        return {
          operations: [
            { 
              id: 'hoist_up', 
              name: 'Hoist Up', 
              icon: '⬆️', 
              action: 'movement',
              toggleable: true,
              description: 'Raise the hook and load'
            },
            { 
              id: 'hoist_down', 
              name: 'Hoist Down', 
              icon: '⬇️', 
              action: 'movement',
              toggleable: true,
              description: 'Lower the hook and load'
            },
            { 
              id: 'slew_left', 
              name: 'Slew Left', 
              icon: '↺', 
              action: 'rotation',
              toggleable: true,
              description: 'Rotate crane counter-clockwise'
            },
            { 
              id: 'slew_right', 
              name: 'Slew Right', 
              icon: '↻', 
              action: 'rotation',
              toggleable: true,
              description: 'Rotate crane clockwise'
            },
            { 
              id: 'emergency_stop', 
              name: 'Emergency Stop', 
              icon: '🛑', 
              action: 'safety',
              toggleable: false,
              description: 'Immediate stop all operations'
            },
            {
              id: 'auto_level',
              name: 'Auto Level',
              icon: '📐',
              action: 'automation',
              toggleable: true,
              description: 'Automatic load leveling'
            }
          ],
          parameters: [
            { 
              id: 'load_limit', 
              name: 'Load Limit', 
              value: 8000, 
              unit: 'kg', 
              min: 0, 
              max: 10000,
              step: 100,
              description: 'Maximum safe lifting capacity'
            },
            { 
              id: 'wind_limit', 
              name: 'Wind Speed Limit', 
              value: 25, 
              unit: 'm/s', 
              min: 0, 
              max: 50,
              step: 1,
              description: 'Maximum safe wind speed for operation'
            },
            { 
              id: 'speed_limit', 
              name: 'Speed Limit', 
              value: 80, 
              unit: '%', 
              min: 0, 
              max: 100,
              step: 5,
              description: 'Maximum operational speed percentage'
            },
            {
              id: 'precision_mode',
              name: 'Precision Mode',
              value: 50,
              unit: '%',
              min: 10,
              max: 100,
              step: 10,
              description: 'Movement precision sensitivity'
            }
          ]
        };

      case 'building':
        return {
          operations: [
            { 
              id: 'hvac_on', 
              name: 'HVAC System', 
              icon: '❄️', 
              action: 'climate',
              toggleable: true,
              description: 'Climate control system'
            },
            { 
              id: 'lights_on', 
              name: 'Lighting', 
              icon: '💡', 
              action: 'lighting',
              toggleable: true,
              description: 'Building lighting system'
            },
            { 
              id: 'security_arm', 
              name: 'Security System', 
              icon: '🔒', 
              action: 'security',
              toggleable: true,
              description: 'Building security and access control'
            },
            {
              id: 'elevator_service',
              name: 'Elevator Service',
              icon: '🛗',
              action: 'transport',
              toggleable: true,
              description: 'Elevator system control'
            },
            {
              id: 'fire_system',
              name: 'Fire Safety',
              icon: '🚨',
              action: 'safety',
              toggleable: false,
              description: 'Fire detection and suppression'
            }
          ],
          parameters: [
            { 
              id: 'target_temp', 
              name: 'Target Temperature', 
              value: 22, 
              unit: '°C', 
              min: 16, 
              max: 30,
              step: 0.5,
              description: 'Desired indoor temperature'
            },
            { 
              id: 'humidity_target', 
              name: 'Humidity Target', 
              value: 45, 
              unit: '%', 
              min: 30, 
              max: 70,
              step: 5,
              description: 'Target relative humidity'
            },
            { 
              id: 'occupancy_limit', 
              name: 'Occupancy Limit', 
              value: 100, 
              unit: 'people', 
              min: 0, 
              max: 200,
              step: 10,
              description: 'Maximum building occupancy'
            },
            {
              id: 'energy_efficiency',
              name: 'Energy Efficiency',
              value: 85,
              unit: '%',
              min: 50,
              max: 100,
              step: 5,
              description: 'Energy conservation level'
            }
          ]
        };

      case 'factory':
        return {
          operations: [
            { 
              id: 'production_line', 
              name: 'Production Line', 
              icon: '▶️', 
              action: 'production',
              toggleable: true,
              description: 'Main production line control'
            },
            { 
              id: 'quality_check', 
              name: 'Quality Control', 
              icon: '🔍', 
              action: 'quality',
              toggleable: true,
              description: 'Automated quality inspection'
            },
            { 
              id: 'maintenance_mode', 
              name: 'Maintenance Mode', 
              icon: '🔧', 
              action: 'maintenance',
              toggleable: true,
              description: 'Switch to maintenance operations'
            },
            {
              id: 'conveyor_system',
              name: 'Conveyor System',
              icon: '🔄',
              action: 'transport',
              toggleable: true,
              description: 'Material transport system'
            },
            { 
              id: 'emergency_shutdown', 
              name: 'Emergency Shutdown', 
              icon: '🚨', 
              action: 'safety',
              toggleable: false,
              description: 'Complete system emergency stop'
            }
          ],
          parameters: [
            { 
              id: 'production_rate', 
              name: 'Production Rate', 
              value: 85, 
              unit: 'units/hr', 
              min: 0, 
              max: 150,
              step: 5,
              description: 'Target production output rate'
            },
            { 
              id: 'quality_threshold', 
              name: 'Quality Threshold', 
              value: 95, 
              unit: '%', 
              min: 80, 
              max: 100,
              step: 1,
              description: 'Minimum acceptable quality level'
            },
            { 
              id: 'safety_level', 
              name: 'Safety Level', 
              value: 100, 
              unit: '%', 
              min: 90, 
              max: 100,
              step: 1,
              description: 'Safety system sensitivity'
            },
            {
              id: 'efficiency_target',
              name: 'Efficiency Target',
              value: 88,
              unit: '%',
              min: 60,
              max: 100,
              step: 2,
              description: 'Overall equipment effectiveness target'
            }
          ]
        };

      default:
        return { operations: [], parameters: [] };
    }
  };

  const controls = getControlsForTwinType();

  const handleOperation = async (operation) => {
    if (controlMode === 'monitor') return;

    try {
      const commandId = `cmd_${Date.now()}`;
      const timestamp = new Date().toISOString();

      if (operation.toggleable) {
        const isActive = activeOperations.has(operation.id);
        
        if (isActive) {
          setActiveOperations(prev => {
            const newSet = new Set(prev);
            newSet.delete(operation.id);
            return newSet;
          });
        } else {
          setActiveOperations(prev => new Set(prev).add(operation.id));
        }

        const command = {
          id: commandId,
          operation: operation.id,
          action: isActive ? 'stop' : 'start',
          parameters: operationParams,
          timestamp,
          status: 'pending',
          user: 'Current User'
        };

        // Add to command history
        setCommandHistory(prev => [command, ...prev.slice(0, 19)]);
        setLastCommandTime(timestamp);

        // Simulate API call
        const response = await fetch(`http://localhost:3001/api/twins/${digitalTwin.id}/operations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            operation: operation.id,
            action: isActive ? 'stop' : 'start',
            parameters: operationParams
          })
        });

        if (response.ok) {
          // Update command status to success
          setCommandHistory(prev => 
            prev.map(cmd => 
              cmd.id === commandId 
                ? { ...cmd, status: 'success' }
                : cmd
            )
          );

          if (onOperationExecute) {
            onOperationExecute(operation.id, isActive ? 'stop' : 'start', operationParams);
          }
        } else {
          throw new Error('Operation failed');
        }
      } else {
        // Non-toggleable operations (like emergency stop)
        const command = {
          id: commandId,
          operation: operation.id,
          action: 'execute',
          parameters: operationParams,
          timestamp,
          status: 'pending',
          user: 'Current User'
        };

        setCommandHistory(prev => [command, ...prev.slice(0, 19)]);
        setLastCommandTime(timestamp);

        // Emergency operations clear all active operations
        if (operation.action === 'safety') {
          setActiveOperations(new Set());
        }

        const response = await fetch(`http://localhost:3001/api/twins/${digitalTwin.id}/operations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            operation: operation.id,
            action: 'execute',
            parameters: operationParams
          })
        });

        if (response.ok) {
          setCommandHistory(prev => 
            prev.map(cmd => 
              cmd.id === commandId 
                ? { ...cmd, status: 'success' }
                : cmd
            )
          );

          if (onOperationExecute) {
            onOperationExecute(operation.id, 'execute', operationParams);
          }
        } else {
          throw new Error('Operation failed');
        }
      }
    } catch (error) {
      console.error('Failed to execute operation:', error);
      
      // Update command status to failed
      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.timestamp === new Date().toISOString() 
            ? { ...cmd, status: 'failed' }
            : cmd
        )
      );
    }
  };

  const handleParameterChange = (parameterId, value) => {
    setOperationParams(prev => ({
      ...prev,
      [parameterId]: value
    }));

    // Debounced parameter update to backend
    clearTimeout(window.parameterUpdateTimeout);
    window.parameterUpdateTimeout = setTimeout(async () => {
      try {
        await fetch(`http://localhost:3001/api/twins/${digitalTwin.id}/parameters`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            [parameterId]: value
          })
        });

        if (onParameterChange) {
          onParameterChange(parameterId, value);
        }
      } catch (error) {
        console.error('Failed to update parameter:', error);
      }
    }, 500);
  };

  const handleModeChange = (newMode) => {
    setControlMode(newMode);
    if (newMode === 'monitor') {
      // Stop all active operations when switching to monitor mode
      setActiveOperations(new Set());
    }
    if (onControlModeChange) {
      onControlModeChange(newMode);
    }
  };

  const getOperationButtonStyle = (operation) => {
    const isActive = activeOperations.has(operation.id);
    const baseStyle = "p-4 rounded-lg border transition-all hover:scale-105 cursor-pointer relative";
    
    if (controlMode === 'monitor') {
      return `${baseStyle} opacity-50 cursor-not-allowed border-gray-600 bg-gray-700/30 text-gray-400`;
    }

    if (operation.action === 'safety') {
      return `${baseStyle} border-red-500 ${isActive ? 'bg-red-500/30' : 'bg-red-500/10'} text-red-400 hover:bg-red-500/20`;
    }
    
    if (operation.action === 'movement' || operation.action === 'production' || operation.action === 'transport') {
      return `${baseStyle} border-blue-500 ${isActive ? 'bg-blue-500/30' : 'bg-blue-500/10'} text-blue-400 hover:bg-blue-500/20`;
    }
    
    return `${baseStyle} border-green-500 ${isActive ? 'bg-green-500/30' : 'bg-green-500/10'} text-green-400 hover:bg-green-500/20`;
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
              onClick={() => handleModeChange(mode.id)}
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
                    className={getOperationButtonStyle(operation)}
                    title={operation.description}
                  >
                    <div className="text-3xl mb-2">{operation.icon}</div>
                    <div className="font-medium">{operation.name}</div>
                    
                    {/* Active indicator */}
                    {activeOperations.has(operation.id) && operation.toggleable && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    )}
                    
                    {/* Toggle indicator */}
                    {operation.toggleable && controlMode !== 'monitor' && (
                      <div className="text-xs mt-1 opacity-75">
                        {activeOperations.has(operation.id) ? 'Click to Stop' : 'Click to Start'}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
            
            {/* Active Operations Summary */}
            {activeOperations.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
              >
                <h4 className="font-medium text-blue-400 mb-2">Active Operations</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(activeOperations).map(opId => {
                    const operation = controls.operations.find(op => op.id === opId);
                    return (
                      <span key={opId} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                        {operation?.icon} {operation?.name}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Parameters Panel */}
        <div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Parameters</h3>
            
            <div className="space-y-6">
              {controls.parameters.map((param, index) => (
                <motion.div
                  key={param.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-300">
                      {param.name}
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">
                        {operationParams[param.id] || param.value} {param.unit}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        controlMode === 'monitor' ? 'bg-gray-500' : 'bg-blue-400'
                      }`} />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={param.step || 1}
                      value={operationParams[param.id] || param.value}
                      disabled={controlMode === 'monitor'}
                      onChange={(e) => handleParameterChange(param.id, Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 slider"
                      style={{
                        background: controlMode === 'monitor' 
                          ? '#374151' 
                          : `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((operationParams[param.id] || param.value) - param.min) / (param.max - param.min) * 100}%, #374151 ${((operationParams[param.id] || param.value) - param.min) / (param.max - param.min) * 100}%, #374151 100%)`
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{param.min} {param.unit}</span>
                    <span>{param.max} {param.unit}</span>
                  </div>
                  
                  <p className="text-xs text-gray-400">{param.description}</p>
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
                <span className={`flex items-center space-x-1 ${
                  connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <span className="capitalize">{connectionStatus}</span>
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Mode:</span>
                <span className="text-blue-400 capitalize">{controlMode}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Active Operations:</span>
                <span className="text-white">{activeOperations.size}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Last Command:</span>
                <span className="text-gray-300">
                  {lastCommandTime 
                    ? new Date(lastCommandTime).toLocaleTimeString() 
                    : '--:--'
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Response Time:</span>
                <span className="text-gray-300">
                  {connectionStatus === 'connected' ? '45ms' : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Command History */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Command History</h3>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {commandHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <div>No commands executed yet</div>
            </div>
          ) : (
            commandHistory.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400 font-mono">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-sm text-white">
                    {entry.operation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-xs text-gray-500">
                    {entry.action} • by {entry.user}
                  </span>
                </div>
                <div className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${entry.status === 'success' 
                    ? 'bg-green-500/20 text-green-400'
                    : entry.status === 'failed'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                  }
                `}>
                  {entry.status}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};