import React from 'react';
import { motion } from 'framer-motion';

export const TemplateSelector = ({ selectedType, onSelect }) => {
  const templates = [
    {
      type: 'crane',
      name: 'Industrial Crane',
      description: 'Monitor lifting operations, motor health, and safety systems',
      icon: '🏗️',
      sensors: ['Lifting', 'Motor', 'Environmental', 'Safety', 'Structural'],
      preview: '/images/crane-preview.jpg'
    },
    {
      type: 'building',
      name: 'Smart Building',
      description: 'Track HVAC, occupancy, energy consumption, and security',
      icon: '🏢',
      sensors: ['HVAC', 'Occupancy', 'Energy', 'Security', 'Environmental'],
      preview: '/images/building-preview.jpg'
    },
    {
      type: 'factory',
      name: 'Manufacturing Plant',
      description: 'Monitor production lines, quality control, and safety',
      icon: '🏭',
      sensors: ['Production', 'Quality', 'Safety', 'Environmental', 'Energy'],
      preview: '/images/factory-preview.jpg'
    },
    {
      type: 'vehicle',
      name: 'Fleet Vehicle',
      description: 'Track location, performance, fuel, and maintenance',
      icon: '🚛',
      sensors: ['GPS', 'Engine', 'Fuel', 'Maintenance', 'Safety'],
      preview: '/images/vehicle-preview.jpg'
    }
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">
        Choose a Digital Twin Template
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <motion.div
            key={template.type}
            className={`
              relative p-6 rounded-lg border-2 cursor-pointer transition-all
              ${selectedType === template.type
                ? 'border-blue-500 bg-blue-900/30'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }
            `}
            onClick={() => onSelect(template.type)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{template.icon}</div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-white mb-2">
                  {template.name}
                </h4>
                <p className="text-gray-300 mb-4">
                  {template.description}
                </p>
                
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-400 mb-2">
                    Included Sensors:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {template.sensors.map(sensor => (
                      <span
                        key={sensor}
                        className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded"
                      >
                        {sensor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {selectedType === template.type && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};