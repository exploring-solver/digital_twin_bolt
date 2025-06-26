import React from 'react';
import { motion } from 'framer-motion';

interface Sensor {
  name: string;
  value: number | string | boolean;
  unit: string;
  icon: React.ComponentType<any>;
  threshold: { min?: number; max?: number };
}

interface SensorCategory {
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  sensors: Sensor[];
}

interface SensorCardProps {
  category: SensorCategory;
  delay: number;
}

export const SensorCard: React.FC<SensorCardProps> = ({ category, delay }) => {
  const CategoryIcon = category.icon;

  const getStatusColor = (value: number | string | boolean, threshold: { min?: number; max?: number }, sensorName: string) => {
    // Handle boolean values
    if (typeof value === 'boolean') {
      if (sensorName.includes('Overload') || sensorName.includes('E-Stop')) {
        return value ? 'text-red-400' : 'text-green-400';
      }
      if (sensorName.includes('Operator Present')) {
        return value ? 'text-green-400' : 'text-red-400';
      }
      return value ? 'text-green-400' : 'text-red-400';
    }

    // Handle string values
    if (typeof value === 'string') {
      if (value === 'ACTIVE' && (sensorName.includes('Overload') || sensorName.includes('E-Stop'))) {
        return 'text-red-400';
      }
      if (value === 'NORMAL') {
        return 'text-green-400';
      }
      if (value === 'YES') {
        return 'text-green-400';
      }
      if (value === 'NO') {
        return 'text-red-400';
      }
      return 'text-blue-400';
    }

    // Handle numeric values
    const numValue = value as number;
    if (threshold.max && numValue > threshold.max) return 'text-red-400';
    if (threshold.min && numValue < threshold.min) return 'text-red-400';
    if (threshold.max && numValue > threshold.max * 0.8) return 'text-yellow-400';
    if (threshold.min && numValue < threshold.min * 1.2) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusBgColor = (value: number | string | boolean, threshold: { min?: number; max?: number }, sensorName: string) => {
    // Handle boolean values
    if (typeof value === 'boolean') {
      if (sensorName.includes('Overload') || sensorName.includes('E-Stop')) {
        return value ? 'bg-red-500/20 border-red-500/30' : 'bg-green-500/20 border-green-500/30';
      }
      if (sensorName.includes('Operator Present')) {
        return value ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30';
      }
      return value ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30';
    }

    // Handle string values
    if (typeof value === 'string') {
      if (value === 'ACTIVE' && (sensorName.includes('Overload') || sensorName.includes('E-Stop'))) {
        return 'bg-red-500/20 border-red-500/30';
      }
      if (value === 'NORMAL') {
        return 'bg-green-500/20 border-green-500/30';
      }
      if (value === 'YES') {
        return 'bg-green-500/20 border-green-500/30';
      }
      if (value === 'NO') {
        return 'bg-red-500/20 border-red-500/30';
      }
      return 'bg-blue-500/20 border-blue-500/30';
    }

    // Handle numeric values
    const numValue = value as number;
    if (threshold.max && numValue > threshold.max) return 'bg-red-500/20 border-red-500/30';
    if (threshold.min && numValue < threshold.min) return 'bg-red-500/20 border-red-500/30';
    if (threshold.max && numValue > threshold.max * 0.8) return 'bg-yellow-500/20 border-yellow-500/30';
    if (threshold.min && numValue < threshold.min * 1.2) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-green-500/20 border-green-500/30';
  };

  const formatSensorValue = (value: number | string | boolean, sensorName: string) => {
    if (typeof value === 'boolean') {
      if (sensorName.includes('Overload') || sensorName.includes('E-Stop')) {
        return value ? 'ACTIVE' : 'NORMAL';
      }
      if (sensorName.includes('Operator Present')) {
        return value ? 'YES' : 'NO';
      }
      return value ? 'ON' : 'OFF';
    }

    if (typeof value === 'string') {
      return value;
    }

    // Handle numeric values
    return (value as number).toFixed(sensorName.includes('Factor') ? 2 : 1);
  };

  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/20',
    green: 'text-green-400 bg-green-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    red: 'text-red-400 bg-red-500/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-2 rounded-lg ${colorClasses[category.color as keyof typeof colorClasses]}`}>
          <CategoryIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{category.title}</h3>
          <p className="text-sm text-slate-400">Real-time monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {category.sensors.map((sensor, index) => {
          const SensorIcon = sensor.icon;
          const statusColor = getStatusColor(sensor.value, sensor.threshold, sensor.name);
          const statusBgColor = getStatusBgColor(sensor.value, sensor.threshold, sensor.name);

          return (
            <motion.div
              key={sensor.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: delay + (index * 0.05) }}
              className={`p-4 rounded-lg border ${statusBgColor} hover:scale-105 transition-transform`}
            >
              <div className="flex items-center justify-between mb-2">
                <SensorIcon className={`w-4 h-4 ${statusColor}`} />
                <div className={`w-2 h-2 rounded-full ${statusColor.replace('text-', 'bg-')} animate-pulse`}></div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">{sensor.name}</p>
                <div className="flex items-baseline space-x-1">
                  <span className={`text-xl font-bold ${statusColor}`}>
                    {formatSensorValue(sensor.value, sensor.name)}
                  </span>
                  {sensor.unit && <span className="text-xs text-slate-400">{sensor.unit}</span>}
                </div>
              </div>

              {/* Mini progress bar for numeric values with max thresholds */}
              {typeof sensor.value === 'number' && sensor.threshold.max && (
                <div className="mt-3">
                  <div className="w-full bg-slate-700 rounded-full h-1">
                    <motion.div
                      className={`h-1 rounded-full ${statusColor.replace('text-', 'bg-')}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((sensor.value / sensor.threshold.max) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: delay + 0.5 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};