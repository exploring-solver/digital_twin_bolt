import React from 'react';
import { SensorGrid } from './SensorGrid';
import { SystemOverview } from './SystemOverview';
import { TrendCharts } from './TrendCharts';
import { motion } from 'framer-motion';

interface SensorDashboardProps {
  sensorData: any;
}

export const SensorDashboard: React.FC<SensorDashboardProps> = ({ sensorData }) => {
  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* System Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SystemOverview sensorData={sensorData} />
      </motion.div>

      {/* Sensor Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <SensorGrid sensorData={sensorData} />
      </motion.div>

      {/* Trend Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TrendCharts sensorData={sensorData} />
      </motion.div>
    </div>
  );
};