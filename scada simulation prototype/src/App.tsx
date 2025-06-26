import React, { useState, useEffect } from 'react';
import { CraneVisualization } from './components/3d/CraneVisualization';
import { SensorDashboard } from './components/dashboard/SensorDashboard';
import { AlertPanel } from './components/alerts/AlertPanel';
import { NavigationBar } from './components/navigation/NavigationBar';
import { WebSocketService } from './services/WebSocketService';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sensorData, setSensorData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [webSocketService] = useState(() => new WebSocketService());

  useEffect(() => {
    const handleSensorData = (data) => {
      console.log('Received sensor_data from WebSocket:', data);
      setSensorData(data);
    };
  
    const handleAlerts = (newAlerts) => {
      setAlerts((prev) => [...prev, ...newAlerts].slice(-50));
    };
  
    const handleConnected = () => {
      setIsConnected(true);
      console.log('[WebSocket] Connected, subscribing to sensors...');
      webSocketService.subscribeTo([
        'control', 'environmental', 'lifting',
        'motor', 'movement', 'power',
        'safety', 'structural',
      ]);
    };
  
    const handleDisconnected = () => {
      setIsConnected(false);
    };
  
    webSocketService.connect();
    webSocketService.on('sensor_data', handleSensorData);
    webSocketService.on('alerts', handleAlerts);
    webSocketService.on('connected', handleConnected);
    webSocketService.on('disconnected', handleDisconnected);
  
    return () => {
      webSocketService.off('sensor_data', handleSensorData);
      webSocketService.off('alerts', handleAlerts);
      webSocketService.off('connected', handleConnected);
      webSocketService.off('disconnected', handleDisconnected);
      webSocketService.disconnect();
    };
  }, [webSocketService]);

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleAlertDismiss = (index) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <NavigationBar 
        currentView={currentView}
        onViewChange={handleViewChange}
        isConnected={isConnected}
        alertCount={alerts.filter(alert => alert.type === 'critical' || alert.type === 'danger').length}
      />
      
      <main className="pt-16">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SensorDashboard sensorData={sensorData} />
            </motion.div>
          )}
          
          {currentView === '3d' && (
            <motion.div
              key="3d-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="h-screen"
            >
              <CraneVisualization sensorData={sensorData} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <AlertPanel 
        alerts={alerts}
        onDismiss={handleAlertDismiss}
      />
    </div>
  );
}

export default App;