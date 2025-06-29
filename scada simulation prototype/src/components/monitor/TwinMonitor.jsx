import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TwinVisualization3D } from './TwinVisualization3D';
import { SensorDashboard } from './SensorDashboard';
import { AlertPanel } from './AlertPanel';
import { TwinControls } from './TwinControls';
import { DataAnalytics } from './DataAnalytics';
import { PerformanceMetrics } from './PerformanceMetrics';
import { TwinQuickStats } from './TwinQuickStats';

export const TwinMonitor = ({ digitalTwin, realTimeData, tenant }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [twinStatus, setTwinStatus] = useState('loading');

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
                      isConnected ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                  </span>
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
              <TwinVisualization3D 
                digitalTwin={digitalTwin}
                sensorData={realTimeData}
                onSensorSelect={setSelectedSensor}
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
              <TwinControls 
                digitalTwin={digitalTwin}
                realTimeData={realTimeData}
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
