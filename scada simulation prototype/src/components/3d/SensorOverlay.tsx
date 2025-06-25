import React from 'react';
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';

interface SensorOverlayProps {
  sensorData: any;
}

export const SensorOverlay: React.FC<SensorOverlayProps> = ({ sensorData }) => {
  const sensorPoints = [
    {
      position: [0, 22, 0] as [number, number, number],
      type: 'environmental',
      label: 'Environmental',
      data: sensorData?.environmental
    },
    {
      position: [0, 12, 0] as [number, number, number],
      type: 'motor',
      label: 'Motor Status',
      data: sensorData?.motor
    },
    {
      position: [0, 8, 0] as [number, number, number],
      type: 'lifting',
      label: 'Lifting System',
      data: sensorData?.lifting
    },
    {
      position: [-12, 20, 0] as [number, number, number],
      type: 'power',
      label: 'Power System',
      data: sensorData?.power
    }
  ];

  const getStatusColor = (type: string) => {
    if (!sensorData) return 'bg-gray-500';
    
    switch (type) {
      case 'environmental':
        const temp = sensorData.environmental?.temperature || 0;
        return temp > 40 ? 'bg-red-500' : temp > 30 ? 'bg-yellow-500' : 'bg-green-500';
      
      case 'motor':
        const motorTemp = Math.max(
          sensorData.motor?.hoistMotorTemp || 0,
          sensorData.motor?.trolleyMotorTemp || 0,
          sensorData.motor?.bridgeMotorTemp || 0
        );
        return motorTemp > 80 ? 'bg-red-500' : motorTemp > 70 ? 'bg-yellow-500' : 'bg-green-500';
      
      case 'lifting':
        const loadWeight = sensorData.lifting?.loadWeight || 0;
        return loadWeight > 8000 ? 'bg-red-500' : loadWeight > 5000 ? 'bg-yellow-500' : 'bg-green-500';
      
      case 'power':
        const voltage = sensorData.power?.voltage || 0;
        return voltage < 440 || voltage > 520 ? 'bg-red-500' : 'bg-green-500';
      
      default:
        return 'bg-gray-500';
    }
  };

  const formatSensorData = (type: string, data: any) => {
    if (!data) return [];
    
    switch (type) {
      case 'environmental':
        return [
          `Temp: ${data.temperature?.toFixed(1) || 0}°C`,
          `Humidity: ${data.humidity?.toFixed(1) || 0}%`,
          `Wind: ${data.windSpeed?.toFixed(1) || 0} m/s`
        ];
      
      case 'motor':
        return [
          `Hoist: ${data.hoistMotorTemp?.toFixed(1) || 0}°C`,
          `Trolley: ${data.trolleyMotorTemp?.toFixed(1) || 0}°C`,
          `Bridge: ${data.bridgeMotorTemp?.toFixed(1) || 0}°C`
        ];
      
      case 'lifting':
        return [
          `Load: ${data.loadWeight?.toFixed(0) || 0} kg`,
          `Height: ${data.hookHeight?.toFixed(1) || 0} m`,
          `Swing: ${data.loadSwing?.toFixed(1) || 0}°`
        ];
      
      case 'power':
        return [
          `${data.voltage?.toFixed(0) || 0}V`,
          `${data.current?.toFixed(1) || 0}A`,
          `${data.totalPower?.toFixed(1) || 0}kW`
        ];
      
      default:
        return [];
    }
  };

  return (
    <>
      {sensorPoints.map((point, index) => (
        <group key={index}>
          {/* Sensor Point Marker */}
          <mesh position={point.position}>
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial 
              color={point.type === 'environmental' ? '#3B82F6' : 
                    point.type === 'motor' ? '#8B5CF6' : 
                    point.type === 'lifting' ? '#10B981' : '#F59E0B'} 
            />
          </mesh>
          
          {/* HTML Overlay */}
          <Html
            position={[point.position[0] + 1, point.position[1] + 1, point.position[2]]}
            style={{
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg p-3 min-w-[200px] shadow-xl"
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(point.type)} animate-pulse`}></div>
                <h4 className="text-white font-medium text-sm">{point.label}</h4>
              </div>
              
              <div className="space-y-1">
                {formatSensorData(point.type, point.data).map((line, i) => (
                  <p key={i} className="text-slate-300 text-xs font-mono">{line}</p>
                ))}
              </div>
              
              <div className="text-xs text-slate-400 mt-2">
                {sensorData?.timestamp ? 
                  new Date(sensorData.timestamp).toLocaleTimeString() : 
                  'No data'
                }
              </div>
            </motion.div>
          </Html>
        </group>
      ))}
    </>
  );
};