import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Enhanced3DTwin } from './Enhanced3DTwin';
import { EnhancedTwinControls } from './EnhancedTwinControls';
import { SensorDashboard } from './SensorDashboard';
import { AlertPanel } from './AlertPanel';
import { DataAnalytics } from './DataAnalytics';
import { PerformanceMetrics } from './PerformanceMetrics';
import { TwinQuickStats } from './TwinQuickStats';

export const TwinMonitor = ({ digitalTwin, realTimeData, tenant }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [twinStatus, setTwinStatus] = useState('loading');
  const [controlMode, setControlMode] = useState('monitor');

  useEffect(() => {
    if (realTimeData) {
      setIsConnected(true);
      setTwinStatus('active');
      
      // Extract alerts from real-time data
      if (realTimeData.alerts) {
        setAlerts(prev => [...prev, ...realTimeData.alerts].slice(-50));
      }
    } else {
      setIsConnected(false);
      setTwinStatus('disconnected');
    }
  }, [realTimeData]);

  const views = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: '3d', name: '3D View', icon: '🏗️' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'controls', name: 'Controls', icon: '⚙️' }
  ];

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleAlertDismiss = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getStatusColor = () => {
    switch (twinStatus) {
      case 'active': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'disconnected': return 'text-gray-400';
      default: return 'text-blue-400';
    }
  };

  // ===== Enhanced 3D Twin Event Handlers =====
  
  const handleSensorPositionUpdate = async (sensorId, newPosition) => {
    try {
      const response = await fetch(`http://localhost:3001/api/sensors/${sensorId}/position`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ position: newPosition })
      });

      if (!response.ok) {
        throw new Error('Failed to update sensor position');
      }

      console.log(`Sensor ${sensorId} position updated to:`, newPosition);
    } catch (error) {
      console.error('Failed to update sensor position:', error);
    }
  };

  const handleSensorAdd = async (newSensor) => {
    try {
      const response = await fetch(`http://localhost:3001/api/twins/${digitalTwin.id}/sensors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newSensor)
      });

      if (!response.ok) {
        throw new Error('Failed to add sensor');
      }

      const addedSensor = await response.json();
      console.log('Sensor added successfully:', addedSensor);
      
      // Update local twin data
      digitalTwin.sensors = [...(digitalTwin.sensors || []), addedSensor];
    } catch (error) {
      console.error('Failed to add sensor:', error);
    }
  };

  const handleModelPositionUpdate = async (newPosition) => {
    try {
      const response = await fetch(`http://localhost:3001/api/twins/${digitalTwin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          config: {
            ...digitalTwin.config,
            position: newPosition
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update model position');
      }

      console.log('Model position updated to:', newPosition);
    } catch (error) {
      console.error('Failed to update model position:', error);
    }
  };

  const handleTwinSave = async (updatedTwin) => {
    try {
      const response = await fetch(`http://localhost:3001/api/twins/${digitalTwin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedTwin)
      });

      if (!response.ok) {
        throw new Error('Failed to save twin configuration');
      }

      console.log('Twin configuration saved successfully');
      return await response.json();
    } catch (error) {
      console.error('Failed to save twin configuration:', error);
      throw error;
    }
  };

  // ===== Enhanced Controls Event Handlers =====

  const handleParameterChange = async (parameterId, value) => {
    try {
      const response = await fetch(`http://localhost:3001/api/twins/${digitalTwin.id}/parameters`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          [parameterId]: value
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update parameter');
      }

      console.log(`Parameter ${parameterId} updated to:`, value);
    } catch (error) {
      console.error('Failed to update parameter:', error);
    }
  };

  const handleOperationExecute = async (operationId, action, parameters) => {
    try {
      const response = await fetch(`http://localhost:3001/api/twins/${digitalTwin.id}/operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          operation: operationId,
          action: action,
          parameters: parameters
        })
      });

      if (!response.ok) {
        throw new Error('Failed to execute operation');
      }

      const result = await response.json();
      console.log(`Operation ${operationId} executed successfully:`, result);
      return result;
    } catch (error) {
      console.error('Failed to execute operation:', error);
      throw error;
    }
  };

  const handleControlModeChange = (newMode) => {
    setControlMode(newMode);
    console.log(`Control mode changed to: ${newMode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                {digitalTwin.type === 'crane' && '🏗️'}
                {digitalTwin.type === 'building' && '🏢'}
                {digitalTwin.type === 'factory' && '🏭'}
                {digitalTwin.type === 'vehicle' && '🚛'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {digitalTwin.name}
                </h1>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-400">
                    Type: {digitalTwin.type.charAt(0).toUpperCase() + digitalTwin.type.slice(1)}
                  </span>
                  <span className={`flex items-center space-x-1 ${getStatusColor()}`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-400' : 'bg-green-400'
                    }`} />
                    <span>{isConnected ? 'Connected' : 'Connected'}</span>
                  </span>
                  {controlMode !== 'monitor' && (
                    <span className="text-yellow-400 flex items-center space-x-1">
                      <span>🎮</span>
                      <span>{controlMode.charAt(0).toUpperCase() + controlMode.slice(1)} Mode</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* View Selector */}
            <div className="flex space-x-2">
              {views.map(view => (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  className={`
                    px-4 py-2 rounded-lg flex items-center space-x-2 transition-all
                    ${currentView === view.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                >
                  <span>{view.icon}</span>
                  <span>{view.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Performance Overview */}
                  <div className="lg:col-span-2">
                    <PerformanceMetrics 
                      digitalTwin={digitalTwin}
                      realTimeData={realTimeData}
                    />
                  </div>
                  
                  {/* Quick Stats */}
                  <div>
                    <TwinQuickStats 
                      digitalTwin={digitalTwin}
                      realTimeData={realTimeData}
                    />
                  </div>
                </div>

                {/* Sensor Dashboard */}
                <div className="mt-6">
                  <SensorDashboard 
                    digitalTwin={digitalTwin}
                    sensorData={realTimeData}
                    onSensorSelect={setSelectedSensor}
                    selectedSensor={selectedSensor}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentView === '3d' && (
            <motion.div
              key="3d-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="h-screen pt-6"
            >
              {/* 🎯 ENHANCED 3D TWIN INTEGRATION */}
              <Enhanced3DTwin 
                digitalTwin={digitalTwin}
                sensorData={realTimeData}
                onSensorSelect={setSelectedSensor}
                onSensorPositionUpdate={handleSensorPositionUpdate}
                onSensorAdd={handleSensorAdd}
                onModelPositionUpdate={handleModelPositionUpdate}
                onSave={handleTwinSave}
              />
            </motion.div>
          )}

          {currentView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DataAnalytics 
                digitalTwin={digitalTwin}
                realTimeData={realTimeData}
              />
            </motion.div>
          )}

          {currentView === 'controls' && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 🎯 ENHANCED CONTROLS INTEGRATION */}
              <EnhancedTwinControls 
                digitalTwin={digitalTwin}
                realTimeData={realTimeData}
                onParameterChange={handleParameterChange}
                onOperationExecute={handleOperationExecute}
                onControlModeChange={handleControlModeChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alert Panel */}
        <AlertPanel 
          alerts={alerts}
          onDismiss={handleAlertDismiss}
        />
      </div>
    </div>
  );
};