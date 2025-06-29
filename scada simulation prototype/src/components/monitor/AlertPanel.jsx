import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const AlertPanel = ({ alerts = [], onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState('all');

  const alertTypes = {
    critical: { color: 'bg-red-500', icon: '🚨', label: 'Critical' },
    danger: { color: 'bg-orange-500', icon: '⚠️', label: 'Danger' },
    warning: { color: 'bg-yellow-500', icon: '⚡', label: 'Warning' },
    info: { color: 'bg-blue-500', icon: 'ℹ️', label: 'Info' }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filter);

  const criticalCount = alerts.filter(alert => alert.type === 'critical').length;
  const warningCount = alerts.filter(alert => alert.type === 'warning' || alert.type === 'danger').length;

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsExpanded(true)}
            className={`
              px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border flex items-center space-x-3
              ${criticalCount > 0 
                ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                : warningCount > 0
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                : 'bg-blue-500/20 border-blue-500/50 text-blue-400'
              }
            `}
          >
            <div className="text-xl">
              {criticalCount > 0 ? '🚨' : warningCount > 0 ? '⚠️' : 'ℹ️'}
            </div>
            <div>
              <div className="font-medium">
                {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
              </div>
              {criticalCount > 0 && (
                <div className="text-xs">
                  {criticalCount} critical
                </div>
              )}
            </div>
          </motion.button>
        )}

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl w-96 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-white">
                Alerts ({alerts.length})
              </h3>
              
              <div className="flex items-center space-x-2">
                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
                >
                  <option value="all">All</option>
                  <option value="critical">Critical</option>
                  <option value="danger">Danger</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
                
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Alert List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredAlerts.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  No {filter !== 'all' ? filter : ''} alerts
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id || index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        p-3 rounded-lg border-l-4 bg-gray-700/50
                        ${alertTypes[alert.type]?.color || 'border-gray-500'}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                          <span className="text-lg">
                            {alertTypes[alert.type]?.icon || 'ℹ️'}
                          </span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">
                              {alert.message}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {alert.category} • {new Date(alert.timestamp).toLocaleTimeString()}
                            </div>
                            {alert.value && alert.threshold && (
                              <div className="text-xs text-gray-500 mt-1">
                                Value: {alert.value} (Threshold: {alert.threshold})
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => onDismiss(alert.id || index)}
                          className="text-gray-400 hover:text-white text-xs ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredAlerts.length > 0 && (
              <div className="p-3 border-t border-gray-700 bg-gray-800/50">
                <button
                  onClick={() => filteredAlerts.forEach((alert, index) => onDismiss(alert.id || index))}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Dismiss All {filter !== 'all' ? filter.charAt(0).toUpperCase() + filter.slice(1) : ''}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};