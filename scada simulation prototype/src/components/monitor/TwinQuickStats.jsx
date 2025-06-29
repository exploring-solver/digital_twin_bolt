import React from 'react';
import { motion } from 'framer-motion';

export const TwinQuickStats = ({ digitalTwin, realTimeData }) => {
  const getStatsForTwinType = () => {
    if (!realTimeData) return [];

    switch (digitalTwin.type) {
      case 'crane':
        return [
          {
            label: 'Load Weight',
            value: realTimeData.lifting?.loadWeight || 0,
            unit: 'kg',
            color: 'blue',
            trend: 'stable'
          },
          {
            label: 'Motor Temp',
            value: realTimeData.motor?.hoistMotorTemp || 0,
            unit: '°C',
            color: realTimeData.motor?.hoistMotorTemp > 75 ? 'red' : 'green',
            trend: 'stable'
          },
          {
            label: 'Wind Speed',
            value: realTimeData.environmental?.windSpeed || 0,
            unit: 'm/s',
            color: realTimeData.environmental?.windSpeed > 20 ? 'yellow' : 'green',
            trend: 'stable'
          },
          {
            label: 'System Health',
            value: realTimeData.systemHealth || 0,
            unit: '%',
            color: realTimeData.systemHealth > 80 ? 'green' : 'yellow',
            trend: 'up'
          }
        ];

      case 'building':
        return [
          {
            label: 'Temperature',
            value: realTimeData.environmental?.temperature || 22,
            unit: '°C',
            color: 'blue',
            trend: 'stable'
          },
          {
            label: 'Occupancy',
            value: realTimeData.occupancy?.count || 0,
            unit: 'people',
            color: 'green',
            trend: 'up'
          },
          {
            label: 'Energy Usage',
            value: realTimeData.power?.totalPower || 0,
            unit: 'kW',
            color: 'purple',
            trend: 'down'
          },
          {
            label: 'Air Quality',
            value: realTimeData.environmental?.airQuality || 25,
            unit: 'AQI',
            color: 'green',
            trend: 'stable'
          }
        ];

      case 'factory':
        return [
          {
            label: 'Production Rate',
            value: realTimeData.production?.rate || 85,
            unit: 'units/hr',
            color: 'green',
            trend: 'up'
          },
          {
            label: 'Quality Score',
            value: realTimeData.quality?.score || 98,
            unit: '%',
            color: 'green',
            trend: 'stable'
          },
          {
            label: 'Energy Efficiency',
            value: realTimeData.efficiency?.energy || 87,
            unit: '%',
            color: 'blue',
            trend: 'up'
          },
          {
            label: 'Safety Status',
            value: realTimeData.safety?.score || 100,
            unit: '%',
            color: 'green',
            trend: 'stable'
          }
        ];

      default:
        return [];
    }
  };

  const stats = getStatsForTwinType();

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return colors[color] || colors.blue;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
      
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-4 rounded-lg border backdrop-blur-sm
              ${getColorClasses(stat.color)}
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80">{stat.label}</div>
                <div className="text-2xl font-bold">
                  {typeof stat.value === 'number' ? stat.value.toFixed(1) : stat.value}
                  <span className="text-sm ml-1 opacity-80">{stat.unit}</span>
                </div>
              </div>
              <div className="text-2xl">
                {getTrendIcon(stat.trend)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Twin Info */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Twin Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Created:</span>
            <span className="text-white">
              {new Date(digitalTwin.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Sensors:</span>
            <span className="text-white">
              {digitalTwin.sensors?.length || 0} active
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Uptime:</span>
            <span className="text-green-400">99.8%</span>
          </div>
        </div>
      </div>
    </div>
  );
};