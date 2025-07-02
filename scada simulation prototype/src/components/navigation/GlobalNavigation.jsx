import React, { useState, useEffect } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');

  // Track screen size for responsive behavior
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('mobile');
      else if (width < 768) setScreenSize('sm');
      else if (width < 1024) setScreenSize('md');
      else setScreenSize('desktop');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
      if (!event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
    { id: 'overview', name: 'Overview', icon: '📊', shortName: 'Home' },
    { id: 'builder', name: 'Twin Builder', icon: '🔧', shortName: 'Builder' },
    { id: 'monitor', name: 'Monitor', icon: '📈', shortName: 'Monitor', disabled: !selectedTwin },
    { id: 'analytics', name: 'Analytics', icon: '📉', shortName: 'Analytics', disabled: !selectedTwin },
    { id: 'crane-dashboard', name: 'Crane Dashboard', icon: '🏗️', shortName: 'Crane' }
  ];

  const handleNavItemClick = (itemId) => {
    if (itemId === 'crane-dashboard') {
      window.open('https://scadaverse-crane.netlify.app', '_blank');
      setIsMobileMenuOpen(false);
      return;
    }
    onViewChange(itemId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Glowing Bolt Logo at top right */}
      <motion.div
        className="fixed top-52 right-6 z-51"
        initial={{ scale: 0.9, rotate: -10, opacity: 0.8 }}
        animate={{ 
          scale: [0.9, 1.1, 1], 
          rotate: [0, 15, -15, 0], 
          opacity: [0.8, 1, 0.8] 
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          repeatType: "reverse", 
          ease: "easeInOut" 
        }}
        whileHover={{ scale: 1.15, filter: "brightness(1.5) drop-shadow(0 0 24px #fbbf24)" }}
        style={{ pointerEvents: 'auto' }}
      >
        <img
          src="/boltlogo.jpg"
          alt="Bolt Logo"
          className="w-12 h-12 object-contain drop-shadow-lg"
          style={{
            filter: "drop-shadow(0 0 24px #fbbf24) brightness(1.2)"
          }}
        />
      </motion.div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo and Tenant Info */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1 sm:flex-none">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
                <span className="hidden sm:inline">🌐 Scada-Verse</span>
                <span className="sm:hidden">🌐 SV</span>
              </div>
              {tenant && screenSize !== 'mobile' && (
                <div className="text-xs sm:text-sm text-gray-400 truncate">
                  {/* {tenant.name} */}
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navigation.map(item => (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && handleNavItemClick(item.id)}
                  disabled={item.disabled}
                  className={`
                    px-3 xl:px-4 py-2 rounded-lg flex items-center space-x-1 xl:space-x-2 transition-all text-sm xl:text-base
                    ${currentView === item.id 
                      ? 'bg-blue-600 text-white' 
                      : item.disabled
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <span className="text-sm xl:text-base">{item.icon}</span>
                  <span className="hidden xl:inline">{item.name}</span>
                  <span className="xl:hidden">{item.shortName}</span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden mobile-menu-container">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Twin Selector */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-2 bg-gray-800 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors min-w-0"
              >
                {selectedTwin ? (
                  <>
                    <span className="text-base sm:text-xl flex-shrink-0">{getTwinIcon(selectedTwin.type)}</span>
                    <div className="text-left min-w-0 hidden sm:block">
                      <div className="text-white font-medium text-sm truncate max-w-24 lg:max-w-32">
                        {selectedTwin.name}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(getTwinStatus(selectedTwin))}`} />
                        <span className="truncate">{getTwinStatus(selectedTwin)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 text-sm">
                    <span className="hidden sm:inline">Select Twin</span>
                    <span className="sm:hidden">Twin</span>
                  </div>
                )}
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Twin Dropdown */}
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-72 sm:w-80 bg-gray-800 rounded-lg border border-gray-600 shadow-xl z-50"
                >
                  <div className="p-3 border-b border-gray-700">
                    <h4 className="font-medium text-white text-sm sm:text-base">
                      Digital Twins ({twins.length})
                    </h4>
                  </div>
                  
                  <div className="max-h-48 sm:max-h-64 overflow-y-auto">
                    {twins.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        <div className="text-2xl sm:text-3xl mb-2">🔧</div>
                        <div className="text-sm">No twins created yet</div>
                        <button
                          onClick={() => {
                            handleNavItemClick('builder');
                            setIsDropdownOpen(false);
                          }}
                          className="mt-2 text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
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
                          <span className="text-xl sm:text-2xl flex-shrink-0">{getTwinIcon(twin.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm sm:text-base truncate">{twin.name}</div>
                            <div className="text-xs sm:text-sm text-gray-400 capitalize">{twin.type}</div>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(getTwinStatus(twin))}`} />
                            <span className="text-xs text-gray-400 hidden sm:inline">{getTwinStatus(twin)}</span>
                          </div>
                        </button>
                      ))
                    )
                    }
                  </div>
                  
                  <div className="p-3 border-t border-gray-700">
                    <button
                      onClick={() => {
                        handleNavItemClick('builder');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
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

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-700 bg-gray-900"
          >
            <div className="px-3 py-2 space-y-1">
              {navigation.map(item => (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && handleNavItemClick(item.id)}
                  disabled={item.disabled}
                  className={`
                    w-full px-3 py-3 text-left rounded-lg flex items-center space-x-3 transition-all
                    ${currentView === item.id 
                      ? 'bg-blue-600 text-white' 
                      : item.disabled
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                  {item.disabled && (
                    <span className="text-xs text-gray-500 ml-auto">Requires twin</span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Mobile Tenant Info */}
            {tenant && screenSize === 'mobile' && (
              <div className="px-3 py-2 border-t border-gray-700">
                <div className="text-xs text-gray-400">
                  {tenant.name}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Tablet Navigation */}
        <div className="hidden sm:flex lg:hidden border-t border-gray-700 overflow-x-auto">
          <div className="flex min-w-full">
            {navigation.map(item => (
              <button
                key={item.id}
                onClick={() => !item.disabled && handleNavItemClick(item.id)}
                disabled={item.disabled}
                className={`
                  flex-1 min-w-0 px-2 py-3 flex flex-col items-center space-y-1 transition-all
                  ${currentView === item.id 
                    ? 'bg-blue-600 text-white' 
                    : item.disabled
                    ? 'text-gray-500'
                    : 'text-gray-300 hover:bg-gray-800'
                  }
                `}
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-xs truncate w-full text-center">
                  {screenSize === 'sm' ? item.shortName : item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed nav */}
      <div className="h-14 sm:h-16 lg:h-16"></div>
    </>
  );
};