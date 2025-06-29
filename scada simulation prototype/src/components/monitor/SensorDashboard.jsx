import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const SensorDashboard = ({ digitalTwin, sensorData, onSensorSelect, selectedSensor }) => {
  const [filterCategory, setFilterCategory] = useState('all');

  const getSensorCategories = () => {
    if (!sensorData) return [];
    
    const categories = Object.keys(sensorData).filter(key => key !== 'timestamp' && key !== 'systemHealth');
    return ['all', ...categories];
  };

  const getSensorCards = () => {
    if (!sensorData) return [];

    const cards = [];
    
    Object.entries(sensorData).forEach(([category, data]) => {
      if (category === 'timestamp' || category === 'systemHealth') return;
      
      if (filterCategory === 'all' || filterCategory === category) {
        Object.entries(data).forEach(([sensorName, value]) => {
          cards.push({
            id: `${category}_${sensorName}`,
            category,
            name: sensorName,
            value,
            unit: getSensorUnit(category, sensorName),
            status: getSensorStatus(category, sensorName, value),
            description: getSensorDescription(category, sensorName)
          });
        });
      }
    });

    return cards;
  };

  const getSensorUnit = (category, sensorName) => {
    const units = {
      environmental: {
        temperature: '°C',
        humidity: '%',
        windSpeed: 'm/s',
        windDirection: '°',
        vibration: 'mm/s'
      },
      motor: {
        hoistMotorTemp: '°C',
        trolleyMotorTemp: '°C',
        bridgeMotorTemp: '°C',
        motorVibration: 'mm/s',
        rpm: 'RPM',
        motorCurrent: 'A'
      },
      lifting: {
        loadWeight: 'kg',
        hookHeight: 'm',
        wireLength: 'm',
        tension: 'N',
        loadSwing: '°'
      },
      power: {
        voltage: 'V',
        current: 'A',
        powerFactor: '',
        frequency: 'Hz',
        totalPower: 'kW'
      }
    };
    
    return units[category]?.[sensorName] || '';
  };

  const getSensorStatus = (category, sensorName, value) => {
    // Define thresholds for different sensors
    const thresholds = {
      environmental: {
        temperature: { min: -10, max: 50 },
        windSpeed: { max: 25 },
        vibration: { max: 5.0 }
      },
      motor: {
        hoistMotorTemp: { max: 85 },
        trolleyMotorTemp: { max: 85 },
        bridgeMotorTemp: { max: 85 },
        motorVibration: { max: 8.0 }
      },
      lifting: {
        loadWeight: { max: 10000 },
        loadSwing: { max: 10 }
      },
      power: {
        voltage: { min: 440, max: 520 },
        frequency: { min: 58, max: 62 }
      }
    };

    const threshold = thresholds[category]?.[sensorName];
    if (!threshold) return 'normal';

    if (threshold.max && value > threshold.max) return 'critical';
    if (threshold.min && value < threshold.min) return 'critical';
    if (threshold.max && value > threshold.max * 0.8) return 'warning';
    
    return 'normal';
  };

  const getSensorDescription = (category, sensorName) => {
    const descriptions = {
      environmental: {
        temperature: 'Ambient temperature around the twin',
        humidity: 'Relative humidity percentage',
        windSpeed: 'Current wind speed measurement',
        vibration: 'Structural vibration levels'
      },
      motor: {
        hoistMotorTemp: 'Hoist motor operating temperature',
        trolleyMotorTemp: 'Trolley motor operating temperature',
        bridgeMotorTemp: 'Bridge motor operating temperature',
        motorVibration: 'Motor vibration measurement'
      },
      lifting: {
        loadWeight: 'Current load being lifted',
        hookHeight: 'Height of the hook above ground',
        wireLength: 'Extended wire rope length',
        tension: 'Wire rope tension force'
      }
    };
    
    return descriptions[category]?.[sensorName] || 'Sensor measurement';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      case 'normal': return 'border-green-500 bg-green-500/10 text-green-400';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  const categories = getSensorCategories();
  const sensorCards = getSensorCards();

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Sensor Dashboard</h3>
        
        {/* Category Filter */}
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`
                px-3 py-1 rounded-lg text-sm transition-colors
                ${filterCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sensorCards.map((sensor, index) => (
          <motion.div
            key={sensor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              p-4 rounded-lg border cursor-pointer transition-all hover:scale-105
              ${getStatusColor(sensor.status)}
              ${selectedSensor?.id === sensor.id ? 'ring-2 ring-blue-500' : ''}
            `}
            onClick={() => onSensorSelect(sensor)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white text-sm">
                {sensor.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
              <div className={`w-2 h-2 rounded-full ${
                sensor.status === 'critical' ? 'bg-red-500' :
                sensor.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
            </div>
            
            <div className="mb-2">
              <span className="text-2xl font-bold text-white">
                {typeof sensor.value === 'number' ? sensor.value.toFixed(1) : sensor.value}
              </span>
              {sensor.unit && (
                <span className="text-sm opacity-80 ml-1">{sensor.unit}</span>
              )}
            </div>
            
            <div className="text-xs opacity-60">
              {sensor.description}
            </div>
            
            <div className="text-xs mt-2 px-2 py-1 rounded bg-black/20">
              {sensor.category}
            </div>
          </motion.div>
        ))}
      </div>

      {sensorCards.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-lg mb-2">No sensor data available</div>
          <div className="text-sm">
            {!sensorData ? 'Waiting for connection...' : 'No sensors match the current filter'}
          </div>
        </div>
      )}
    </div>
  );
};

