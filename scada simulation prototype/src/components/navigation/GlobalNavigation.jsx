import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const GlobalNavigation = ({ 
  tenant, 
  twins, 
  selectedTwin, 
  currentView, 
  onTwinSelect, 
  onViewChange 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getTwinIcon = (twinType) => {
    const icons = {
      crane: '🏗️',
      building: '🏢',
      factory: '🏭',
      vehicle: '🚛'
    };
    return icons[twinType] || '📊';
  };

  const getTwinStatus = (twin) => {
    // In a real implementation, this would come from real-time data
    return Math.random() > 0.1 ? 'online' : 'offline';
  };

  const getStatusColor = (status) => {
    return status === 'online' ? 'bg-green-400' : 'bg-red-400';
  };

  const navigation = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'builder', name: 'Twin Builder', icon: '🔧' },
    { id: 'monitor', name: 'Monitor', icon: '📈', disabled: !selectedTwin },
    { id: 'analytics', name: 'Analytics', icon: '📉', disabled: !selectedTwin }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Tenant Info */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-white">
              🌐 DigitalTwin
            </div>
            {tenant && (
              <div className="text-sm text-gray-400">
                {tenant.name}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map(item => (
              <button
                key={item.id}
                onClick={() => !item.disabled && onViewChange(item.id)}
                disabled={item.disabled}
                className={`
                  px-4 py-2 rounded-lg flex items-center space-x-2 transition-all
                  ${currentView === item.id 
                    ? 'bg-blue-600 text-white' 
                    : item.disabled
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* Twin Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 px-4 py-2 bg-gray-800 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
            >
              {selectedTwin ? (
                <>
                  <span className="text-xl">{getTwinIcon(selectedTwin.type)}</span>
                  <div className="text-left">
                    <div className="text-white font-medium">{selectedTwin.name}</div>
                    <div className="text-xs text-gray-400 flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(getTwinStatus(selectedTwin))}`} />
                      <span>{getTwinStatus(selectedTwin)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-400">Select Twin</div>
              )}
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg border border-gray-600 shadow-xl z-50"
              >
                <div className="p-3 border-b border-gray-700">
                  <h4 className="font-medium text-white">Digital Twins ({twins.length})</h4>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {twins.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="text-3xl mb-2">🔧</div>
                      <div>No twins created yet</div>
                      <button
                        onClick={() => {
                          onViewChange('builder');
                          setIsDropdownOpen(false);
                        }}
                        className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Create your first twin
                      </button>
                    </div>
                  ) : (
                    twins.map(twin => (
                      <button
                        key={twin.id}
                        onClick={() => {
                          onTwinSelect(twin);
                          setIsDropdownOpen(false);
                          if (currentView === 'overview') {
                            onViewChange('monitor');
                          }
                        }}
                        className={`
                          w-full p-3 text-left hover:bg-gray-700 transition-colors flex items-center space-x-3
                          ${selectedTwin?.id === twin.id ? 'bg-gray-700' : ''}
                        `}
                      >
                        <span className="text-2xl">{getTwinIcon(twin.type)}</span>
                        <div className="flex-1">
                          <div className="font-medium text-white">{twin.name}</div>
                          <div className="text-sm text-gray-400 capitalize">{twin.type}</div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(getTwinStatus(twin))}`} />
                          <span className="text-xs text-gray-400">{getTwinStatus(twin)}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                
                <div className="p-3 border-t border-gray-700">
                  <button
                    onClick={() => {
                      onViewChange('builder');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>+</span>
                    <span>Create New Twin</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-700">
        <div className="flex overflow-x-auto">
          {navigation.map(item => (
            <button
              key={item.id}
              onClick={() => !item.disabled && onViewChange(item.id)}
              disabled={item.disabled}
              className={`
                flex-shrink-0 px-4 py-3 flex flex-col items-center space-y-1 transition-all
                ${currentView === item.id 
                  ? 'bg-blue-600 text-white' 
                  : item.disabled
                  ? 'text-gray-500'
                  : 'text-gray-300 hover:bg-gray-800'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
};