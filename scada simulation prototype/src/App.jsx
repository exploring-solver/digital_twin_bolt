import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TwinBuilder } from './components/builder/TwinBuilder';
import { TenantOverview } from './components/overview/TenantOverview';
import { GlobalNavigation } from './components/navigation/GlobalNavigation';
import { EnhancedWebSocketService } from './services/EnhancedWebSocketService';
import { TwinMonitor } from './components/monitor/TwinMonitor';
import { CraneVisualization } from './components/3d/CraneVisualization';
import { SensorDashboard } from './components/dashboard/SensorDashboard';
import { AlertPanel } from './components/alerts/AlertPanel';
import { Enhanced3DTwin } from './components/monitor/Enhanced3DTwin';
import { CraneDashboardApp } from './components/crane/CraneDashboardApp';

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

// Enhanced page transitions with different animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    rotateY: -90,
    filter: 'blur(10px)',
  },
  in: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    filter: 'blur(0px)',
  },
  out: {
    opacity: 0,
    scale: 1.2,
    rotateY: 90,
    filter: 'blur(10px)',
  }
};

const slideVariants = {
  initial: {
    x: '-100vw',
    opacity: 0,
    scale: 0.8,
  },
  in: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  out: {
    x: '100vw',
    opacity: 0,
    scale: 0.8,
  }
};

const bounceVariants = {
  initial: {
    y: '-100vh',
    opacity: 0,
    rotate: -180,
    scale: 0.5,
  },
  in: {
    y: 0,
    opacity: 1,
    rotate: 0,
    scale: 1,
  },
  out: {
    y: '100vh',
    opacity: 0,
    rotate: 180,
    scale: 0.5,
  }
};

const spiralVariants = {
  initial: {
    scale: 0,
    rotate: -360,
    opacity: 0,
    x: 100,
    y: 100,
  },
  in: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    x: 0,
    y: 0,
  },
  out: {
    scale: 0,
    rotate: 360,
    opacity: 0,
    x: -100,
    y: -100,
  }
};

// Route-specific animation mapping
const getAnimationVariant = (pathname) => {
  switch (pathname) {
    case '/': return pageVariants;
    case '/builder': return spiralVariants;
    case '/monitor': return slideVariants;
    case '/analytics': return bounceVariants;
    case '/crane-dashboard': return {
      initial: { opacity: 0, scale: 0.9, rotateX: 45 },
      in: { opacity: 1, scale: 1, rotateX: 0 },
      out: { opacity: 0, scale: 0.9, rotateX: -45 }
    };
    default: return pageVariants;
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.8
};

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [sensorData, setSensorData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const {
    currentTenant, setCurrentTenant,
    twins, setTwins,
    selectedTwin, setSelectedTwin,
    twinData, setTwinData,
    webSocketService
  } = usePlatform();

  // Get current view from pathname
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/') return 'overview';
    if (path === '/builder') return 'builder';
    if (path === '/monitor') return 'monitor';
    if (path === '/analytics') return 'analytics';
    if (path === '/crane-dashboard') return 'crane-dashboard';
    return 'overview';
  };

  const handleViewChange = (view) => {
    const routes = {
      'overview': '/',
      'builder': '/builder',
      'monitor': '/monitor',
      'analytics': '/analytics',
      'crane-dashboard': '/crane-dashboard'
    };
    navigate(routes[view] || '/');
  };

  // Initialize tenant and load twins
  useEffect(() => {
    const initializePlatform = async () => {
      try {
        // Add loading animation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const tenant = { id: 'tenant-1', name: 'SCADA VERSE' };
        setCurrentTenant(tenant);

        // MOCKED twins data
        const twinsData = [
          { 
            id: 'twin-1', 
            name: 'Industrial Crane A1', 
            type: 'crane', 
            description: 'Main industrial crane', 
            config: {}, 
            modelUrl: '',
            sensors: ['load', 'position', 'temperature', 'vibration']
          },
          { 
            id: 'twin-2', 
            name: 'Factory Building B2', 
            type: 'building', 
            description: 'Main factory building', 
            config: {}, 
            modelUrl: '',
            sensors: ['temperature', 'humidity', 'air_quality']
          }
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

  // WebSocket for all views (including crane dashboard)
  useEffect(() => {
    const handleSensorData = (data) => setSensorData(data);
    const handleAlerts = (newAlerts) => setAlerts((prev) => [...prev, ...newAlerts].slice(-50));
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

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

  const handleTwinCreate = async (twinConfig) => {
    try {
      // MOCKED create twin with enhanced animation
      const newTwin = { 
        ...twinConfig, 
        id: `twin-${Date.now()}`,
        sensors: twinConfig.sensors || ['default']
      };
      setTwins(prev => [...prev, newTwin]);
      setSelectedTwin(newTwin);
      navigate('/monitor');
    } catch (error) {
      console.error('Failed to create twin:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
        
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ 
            duration: 1.5, 
            type: "spring", 
            stiffness: 100,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-6xl mb-4"
          >
            🌐
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white text-xl font-bold"
          >
            Loading Digital Twin Platform...
          </motion.div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-4 h-1 bg-blue-500 rounded-full w-64 mx-auto"
          />
        </motion.div>
      </div>
    );
  }

  const currentView = getCurrentView();
  const isInCraneDashboard = location.pathname === '/crane-dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/5 rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Navigation - hide for crane dashboard full screen */}
      {!isInCraneDashboard && (
        <GlobalNavigation
          tenant={currentTenant}
          twins={twins}
          selectedTwin={selectedTwin}
          currentView={currentView}
          onTwinSelect={setSelectedTwin}
          onViewChange={handleViewChange}
          alertCount={alerts.filter(alert => alert.type === 'critical' || alert.type === 'danger').length}
        />
      )}

      <main className={isInCraneDashboard ? "" : "pt-16"}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <motion.div
                key="overview"
                initial="initial"
                animate="in"
                exit="out"
                variants={getAnimationVariant(location.pathname)}
                transition={pageTransition}
                className="relative z-10"
              >
                <TenantOverview
                  tenant={currentTenant}
                  twins={twins}
                  onTwinSelect={setSelectedTwin}
                  onViewChange={handleViewChange}
                />
              </motion.div>
            } />

            <Route path="/builder" element={
              <motion.div
                key="builder"
                initial="initial"
                animate="in"
                exit="out"
                variants={getAnimationVariant(location.pathname)}
                transition={pageTransition}
                className="relative z-10"
              >
                <TwinBuilder
                  tenant={currentTenant}
                  onTwinCreate={handleTwinCreate}
                  onCancel={() => navigate('/')}
                />
              </motion.div>
            } />

            <Route path="/monitor" element={
              selectedTwin ? (
                <motion.div
                  key="monitor"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={getAnimationVariant(location.pathname)}
                  transition={pageTransition}
                  className="h-screen relative z-10"
                >
                  <TwinMonitor
                    digitalTwin={selectedTwin}
                    realTimeData={twinData[selectedTwin.id]}
                    tenant={currentTenant}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="no-twin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-screen relative z-10"
                >
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🔧</div>
                    <h2 className="text-2xl mb-4">No Twin Selected</h2>
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Go to Overview
                    </button>
                  </div>
                </motion.div>
              )
            } />

            <Route path="/analytics" element={
              selectedTwin ? (
                <motion.div
                  key="analytics"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={getAnimationVariant(location.pathname)}
                  transition={pageTransition}
                  className="relative z-10"
                >
                  <div className="p-6">
                    <h1 className="text-3xl font-bold text-white mb-6">Analytics Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                        <h3 className="text-xl text-white mb-4">Performance Metrics</h3>
                        <div className="text-gray-400">Analytics for {selectedTwin.name} coming soon...</div>
                      </div>
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                        <h3 className="text-xl text-white mb-4">Predictive Analysis</h3>
                        <div className="text-gray-400">ML predictions coming soon...</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-twin-analytics"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-screen relative z-10"
                >
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">📊</div>
                    <h2 className="text-2xl mb-4">No Twin Selected</h2>
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Go to Overview
                    </button>
                  </div>
                </motion.div>
              )
            } />

            <Route path="/crane-dashboard" element={
              <motion.div
                key="crane-dashboard"
                initial="initial"
                animate="in"
                exit="out"
                variants={getAnimationVariant(location.pathname)}
                transition={pageTransition}
                className="h-screen relative z-10"
              >
                <CraneDashboardApp 
                  sensorData={sensorData}
                  alerts={alerts}
                  onDismissAlert={index => setAlerts(prev => prev.filter((_, i) => i !== index))}
                  onNavigateBack={() => navigate('/')}
                  isConnected={isConnected}
                />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer - Hide on crane dashboard */}
      {!isInCraneDashboard && (
        <motion.footer
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="relative z-10 mt-auto border-t border-gray-700/50 bg-gray-900/80 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* Made with Bolt section */}
              <motion.div
                className="flex items-center space-x-3"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(147, 51, 234, 0.5)",
                    "0 0 30px rgba(59, 130, 246, 0.8)",
                    "0 0 20px rgba(147, 51, 234, 0.5)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.span
                  className="text-2xl"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  ⚡
                </motion.span>
                <motion.span
                  className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  Made with Bolt
                </motion.span>
                <motion.span
                  className="text-2xl"
                  animate={{
                    rotate: [360, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                  }}
                >
                  ⚡
                </motion.span>
              </motion.div>

              {/* Links */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                <motion.a
                  href="https://bolt.new/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(59, 130, 246, 0.7)",
                        "0 0 0 10px rgba(59, 130, 246, 0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-blue-400 rounded-full"
                  />
                  <span>bolt.new</span>
                </motion.a>
                
                <span className="text-gray-600">•</span>
                
                <motion.a
                  href="https://worldslargesthackathon.devpost.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-400 transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(147, 51, 234, 0.7)",
                        "0 0 0 10px rgba(147, 51, 234, 0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                  <span>World's Largest Hackathon</span>
                </motion.a>
              </div>

              {/* Copyright */}
              <motion.div
                className="text-xs text-gray-500 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <p>© 2025 SCADA-Verse Digital Twin Platform</p>
                <p className="mt-1">Built for innovation, powered by creativity</p>
              </motion.div>
            </div>
          </div>
        </motion.footer>
      )}

      {/* Floating Thank You Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          delay: 2, 
          type: "spring", 
          stiffness: 200, 
          damping: 15 
        }}
      >
        <motion.button
          onClick={() => window.open('https://worldslargesthackathon.devpost.com/', '_blank')}
          className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-full text-white font-semibold shadow-2xl overflow-hidden"
          whileHover={{ 
            scale: 1.1, 
            rotate: 5,
            boxShadow: "0 20px 40px rgba(147, 51, 234, 0.4)"
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(147, 51, 234, 0.5)",
              "0 0 40px rgba(59, 130, 246, 0.8)",
              "0 0 20px rgba(147, 51, 234, 0.5)",
            ],
          }}
          transition={{
            boxShadow: { duration: 2, repeat: Infinity },
          }}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          />
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 flex items-center space-x-2">
            <motion.span
              className="text-lg"
              animate={{
                rotate: [0, 20, -20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              🚀
            </motion.span>
            <span className="text-sm font-bold">Made with Bolt!</span>
            <motion.span
              className="text-lg"
              animate={{
                y: [0, -3, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              🚀
            </motion.span>
          </div>
          
          {/* Floating particles around button */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                animate={{
                  x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
                  y: [0, Math.sin(i * 60 * Math.PI / 180) * 40],
                  opacity: [1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  repeatDelay: 2,
                }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}
          </div>
        </motion.button>

        {/* Tooltip */}
        <motion.div
          className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
        >
          Built for Bolt Hackathon! 🎉
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
        </motion.div>
      </motion.div>
    </div>
  );
};

function App() {
  return (
    <PlatformProvider>
      <Router>
        <AppContent />
      </Router>
    </PlatformProvider>
  );
}

export default App;