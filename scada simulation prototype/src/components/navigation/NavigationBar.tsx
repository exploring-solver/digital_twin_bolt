import React from 'react';
import { Monitor, Box, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationBarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isConnected: boolean;
  alertCount: number;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentView,
  onViewChange,
  isConnected,
  alertCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Monitor },
    { id: '3d', label: '3D View', icon: Box }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SCADA Crane System</h1>
              <p className="text-xs text-slate-400">Industrial Monitoring & Control</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    relative px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all
                    ${currentView === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {currentView === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-600 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            {/* Alert Count */}
            {alertCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white rounded-full text-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{alertCount}</span>
              </motion.div>
            )}

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2 text-green-400"
                >
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Connected</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2 text-red-400"
                >
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Disconnected</span>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};