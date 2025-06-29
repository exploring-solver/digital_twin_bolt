import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TwinBuilder } from './components/builder/TwinBuilder';
import { TenantOverview } from './components/overview/TenantOverview';
import { GlobalNavigation } from './components/navigation/GlobalNavigation';
import { EnhancedWebSocketService } from './services/EnhancedWebSocketService';
import { TwinMonitor } from './components/monitor/TwinMonitor';

// Context for tenant and twin management
const PlatformContext = createContext();

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within PlatformProvider');
  }
  return context;
};

const PlatformProvider = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [twins, setTwins] = useState([]);
  const [selectedTwin, setSelectedTwin] = useState(null);
  const [twinData, setTwinData] = useState({});
  const [webSocketService] = useState(() => new EnhancedWebSocketService());

  const value = {
    currentTenant, setCurrentTenant,
    twins, setTwins,
    selectedTwin, setSelectedTwin,
    twinData, setTwinData,
    webSocketService
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};

function App() {
  const [currentView, setCurrentView] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    currentTenant, setCurrentTenant,
    twins, setTwins,
    selectedTwin, setSelectedTwin,
    twinData, setTwinData,
    webSocketService
  } = usePlatform();

  // Initialize tenant and load twins
  useEffect(() => {
    const initializePlatform = async () => {
      try {
        const tenant = { id: 'tenant-1', name: 'Demo Company' };
        setCurrentTenant(tenant);

        // MOCKED twins data
        const twinsData = [
          { id: 'twin-1', name: 'Pump 1', type: 'pump', description: 'Main pump', config: {}, modelUrl: '' }
        ];
        setTwins(twinsData);

        if (twinsData.length > 0) {
          setSelectedTwin(twinsData[0]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize platform:', error);
        setIsLoading(false);
      }
    };

    initializePlatform();
  }, []);

  // Set up WebSocket connections for selected twin
  useEffect(() => {
    if (selectedTwin && webSocketService) {
      const handleTwinData = (data) => {
        setTwinData(prev => ({
          ...prev,
          [selectedTwin.id]: data
        }));
      };

      webSocketService.connectToTwin(selectedTwin.id);
      webSocketService.on(`twin_data_${selectedTwin.id}`, handleTwinData);

      return () => {
        webSocketService.off(`twin_data_${selectedTwin.id}`, handleTwinData);
        webSocketService.disconnectFromTwin(selectedTwin.id);
      };
    }
  }, [selectedTwin, webSocketService]);

  const handleTwinCreate = async (twinConfig) => {
    try {
      // MOCKED create twin
      const newTwin = { ...twinConfig, id: `twin-${Date.now()}` };
      setTwins(prev => [...prev, newTwin]);
      setSelectedTwin(newTwin);
      setCurrentView('monitor');
    } catch (error) {
      console.error('Failed to create twin:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading Digital Twin Platform...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <GlobalNavigation
        tenant={currentTenant}
        twins={twins}
        selectedTwin={selectedTwin}
        currentView={currentView}
        onTwinSelect={setSelectedTwin}
        onViewChange={setCurrentView}
      />
      
      <main className="pt-16">
        <AnimatePresence mode="wait">
          {currentView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TenantOverview 
                tenant={currentTenant}
                twins={twins}
                onTwinSelect={setSelectedTwin}
                onViewChange={setCurrentView}
              />
            </motion.div>
          )}
          
          {currentView === 'builder' && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <TwinBuilder 
                tenant={currentTenant}
                onTwinCreate={handleTwinCreate}
                onCancel={() => setCurrentView('overview')}
              />
            </motion.div>
          )}
          
          {currentView === 'monitor' && selectedTwin && (
            <motion.div
              key="monitor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="h-screen"
            >
              <TwinMonitor
                digitalTwin={selectedTwin}
                realTimeData={twinData[selectedTwin.id]}
                tenant={currentTenant}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <PlatformProvider>
      <App />
    </PlatformProvider>
  );
}