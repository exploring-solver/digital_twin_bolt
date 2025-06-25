import React from 'react';
import { AlertTriangle, X, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Alert {
  type: 'critical' | 'danger' | 'warning' | 'info';
  category: string;
  message: string;
  timestamp: string;
  value?: number;
  threshold?: number;
}

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss: (index: number) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onDismiss }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return AlertTriangle;
      case 'danger':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-600 border-red-500 text-white';
      case 'danger':
        return 'bg-orange-600 border-orange-500 text-white';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500 text-black';
      default:
        return 'bg-blue-600 border-blue-500 text-white';
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.type === 'critical' || alert.type === 'danger');
  
  if (criticalAlerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {criticalAlerts.slice(0, 5).map((alert, index) => {
          const Icon = getAlertIcon(alert.type);
          return (
            <motion.div
              key={`${alert.timestamp}-${index}`}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30,
                duration: 0.3 
              }}
              className={`
                rounded-lg border-2 p-4 shadow-2xl backdrop-blur-sm
                ${getAlertColors(alert.type)}
                hover:scale-105 transition-transform cursor-pointer
              `}
              onClick={() => onDismiss(alerts.indexOf(alert))}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 mt-0.5 animate-pulse" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-sm uppercase tracking-wide">
                        {alert.category}
                      </h4>
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-bold uppercase
                        ${alert.type === 'critical' ? 'bg-red-800' : 
                          alert.type === 'danger' ? 'bg-orange-800' : 'bg-yellow-800'}
                      `}>
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-sm leading-tight mb-2">{alert.message}</p>
                    
                    {alert.value && alert.threshold && (
                      <div className="text-xs opacity-80 mb-2">
                        Current: {alert.value.toFixed(1)} | Threshold: {alert.threshold}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1 text-xs opacity-70">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(alerts.indexOf(alert));
                  }}
                  className="ml-2 p-1 rounded hover:bg-black/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Animated progress bar for critical alerts */}
              {alert.type === 'critical' && (
                <div className="mt-3">
                  <div className="w-full bg-black/30 rounded-full h-1">
                    <motion.div
                      className="h-1 bg-white rounded-full"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 10, ease: "linear" }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {criticalAlerts.length > 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg p-3 text-center"
        >
          <p className="text-slate-300 text-sm">
            +{criticalAlerts.length - 5} more alerts
          </p>
        </motion.div>
      )}
    </div>
  );
};