import React from 'react';
import { Activity, Zap, Thermometer, Shield, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

interface SystemOverviewProps {
  sensorData: any;
}

export const SystemOverview: React.FC<SystemOverviewProps> = ({ sensorData }) => {
  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-400';
    if (health >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBgColor = (health: number) => {
    if (health >= 90) return 'bg-green-400';
    if (health >= 70) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const overviewItems = [
    {
      title: 'System Health',
      value: sensorData?.systemHealth || 0,
      unit: '%',
      icon: Activity,
      description: 'Overall system status'
    },
    {
      title: 'Power Consumption',
      value: sensorData?.power?.totalPower || 0,
      unit: 'kW',
      icon: Zap,
      description: 'Current power usage'
    },
    {
      title: 'Load Weight',
      value: sensorData?.lifting?.loadWeight || 0,
      unit: 'kg',
      icon: Gauge,
      description: 'Current load weight'
    },
    {
      title: 'Temperature',
      value: sensorData?.environmental?.temperature || 0,
      unit: '°C',
      icon: Thermometer,
      description: 'Environmental temperature'
    },
    {
      title: 'Safety Status',
      value: sensorData?.safety?.overloadProtection ? 'Active' : 'Inactive',
      unit: '',
      icon: Shield,
      description: 'Safety systems status'
    }
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">System Overview</h2>
          <p className="text-slate-400">Real-time crane system monitoring</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Last Updated</p>
          <p className="text-white font-mono">
            {sensorData?.timestamp ? new Date(sensorData.timestamp).toLocaleTimeString() : '--:--:--'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {overviewItems.map((item, index) => {
          const Icon = item.icon;
          const isSystemHealth = item.title === 'System Health';
          const isSafety = item.title === 'Safety Status';
          
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-900/50 rounded-lg p-4 border border-slate-600 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5 text-blue-400" />
                {isSystemHealth && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getHealthBgColor(item.value as number)}`}></div>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">{item.title}</p>
                <div className="flex items-baseline space-x-1">
                  <span className={`text-2xl font-bold ${isSystemHealth ? getHealthColor(item.value as number) : isSafety ? (item.value === 'Active' ? 'text-green-400' : 'text-red-400') : 'text-white'}`}>
                    {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
                  </span>
                  {item.unit && <span className="text-sm text-slate-400">{item.unit}</span>}
                </div>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
              
              {isSystemHealth && (
                <div className="mt-3">
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <motion.div
                      className={`h-1.5 rounded-full ${getHealthBgColor(item.value as number)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};