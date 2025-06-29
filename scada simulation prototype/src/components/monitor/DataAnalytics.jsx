// ===== Fixed DataAnalytics Component with Correct Recharts Usage =====

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';

export const DataAnalytics = ({ digitalTwin, realTimeData }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Generate analytics data
  const generateAnalyticsData = () => {
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const interval = timeRange === '24h' ? 1 : timeRange === '7d' ? 6 : 24;
    
    const data = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i -= interval) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: timeRange === '24h' 
          ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : time.toLocaleDateString(),
        timestamp: time.getTime(),
        efficiency: 75 + Math.random() * 20 + Math.sin(i / 24) * 10,
        powerUsage: 80 + Math.random() * 40 + Math.cos(i / 12) * 20,
        temperature: 20 + Math.random() * 15 + Math.sin(i / 6) * 5,
        vibration: 1 + Math.random() * 3,
        load: 1000 + Math.random() * 8000,
        alerts: Math.floor(Math.random() * 3)
      });
    }
    
    return data;
  };

  const analyticsData = generateAnalyticsData();

  // Performance distribution data
  const performanceData = [
    { name: 'Excellent', value: 35, color: '#10B981' },
    { name: 'Good', value: 45, color: '#3B82F6' },
    { name: 'Fair', value: 15, color: '#F59E0B' },
    { name: 'Poor', value: 5, color: '#EF4444' }
  ];

  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' }
  ];

  const metrics = [
    { value: 'all', label: 'All Metrics' },
    { value: 'efficiency', label: 'Efficiency' },
    { value: 'power', label: 'Power Usage' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'vibration', label: 'Vibration' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-400">
            Performance insights for {digitalTwin.name}
          </p>
        </div>
        
        <div className="flex space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600"
          >
            {metrics.map(metric => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Avg Efficiency', value: '87.3%', change: '+2.1%', color: 'green' },
          { title: 'Peak Power', value: '142 kW', change: '-1.2%', color: 'blue' },
          { title: 'Max Temperature', value: '34.2°C', change: '+0.8°C', color: 'orange' },
          { title: 'Total Alerts', value: '12', change: '-3', color: 'red' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700"
          >
            <h4 className="text-sm font-medium text-gray-400 mb-1">{stat.title}</h4>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className={`text-sm ${
              stat.change.startsWith('+') 
                ? stat.color === 'red' ? 'text-red-400' : 'text-green-400'
                : stat.change.startsWith('-')
                ? stat.color === 'red' ? 'text-green-400' : 'text-red-400'
                : 'text-gray-400'
            }`}>
              {stat.change} from last period
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Trend */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Efficiency Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData}>
              <defs>
                <linearGradient id="efficiency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} domain={[60, 100]} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="efficiency" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#efficiency)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Power vs Load Correlation - Fixed using ScatterChart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Power vs Load Correlation</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                dataKey="load" 
                name="Load" 
                unit="kg"
                stroke="#9CA3AF" 
                fontSize={12} 
              />
              <YAxis 
                type="number" 
                dataKey="powerUsage" 
                name="Power" 
                unit="kW"
                stroke="#9CA3AF" 
                fontSize={12} 
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Scatter 
                name="Power vs Load"
                fill="#3B82F6" 
                fillOpacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Temperature Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Temperature Profile</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
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
                dataKey="temperature" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ fill: '#F59E0B', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Performance Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {performanceData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vibration Analysis */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Vibration Analysis</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.slice(-12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Bar 
                dataKey="vibration" 
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Multi-Metric Comparison */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Multi-Metric Overview</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
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
                dataKey="efficiency" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Efficiency (%)"
              />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Temperature (°C)"
              />
              <Line 
                type="monotone" 
                dataKey="vibration" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Vibration (mm/s)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">AI Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Efficiency Optimization",
              insight: "Peak efficiency occurs during 10-14h. Consider scheduling heavy operations during this window.",
              type: "recommendation",
              icon: "💡"
            },
            {
              title: "Maintenance Alert",
              insight: "Vibration levels increasing gradually. Schedule inspection within 72 hours.",
              type: "warning",
              icon: "⚠️"
            },
            {
              title: "Energy Savings",
              insight: "Power consumption is 15% lower than industry average. Excellent performance!",
              type: "positive",
              icon: "⚡"
            }
          ].map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-4 rounded-lg border
                ${insight.type === 'warning' 
                  ? 'border-yellow-500/30 bg-yellow-500/10' 
                  : insight.type === 'positive'
                  ? 'border-green-500/30 bg-green-500/10'
                  : 'border-blue-500/30 bg-blue-500/10'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{insight.icon}</div>
                <div>
                  <h5 className="font-medium text-white mb-2">{insight.title}</h5>
                  <p className="text-sm text-gray-300">{insight.insight}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===== Alternative: Pure CSS/Canvas Charts (No External Dependencies) =====

export const SimpleDataAnalytics = ({ digitalTwin, realTimeData }) => {
  const [timeRange, setTimeRange] = useState('24h');

  // Simple line chart component using CSS and Canvas
  const SimpleLineChart = ({ data, color = '#3B82F6', height = 200 }) => {
    const canvasRef = React.useRef(null);

    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !data.length) return;

      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Set up scaling
      const maxValue = Math.max(...data.map(d => d.value));
      const minValue = Math.min(...data.map(d => d.value));
      const valueRange = maxValue - minValue || 1;
      
      const xStep = width / (data.length - 1);
      
      // Draw grid lines
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Draw line
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      data.forEach((point, index) => {
        const x = index * xStep;
        const y = height - ((point.value - minValue) / valueRange) * height;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Draw points
      ctx.fillStyle = color;
      data.forEach((point, index) => {
        const x = index * xStep;
        const y = height - ((point.value - minValue) / valueRange) * height;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      
    }, [data, color]);

    return (
      <canvas
        ref={canvasRef}
        width={400}
        height={height}
        className="w-full"
        style={{ maxWidth: '100%' }}
      />
    );
  };

  // Generate sample data
  const generateChartData = (metric) => {
    const points = 24;
    return Array.from({ length: points }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      value: 50 + Math.random() * 50 + Math.sin(i / 4) * 20
    }));
  };

  const efficiencyData = generateChartData('efficiency');
  const temperatureData = generateChartData('temperature');
  const powerData = generateChartData('power');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-400">Performance insights for {digitalTwin.name}</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600"
        >
          <option value="24h">24 Hours</option>
          <option value="7d">7 Days</option>
          <option value="30d">30 Days</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Efficiency Trend</h4>
          <SimpleLineChart data={efficiencyData} color="#10B981" />
        </div>

        {/* Temperature Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Temperature Profile</h4>
          <SimpleLineChart data={temperatureData} color="#F59E0B" />
        </div>

        {/* Power Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Power Usage</h4>
          <SimpleLineChart data={powerData} color="#3B82F6" />
        </div>

        {/* Performance Metrics */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Key Metrics</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Average Efficiency</span>
              <span className="text-2xl font-bold text-green-400">87.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Peak Power</span>
              <span className="text-2xl font-bold text-blue-400">142 kW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Max Temperature</span>
              <span className="text-2xl font-bold text-orange-400">34.2°C</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active Alerts</span>
              <span className="text-2xl font-bold text-red-400">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};