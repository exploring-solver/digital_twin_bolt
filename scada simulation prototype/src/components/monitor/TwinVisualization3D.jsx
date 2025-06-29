// components/monitor/TwinVisualization3D.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

// Sensor visualization component
const SensorMarker = ({ position, sensorData, onClick, isSelected }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.setScalar(hovered ? 1.2 : isSelected ? 1.1 : 1);
    }
  });

  const getColor = () => {
    if (!sensorData) return '#60A5FA';
    if (sensorData.status === 'critical') return '#EF4444';
    if (sensorData.status === 'warning') return '#F59E0B';
    return '#10B981';
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color={getColor()} 
          emissive={getColor()}
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {hovered && (
        <Html>
          <div className="bg-gray-800 text-white p-2 rounded shadow-lg text-sm">
            <div className="font-semibold">{sensorData?.name}</div>
            <div>{sensorData?.value} {sensorData?.unit}</div>
          </div>
        </Html>
      )}
    </group>
  );
};

// 3D Model loader component
const TwinModel = ({ modelUrl, twinType }) => {
  const modelRef = useRef();
  
  // Fallback to basic geometry if no model URL
  if (!modelUrl) {
    return <DefaultTwinModel twinType={twinType} />;
  }

  try {
    const gltf = useLoader(GLTFLoader, modelUrl);
    
    useFrame(() => {
      if (modelRef.current) {
        // Add subtle rotation or animation
        modelRef.current.rotation.y += 0.001;
      }
    });

    return (
      <primitive 
        ref={modelRef}
        object={gltf.scene} 
        scale={[1, 1, 1]}
        position={[0, 0, 0]}
      />
    );
  } catch (error) {
    console.error('Failed to load 3D model:', error);
    return <DefaultTwinModel twinType={twinType} />;
  }
};

// Default geometric representations
const DefaultTwinModel = ({ twinType }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  switch (twinType) {
    case 'crane':
      return (
        <group ref={meshRef}>
          {/* Base */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[2, 2, 1, 8]} />
            <meshStandardMaterial color="#4B5563" />
          </mesh>
          {/* Mast */}
          <mesh position={[0, 8, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 16, 8]} />
            <meshStandardMaterial color="#6B7280" />
          </mesh>
          {/* Jib */}
          <mesh position={[8, 15, 0]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[16, 0.5, 0.5]} />
            <meshStandardMaterial color="#F59E0B" />
          </mesh>
          {/* Counter jib */}
          <mesh position={[-4, 15, 0]} rotation={[0, 0, -0.05]}>
            <boxGeometry args={[8, 0.4, 0.4]} />
            <meshStandardMaterial color="#F59E0B" />
          </mesh>
        </group>
      );

    case 'building':
      return (
        <group ref={meshRef}>
          <mesh position={[0, 5, 0]}>
            <boxGeometry args={[8, 10, 6]} />
            <meshStandardMaterial color="#6B7280" />
          </mesh>
          {/* Windows */}
          {Array.from({ length: 3 }, (_, i) => (
            <mesh key={i} position={[4.1, 2 + i * 3, 0]}>
              <boxGeometry args={[0.1, 2, 4]} />
              <meshStandardMaterial color="#3B82F6" transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      );

    case 'factory':
      return (
        <group ref={meshRef}>
          <mesh position={[0, 3, 0]}>
            <boxGeometry args={[12, 6, 8]} />
            <meshStandardMaterial color="#6B7280" />
          </mesh>
          {/* Smokestack */}
          <mesh position={[4, 8, 2]}>
            <cylinderGeometry args={[0.5, 0.5, 4, 8]} />
            <meshStandardMaterial color="#4B5563" />
          </mesh>
        </group>
      );

    default:
      return (
        <mesh ref={meshRef}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#6B7280" />
        </mesh>
      );
  }
};

export const TwinVisualization3D = ({ digitalTwin, sensorData, onSensorSelect }) => {
  const [selectedSensor, setSelectedSensor] = useState(null);

  const getSensorPositions = () => {
    // Default sensor positions based on twin type
    const positions = {
      crane: [
        { id: 'load_sensor', position: [8, 10, 0], name: 'Load Sensor' },
        { id: 'motor_temp', position: [0, 2, 0], name: 'Motor Temperature' },
        { id: 'wind_sensor', position: [0, 20, 0], name: 'Wind Sensor' },
        { id: 'vibration', position: [0, 8, 0], name: 'Vibration Sensor' }
      ],
      building: [
        { id: 'hvac_temp', position: [2, 8, 2], name: 'HVAC Temperature' },
        { id: 'occupancy', position: [0, 1, 0], name: 'Occupancy Sensor' },
        { id: 'energy_meter', position: [-3, 0, -2], name: 'Energy Meter' },
        { id: 'air_quality', position: [3, 6, 3], name: 'Air Quality' }
      ],
      factory: [
        { id: 'production_line', position: [4, 1, 0], name: 'Production Line' },
        { id: 'quality_control', position: [-4, 1, 0], name: 'Quality Control' },
        { id: 'safety_system', position: [0, 4, 0], name: 'Safety System' },
        { id: 'environmental', position: [0, 7, 0], name: 'Environmental' }
      ]
    };

    return positions[digitalTwin.type] || [];
  };

  const handleSensorClick = (sensor) => {
    setSelectedSensor(sensor);
    if (onSensorSelect) {
      onSensorSelect(sensor);
    }
  };

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [20, 15, 20], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 20, 0]} intensity={0.5} color="#60A5FA" />

        {/* Environment */}
        <Environment preset="city" />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#1F2937" />
        </mesh>

        {/* Grid */}
        <gridHelper args={[50, 50, '#374151', '#374151']} position={[0, -0.9, 0]} />

        {/* Twin Model */}
        <TwinModel modelUrl={digitalTwin.model_url} twinType={digitalTwin.type} />

        {/* Sensor Markers */}
        {getSensorPositions().map((sensor) => (
          <SensorMarker
            key={sensor.id}
            position={sensor.position}
            sensorData={{ ...sensor, status: 'normal', value: '25.4', unit: '°C' }}
            onClick={() => handleSensorClick(sensor)}
            isSelected={selectedSensor?.id === sensor.id}
          />
        ))}

        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={100}
        />

        {/* Twin Label */}
        <Text
          position={[0, 25, 0]}
          fontSize={2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          {digitalTwin.name}
        </Text>
      </Canvas>

      {/* Controls Panel */}
      <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 text-white">
        <h4 className="font-semibold mb-2">3D Controls</h4>
        <div className="space-y-1 text-sm text-gray-300">
          <div>🖱️ Drag to rotate</div>
          <div>🔍 Scroll to zoom</div>
          <div>📍 Click sensors for details</div>
        </div>
      </div>

      {/* Sensor Info Panel */}
      {selectedSensor && (
        <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm">
          <h4 className="font-semibold mb-2">{selectedSensor.name}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400">Normal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Value:</span>
              <span>25.4°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Update:</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedSensor(null)}
            className="mt-3 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
