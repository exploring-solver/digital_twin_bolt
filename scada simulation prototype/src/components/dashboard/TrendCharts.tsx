import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { WebSocketService } from '../../services/WebSocketService';

interface TrendChartsProps {
  sensorData: any;
}

export const TrendCharts: React.FC<TrendChartsProps> = ({ sensorData }) => {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [webSocketService] = useState(() => new WebSocketService());

  useEffect(() => {
    // Add current sensor data to historical data
    if (sensorData) {
      const timestamp = new Date(sensorData.timestamp).toLocaleTimeString();
      const newDataPoint = {
        time: timestamp,
        temperature: sensorData.environmental?.temperature || 0,
        loadWeight: sensorData.lifting?.loadWeight || 0,
        power: sensorData.power?.totalPower || 0,
        systemHealth: sensorData.systemHealth || 0,
        motorTemp: sensorData.motor?.hoistMotorTemp || 0,
        vibration: sensorData.environmental?.vibration || 0
      };

      setHistoricalData(prev => {
        const updated = [...prev, newDataPoint];
        return updated.slice(-20); // Keep last 20 data points
      });
    }
  }, [sensorData]);

  const chartConfigs = [
    {
      title: 'Environmental Temperature',
      dataKey: 'temperature',
      color: '#3B82F6',
      unit: '°C',
      areaChart: true
    },
    {
      title: 'Load Weight',
      dataKey: 'loadWeight',
      color: '#10B981',
      unit: 'kg',
      areaChart: false
    },
    {
      title: 'Power Consumption',
      dataKey: 'power',
      color: '#F59E0B',
      unit: 'kW',
      areaChart: true
    },
    {
      title: 'System Health',
      dataKey: 'systemHealth',
      color: '#8B5CF6',
      unit: '%',
      areaChart: false
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-300 text-sm">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white font-medium">
              {`${entry.name}: ${entry.value.toFixed(1)}${entry.payload.unit || ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Real-Time Trends</h3>
        <p className="text-slate-400">Live sensor data visualization over time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartConfigs.map((config, index) => (
          <motion.div
            key={config.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-slate-900/50 rounded-lg p-4 border border-slate-600"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">{config.title}</h4>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                ></div>
                <span className="text-sm text-slate-400">{config.unit}</span>
              </div>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                {config.areaChart ? (
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey={config.dataKey}
                      stroke={config.color}
                      fill={`${config.color}20`}
                      strokeWidth={2}
                      name={config.title}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey={config.dataKey}
                      stroke={config.color}
                      strokeWidth={2}
                      dot={{ fill: config.color, strokeWidth: 2, r: 3 }}
                      name={config.title}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};