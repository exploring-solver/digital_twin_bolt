import React from 'react';
import { motion } from 'framer-motion';

export const ConfigurationPanel = ({ twinConfig, onChange }) => {
  const handleInputChange = (field, value) => {
    onChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfigChange = (configField, value) => {
    onChange(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [configField]: value
      }
    }));
  };

  const getConfigFieldsForType = () => {
    switch (twinConfig.type) {
      case 'crane':
        return [
          { id: 'maxLoad', label: 'Maximum Load Capacity', type: 'number', unit: 'kg', defaultValue: 10000 },
          { id: 'maxHeight', label: 'Maximum Height', type: 'number', unit: 'm', defaultValue: 50 },
          { id: 'jibLength', label: 'Jib Length', type: 'number', unit: 'm', defaultValue: 40 },
          { id: 'operatingRadius', label: 'Operating Radius', type: 'number', unit: 'm', defaultValue: 35 }
        ];
      
      case 'building':
        return [
          { id: 'floors', label: 'Number of Floors', type: 'number', unit: '', defaultValue: 10 },
          { id: 'area', label: 'Total Area', type: 'number', unit: 'm²', defaultValue: 5000 },
          { id: 'occupancy', label: 'Max Occupancy', type: 'number', unit: 'people', defaultValue: 500 },
          { id: 'hvacZones', label: 'HVAC Zones', type: 'number', unit: '', defaultValue: 4 }
        ];
      
      case 'factory':
        return [
          { id: 'productionLines', label: 'Production Lines', type: 'number', unit: '', defaultValue: 3 },
          { id: 'maxCapacity', label: 'Max Capacity', type: 'number', unit: 'units/day', defaultValue: 1000 },
          { id: 'workstations', label: 'Workstations', type: 'number', unit: '', defaultValue: 20 },
          { id: 'qualityStations', label: 'Quality Control Stations', type: 'number', unit: '', defaultValue: 5 }
        ];
      
      case 'vehicle':
        return [
          { id: 'maxSpeed', label: 'Maximum Speed', type: 'number', unit: 'km/h', defaultValue: 120 },
          { id: 'fuelCapacity', label: 'Fuel Capacity', type: 'number', unit: 'L', defaultValue: 200 },
          { id: 'payload', label: 'Payload Capacity', type: 'number', unit: 'kg', defaultValue: 5000 },
          { id: 'range', label: 'Operating Range', type: 'number', unit: 'km', defaultValue: 800 }
        ];
      
      default:
        return [];
    }
  };

  const configFields = getConfigFieldsForType();

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Configure Your Digital Twin</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Basic Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Twin Name *
            </label>
            <input
              type="text"
              value={twinConfig.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter a descriptive name"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={twinConfig.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe this digital twin's purpose"
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={twinConfig.config?.location || ''}
              onChange={(e) => handleConfigChange('location', e.target.value)}
              placeholder="Physical location or site"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Technical Configuration */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Technical Configuration</h4>
          
          {configFields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {field.label} {field.unit && `(${field.unit})`}
              </label>
              <input
                type={field.type}
                value={twinConfig.config?.[field.id] || field.defaultValue}
                onChange={(e) => handleConfigChange(field.id, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-white mb-4">Advanced Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Collection Interval
            </label>
            <select
              value={twinConfig.config?.dataInterval || '1000'}
              onChange={(e) => handleConfigChange('dataInterval', e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="500">500ms</option>
              <option value="1000">1 second</option>
              <option value="5000">5 seconds</option>
              <option value="10000">10 seconds</option>
              <option value="30000">30 seconds</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Alert Sensitivity
            </label>
            <select
              value={twinConfig.config?.alertSensitivity || 'medium'}
              onChange={(e) => handleConfigChange('alertSensitivity', e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Retention
            </label>
            <select
              value={twinConfig.config?.dataRetention || '30'}
              onChange={(e) => handleConfigChange('dataRetention', e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};