import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export const PerformanceMetrics = ({ digitalTwin, realTimeData }) => {
  // Generate mock historical data for demonstration
  const generateHistoricalData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: time.getTime(),
        systemHealth: 85 + Math.random() * 15,
        efficiency: 75 + Math.random() * 20,
        powerUsage: 80 + Math.random() * 40,
        alerts: Math.floor(Math.random() * 5)
      });
    }
    
    return data;
  };

  const historicalData = generateHistoricalData();

  const kpis = [
    {
      title: 'System Health',
      value: realTimeData?.systemHealth || 95,
      unit: '%',
      color: '#10B981',
      target: 90
    },
    {
      title: 'Efficiency',
      value: 87,
      unit: '%',
      color: '#3B82F6',
      target: 85
    },
    {
      title: 'Uptime',
      value: 99.8,
      unit: '%',
      color: '#8B5CF6',
      target: 99
    },
    {
      title: 'Power Usage',
      value: realTimeData?.power?.totalPower || 120,
      unit: 'kW',
      color: '#F59E0B',
      target: 150
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-400">{kpi.title}</h4>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: kpi.color }}
              />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {kpi.value.toFixed(1)}
              <span className="text-sm font-normal text-gray-400 ml-1">
                {kpi.unit}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Target: {kpi.target}{kpi.unit}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
              <div 
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%`,
                  backgroundColor: kpi.color
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health Trend */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">System Health (24h)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                domain={[70, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="systemHealth" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Power Usage */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Power Usage (24h)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={historicalData.slice(-12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Bar 
                dataKey="powerUsage" 
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};