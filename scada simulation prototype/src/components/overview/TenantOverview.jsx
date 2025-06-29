import React from 'react';
import { motion } from 'framer-motion';

export const TenantOverview = ({ tenant, twins, onTwinSelect, onViewChange }) => {
  const getTwinIcon = (twinType) => {
    const icons = {
      crane: '🏗️',
      building: '🏢',
      factory: '🏭',
      vehicle: '🚛'
    };
    return icons[twinType] || '📊';
  };

  const getTwinStatus = () => Math.random() > 0.1 ? 'online' : 'offline';
  
  const getStatusColor = (status) => {
    return status === 'online' ? 'text-green-400' : 'text-red-400';
  };

  const stats = [
    {
      title: 'Total Twins',
      value: twins.length,
      icon: '🌐',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    {
      title: 'Active Twins',
      value: twins.filter(() => getTwinStatus() === 'online').length,
      icon: '✅',
      color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    {
      title: 'Total Sensors',
      value: twins.reduce((acc, twin) => acc + (twin.sensors?.length || 4), 0),
      icon: '📡',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    },
    {
      title: 'Active Alerts',
      value: Math.floor(Math.random() * 8),
      icon: '⚠️',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  ];

   const recentActivity = [
    { time: '2 mins ago', action: 'Crane Twin - Load limit exceeded', type: 'warning' },
    { time: '15 mins ago', action: 'Building Twin - HVAC system optimized', type: 'success' },
    { time: '1 hour ago', action: 'Factory Twin - Production milestone reached', type: 'info' },
    { time: '2 hours ago', action: 'New sensor added to Vehicle Twin', type: 'info' },
    { time: '3 hours ago', action: 'System maintenance completed', type: 'success' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      case 'error': return '❌';
      default: return '📋';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Welcome to {tenant.name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-400"
        >
          Manage and monitor your digital twins from one central dashboard
        </motion.p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-lg border backdrop-blur-sm ${stat.color}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80">{stat.title}</div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital Twins Grid */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Your Digital Twins</h3>
              <button
                onClick={() => onViewChange('builder')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>+</span>
                <span>Create Twin</span>
              </button>
            </div>

            {twins.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌐</div>
                <h4 className="text-xl font-semibold text-white mb-2">No Digital Twins Yet</h4>
                <p className="text-gray-400 mb-6">
                  Create your first digital twin to start monitoring your assets
                </p>
                <button
                  onClick={() => onViewChange('builder')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {twins.map((twin, index) => {
                  const status = getTwinStatus();
                  return (
                    <motion.div
                      key={twin.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer group"
                      onClick={() => {
                        onTwinSelect(twin);
                        onViewChange('monitor');
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{getTwinIcon(twin.type)}</div>
                          <div>
                            <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {twin.name}
                            </h4>
                            <p className="text-sm text-gray-400 capitalize">{twin.type}</p>
                          </div>
                        </div>
                        <div className={`flex items-center space-x-1 ${getStatusColor(status)}`}>
                          <div className={`w-2 h-2 rounded-full ${
                            status === 'online' ? 'bg-green-400' : 'bg-red-400'
                          }`} />
                          <span className="text-xs">{status}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Sensors:</span>
                          <span className="text-white">{twin.sensors?.length || 4} active</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Last Update:</span>
                          <span className="text-white">
                            {status === 'online' ? 'Just now' : '2 hours ago'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Health:</span>
                          <span className="text-green-400">95%</span>
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTwinSelect(twin);
                            onViewChange('monitor');
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                          Monitor
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle analytics view
                          }}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                        >
                          📊
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg"
                >
                  <div className="text-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">{activity.action}</div>
                    <div className={`text-xs ${getActivityColor(activity.type)}`}>
                      {activity.time}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => onViewChange('builder')}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-3"
              >
                <span>🔧</span>
                <span>Create New Twin</span>
              </button>
              
              <button className="w-full p-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center space-x-3">
                <span>📊</span>
                <span>View Analytics</span>
              </button>
              
              <button className="w-full p-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center space-x-3">
                <span>⚙️</span>
                <span>System Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};