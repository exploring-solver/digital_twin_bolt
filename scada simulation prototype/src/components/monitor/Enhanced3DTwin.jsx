// ===== Enhanced 3D Twin Visualization with Fixed Drag & Drop =====

// components/monitor/Enhanced3DTwin.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Html, TransformControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// Grid Helper for Snapping
const useGridSnap = (position, gridSize = 1, enabled = true) => {
  if (!enabled) return position;
  
  return [
    Math.round(position[0] / gridSize) * gridSize,
    Math.round(position[1] / gridSize) * gridSize,
    Math.round(position[2] / gridSize) * gridSize
  ];
};

// Draggable Sensor Component with Fixed Positioning
const DraggableSensor = ({ 
  sensor, 
  isEditMode, 
  onPositionChange, 
  onSensorClick, 
  isSelected,
  realTimeData,
  snapToGrid = true 
}) => {
  const meshRef = useRef();
  const transformRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(sensor.position || [0, 2, 0]);
  const { camera, gl } = useThree();

  useFrame((state) => {
    if (meshRef.current && !isDragging) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.setScalar(hovered ? 1.2 : isSelected ? 1.1 : 1);
    }
  });

  const handleTransformChange = useCallback(() => {
    if (meshRef.current && transformRef.current) {
      const position = meshRef.current.position;
      const newPosition = [position.x, position.y, position.z];
      
      // Apply grid snapping if enabled
      const snappedPosition = snapToGrid 
        ? useGridSnap(newPosition, 1, true)
        : newPosition;
      
      setCurrentPosition(snappedPosition);
      
      // Update the mesh position to snapped position
      if (snapToGrid) {
        meshRef.current.position.set(...snappedPosition);
      }
    }
  }, [snapToGrid]);

  const handleTransformEnd = useCallback(() => {
    setIsDragging(false);
    if (onPositionChange && currentPosition) {
      onPositionChange(sensor.id, currentPosition);
    }
  }, [sensor.id, currentPosition, onPositionChange]);

  const handleTransformStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const getColor = () => {
    if (!realTimeData) return '#60A5FA';
    const sensorRealTimeData = realTimeData[sensor.id];
    if (sensorRealTimeData?.status === 'critical' || sensor.status === 'critical') return '#EF4444';
    if (sensorRealTimeData?.status === 'warning' || sensor.status === 'warning') return '#F59E0B';
    return '#10B981';
  };

  const getSensorIcon = () => {
    const icons = {
      temperature: '🌡️',
      pressure: '⚡',
      vibration: '📳',
      camera: '📷',
      gps: '📍',
      load: '⚖️',
      motor: '⚙️',
      environmental: '🌿',
      safety: '🛡️'
    };
    return icons[sensor.type] || '📊';
  };

  return (
    <group position={currentPosition}>
      {isEditMode ? (
        <TransformControls
          ref={transformRef}
          object={meshRef}
          mode="translate"
          showX={true}
          showY={true}
          showZ={true}
          space="world"
          size={0.8}
          onMouseDown={handleTransformStart}
          onMouseUp={handleTransformEnd}
          onObjectChange={handleTransformChange}
        >
          <mesh
            ref={meshRef}
            onClick={(e) => {
              e.stopPropagation();
              onSensorClick(sensor);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHovered(false);
            }}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial 
              color={getColor()} 
              emissive={getColor()}
              emissiveIntensity={0.3}
              transparent
              opacity={0.9}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
        </TransformControls>
      ) : (
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSensorClick(sensor);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
          }}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial 
            color={getColor()} 
            emissive={getColor()}
            emissiveIntensity={0.2}
            transparent
            opacity={0.8}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      )}
      
      {hovered && (
        <Html center>
          <div className="bg-gray-800/95 text-white p-3 rounded-lg shadow-lg text-sm min-w-48 backdrop-blur-sm border border-gray-600">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{getSensorIcon()}</span>
              <span className="font-semibold">{sensor.name}</span>
            </div>
            <div className="space-y-1">
              <div>Type: <span className="text-blue-300">{sensor.type}</span></div>
              <div>Value: <span className="text-green-300">{realTimeData?.[sensor.id]?.value || 'N/A'} {sensor.unit}</span></div>
              <div>Status: <span className={`${
                (realTimeData?.[sensor.id]?.status || sensor.status) === 'critical' ? 'text-red-400' :
                (realTimeData?.[sensor.id]?.status || sensor.status) === 'warning' ? 'text-yellow-400' : 'text-green-400'
              }`}>{realTimeData?.[sensor.id]?.status || sensor.status || 'normal'}</span></div>
              <div className="text-xs text-gray-400">
                Position: ({currentPosition[0].toFixed(1)}, {currentPosition[1].toFixed(1)}, {currentPosition[2].toFixed(1)})
              </div>
              {isEditMode && <div className="text-blue-400">🔧 Drag to reposition</div>}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Enhanced Twin Model with Drag Support and Import Functionality
const EnhancedTwinModel = ({ 
  digitalTwin, 
  isEditMode, 
  onModelPositionChange,
  snapToGrid = true 
}) => {
  const modelRef = useRef();
  const transformRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(digitalTwin.config?.position || [0, 0, 0]);
  const [loadError, setLoadError] = useState(false);
  
  // Handle model transformations
  const handleTransformChange = useCallback(() => {
    if (modelRef.current && transformRef.current) {
      const position = modelRef.current.position;
      const newPosition = [position.x, position.y, position.z];
      
      // Apply grid snapping if enabled
      const snappedPosition = snapToGrid 
        ? useGridSnap(newPosition, 1, true)
        : newPosition;
      
      setCurrentPosition(snappedPosition);
      
      // Update the mesh position to snapped position
      if (snapToGrid) {
        modelRef.current.position.set(...snappedPosition);
      }
    }
  }, [snapToGrid]);

  const handleTransformEnd = useCallback(() => {
    setIsDragging(false);
    if (onModelPositionChange && currentPosition) {
      onModelPositionChange(currentPosition);
    }
  }, [currentPosition, onModelPositionChange]);

  const handleTransformStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  if (!digitalTwin.model_url || loadError) {
    return (
      <DefaultTwinModel 
        twinType={digitalTwin.type} 
        isEditMode={isEditMode}
        position={currentPosition}
        onPositionChange={onModelPositionChange}
        snapToGrid={snapToGrid}
      />
    );
  }

  try {
    const gltf = useLoader(GLTFLoader, digitalTwin.model_url);
    
    useFrame(() => {
      if (modelRef.current && !isDragging && !isEditMode) {
        modelRef.current.rotation.y += 0.001;
      }
    });

    const ModelContent = () => (
      <primitive 
        ref={modelRef}
        object={gltf.scene.clone()} 
        scale={digitalTwin.config?.scale || [1, 1, 1]}
        position={currentPosition}
        castShadow
        receiveShadow
      />
    );

    return isEditMode ? (
      <TransformControls
        ref={transformRef}
        object={modelRef}
        mode="translate"
        showX={true}
        showY={true}
        showZ={true}
        space="world"
        size={1.2}
        onMouseDown={handleTransformStart}
        onMouseUp={handleTransformEnd}
        onObjectChange={handleTransformChange}
      >
        <ModelContent />
      </TransformControls>
    ) : (
      <ModelContent />
    );
  } catch (error) {
    console.error('Failed to load 3D model:', error);
    setLoadError(true);
    return (
      <DefaultTwinModel 
        twinType={digitalTwin.type} 
        isEditMode={isEditMode}
        position={currentPosition}
        onPositionChange={onModelPositionChange}
        snapToGrid={snapToGrid}
      />
    );
  }
};

// Default Twin Model with Edit Support and Transform Controls
const DefaultTwinModel = ({ 
  twinType, 
  isEditMode, 
  position = [0, 0, 0], 
  onPositionChange,
  snapToGrid = true 
}) => {
  const meshRef = useRef();
  const transformRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(position);

  useFrame(() => {
    if (meshRef.current && !isEditMode && !isDragging) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  const handleTransformChange = useCallback(() => {
    if (meshRef.current && transformRef.current) {
      const position = meshRef.current.position;
      const newPosition = [position.x, position.y, position.z];
      
      // Apply grid snapping if enabled
      const snappedPosition = snapToGrid 
        ? useGridSnap(newPosition, 1, true)
        : newPosition;
      
      setCurrentPosition(snappedPosition);
      
      // Update the mesh position to snapped position
      if (snapToGrid) {
        meshRef.current.position.set(...snappedPosition);
      }
    }
  }, [snapToGrid]);

  const handleTransformEnd = useCallback(() => {
    setIsDragging(false);
    if (onPositionChange && currentPosition) {
      onPositionChange(currentPosition);
    }
  }, [currentPosition, onPositionChange]);

  const handleTransformStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const getModelGeometry = () => {
    const commonProps = {
      ref: meshRef,
      castShadow: true,
      receiveShadow: true
    };

    switch (twinType) {
      case 'crane':
        return (
          <group position={currentPosition}>
            {/* Base */}
            <mesh {...commonProps} position={[0, 0, 0]}>
              <cylinderGeometry args={[2, 2, 1, 8]} />
              <meshStandardMaterial color="#4B5563" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Mast */}
            <mesh position={[0, 8, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.3, 16, 8]} />
              <meshStandardMaterial color="#6B7280" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Jib */}
            <mesh position={[8, 15, 0]} rotation={[0, 0, 0.1]} castShadow receiveShadow>
              <boxGeometry args={[16, 0.5, 0.5]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.4} roughness={0.4} />
            </mesh>
            {/* Counter Jib */}
            <mesh position={[-4, 15, 0]} rotation={[0, 0, -0.05]} castShadow receiveShadow>
              <boxGeometry args={[8, 0.4, 0.4]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.4} roughness={0.4} />
            </mesh>
          </group>
        );

      case 'building':
        return (
          <group position={currentPosition}>
            {/* Main structure */}
            <mesh {...commonProps} position={[0, 5, 0]}>
              <boxGeometry args={[8, 10, 6]} />
              <meshStandardMaterial color="#6B7280" metalness={0.3} roughness={0.7} />
            </mesh>
            {/* Windows */}
            {Array.from({ length: 3 }, (_, i) => (
              <mesh key={i} position={[4.1, 2 + i * 3, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.1, 2, 4]} />
                <meshStandardMaterial 
                  color="#3B82F6" 
                  transparent 
                  opacity={0.7} 
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
            ))}
          </group>
        );

      case 'factory':
        return (
          <group position={currentPosition}>
            {/* Main building */}
            <mesh {...commonProps} position={[0, 3, 0]}>
              <boxGeometry args={[12, 6, 8]} />
              <meshStandardMaterial color="#6B7280" metalness={0.3} roughness={0.7} />
            </mesh>
            {/* Chimney */}
            <mesh position={[4, 8, 2]} castShadow receiveShadow>
              <cylinderGeometry args={[0.5, 0.5, 4, 8]} />
              <meshStandardMaterial color="#4B5563" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        );

      default:
        return (
          <mesh {...commonProps} position={currentPosition}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#6B7280" metalness={0.5} roughness={0.5} />
          </mesh>
        );
    }
  };

  const ModelContent = getModelGeometry();

  return isEditMode ? (
    <TransformControls
      ref={transformRef}
      object={meshRef}
      mode="translate"
      showX={true}
      showY={true}
      showZ={true}
      space="world"
      size={1.2}
      onMouseDown={handleTransformStart}
      onMouseUp={handleTransformEnd}
      onObjectChange={handleTransformChange}
    >
      {ModelContent}
    </TransformControls>
  ) : (
    ModelContent
  );
};

// Model Import Component
const ModelImportPanel = ({ isOpen, onClose, onModelImport, isEditMode }) => {
  const [modelUrl, setModelUrl] = useState('');
  const [modelFile, setModelFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.gltf') || file.name.endsWith('.glb'))) {
      setModelFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      alert('Please select a valid GLTF (.gltf) or GLB (.glb) file');
    }
  };

  const handleUrlImport = async () => {
    if (!modelUrl) return;
    
    setIsLoading(true);
    try {
      // Validate URL format
      const url = new URL(modelUrl);
      if (!url.pathname.endsWith('.gltf') && !url.pathname.endsWith('.glb')) {
        throw new Error('URL must point to a GLTF (.gltf) or GLB (.glb) file');
      }
      
      onModelImport({
        type: 'url',
        url: modelUrl,
        name: `Imported Model ${Date.now()}`,
        scale: [1, 1, 1],
        position: [0, 0, 0]
      });
      
      setModelUrl('');
      onClose();
    } catch (error) {
      alert(`Invalid URL: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileImport = async () => {
    if (!modelFile) return;
    
    setIsLoading(true);
    try {
      onModelImport({
        type: 'file',
        file: modelFile,
        url: previewUrl,
        name: modelFile.name.replace(/\.(gltf|glb)$/, ''),
        scale: [1, 1, 1],
        position: [0, 0, 0]
      });
      
      setModelFile(null);
      setPreviewUrl('');
      onClose();
    } catch (error) {
      alert(`Failed to import model: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const predefinedModels = [
    {
      name: 'Industrial Robot',
      url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
      description: 'Articulated industrial robot arm'
    },
    {
      name: 'Building Structure',
      url: 'https://threejs.org/examples/models/gltf/BoomBox/glTF/BoomBox.gltf',
      description: 'Modern building structure'
    },
    {
      name: 'Machinery Unit',
      url: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
      description: 'Industrial machinery component'
    }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-16 bottom-0 w-80 bg-gray-800/95 backdrop-blur-sm border-l border-gray-700 z-50 overflow-y-auto"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Import 3D Model</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {!isEditMode && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-300">
              Enter Edit Mode to import 3D models
            </p>
          </div>
        )}

        {isEditMode && (
          <div className="space-y-6">
            {/* URL Import */}
            <div>
              <h4 className="text-md font-medium text-white mb-3">Import from URL</h4>
              <div className="space-y-3">
                <input
                  type="url"
                  value={modelUrl}
                  onChange={(e) => setModelUrl(e.target.value)}
                  placeholder="https://example.com/model.gltf"
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleUrlImport}
                  disabled={!modelUrl || isLoading}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
                >
                  {isLoading ? 'Importing...' : 'Import from URL'}
                </button>
              </div>
            </div>

            {/* File Import */}
            <div>
              <h4 className="text-md font-medium text-white mb-3">Import from File</h4>
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".gltf,.glb"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  📁 Select GLTF/GLB File
                </button>
                {modelFile && (
                  <div className="bg-gray-700/50 rounded p-3">
                    <div className="text-sm text-white mb-2">Selected: {modelFile.name}</div>
                    <button
                      onClick={handleFileImport}
                      disabled={isLoading}
                      className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors"
                    >
                      {isLoading ? 'Importing...' : 'Import File'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Predefined Models */}
            <div>
              <h4 className="text-md font-medium text-white mb-3">Sample Models</h4>
              <div className="space-y-2">
                {predefinedModels.map((model, index) => (
                  <motion.div
                    key={index}
                    className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setModelUrl(model.url);
                      handleUrlImport();
                    }}
                  >
                    <h5 className="font-medium text-white text-sm">{model.name}</h5>
                    <p className="text-xs text-gray-400 mt-1">{model.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Import Guidelines */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <h5 className="text-sm font-medium text-blue-300 mb-2">Import Guidelines</h5>
              <ul className="text-xs text-blue-200 space-y-1">
                <li>• Supported formats: GLTF (.gltf) and GLB (.glb)</li>
                <li>• Models should be optimized for web use</li>
                <li>• Recommended size: &lt; 10MB for best performance</li>
                <li>• Models will be positioned at origin (0,0,0)</li>
                <li>• Use Edit Mode to reposition after import</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Enhanced Sensor Library with Better Categories
const SensorLibrary = ({ isOpen, onClose, onSensorAdd, isEditMode }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const sensorTypes = [
    { 
      id: 'temperature', 
      name: 'Temperature Sensor', 
      category: 'environmental',
      icon: '🌡️',
      description: 'Measures ambient temperature',
      unit: '°C',
      range: '-40 to 125°C',
      defaultPosition: [0, 2, 3]
    },
    { 
      id: 'pressure', 
      name: 'Pressure Sensor', 
      category: 'mechanical',
      icon: '⚡',
      description: 'Monitors pressure levels',
      unit: 'bar',
      range: '0 to 100 bar',
      defaultPosition: [2, 2, 0]
    },
    { 
      id: 'vibration', 
      name: 'Vibration Sensor', 
      category: 'mechanical',
      icon: '📳',
      description: 'Detects mechanical vibrations',
      unit: 'mm/s',
      range: '0 to 50 mm/s',
      defaultPosition: [-2, 2, 0]
    },
    { 
      id: 'camera', 
      name: 'Camera Sensor', 
      category: 'visual',
      icon: '📷',
      description: 'Visual monitoring and inspection',
      unit: 'fps',
      range: '1 to 60 fps',
      defaultPosition: [0, 5, 2]
    },
    { 
      id: 'gps', 
      name: 'GPS Sensor', 
      category: 'positioning',
      icon: '📍',
      description: 'Location tracking',
      unit: 'm',
      range: '±3m accuracy',
      defaultPosition: [0, 8, 0]
    },
    { 
      id: 'load', 
      name: 'Load Cell', 
      category: 'mechanical',
      icon: '⚖️',
      description: 'Weight and force measurement',
      unit: 'kg',
      range: '0 to 10,000 kg',
      defaultPosition: [0, 1, -2]
    },
    { 
      id: 'motor', 
      name: 'Motor Monitor', 
      category: 'electrical',
      icon: '⚙️',
      description: 'Motor performance tracking',
      unit: 'RPM',
      range: '0 to 3,600 RPM',
      defaultPosition: [3, 2, -1]
    },
    { 
      id: 'environmental', 
      name: 'Air Quality', 
      category: 'environmental',
      icon: '🌿',
      description: 'Air quality and humidity monitoring',
      unit: 'ppm',
      range: '0 to 1000 ppm',
      defaultPosition: [-3, 3, 1]
    },
    { 
      id: 'safety', 
      name: 'Safety Sensor', 
      category: 'safety',
      icon: '🛡️',
      description: 'Emergency and safety monitoring',
      unit: 'bool',
      range: 'On/Off',
      defaultPosition: [1, 4, -1]
    },
    {
      id: 'flow',
      name: 'Flow Sensor',
      category: 'fluid',
      icon: '💧',
      description: 'Fluid flow measurement',
      unit: 'L/min',
      range: '0 to 1000 L/min',
      defaultPosition: [-1, 2, 2]
    },
    {
      id: 'proximity',
      name: 'Proximity Sensor',
      category: 'positioning',
      icon: '📏',
      description: 'Object detection and distance',
      unit: 'cm',
      range: '0 to 200 cm',
      defaultPosition: [0, 3, -3]
    }
  ];

  const categories = ['all', 'environmental', 'mechanical', 'electrical', 'visual', 'positioning', 'safety', 'fluid'];

  const filteredSensors = sensorTypes.filter(sensor => {
    const matchesCategory = selectedCategory === 'all' || sensor.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSensorDrop = (sensorType) => {
    const newSensor = {
      id: `${sensorType.id}_${Date.now()}`,
      name: `${sensorType.name} ${Math.floor(Math.random() * 100)}`,
      type: sensorType.id,
      position: sensorType.defaultPosition || [Math.random() * 6 - 3, Math.random() * 4 + 2, Math.random() * 6 - 3],
      unit: sensorType.unit,
      range: sensorType.range,
      status: 'normal',
      config: {
        updateInterval: 1000,
        alertThresholds: {
          warning: 75,
          critical: 90
        },
        calibration: {
          offset: 0,
          scale: 1
        }
      }
    };
    onSensorAdd(newSensor);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      className="fixed left-0 top-16 bottom-0 w-80 bg-gray-800/95 backdrop-blur-sm border-r border-gray-700 z-50 overflow-y-auto"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Sensor Library</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sensors..."
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)} 
                {category === 'all' ? ` (${sensorTypes.length})` : ` (${sensorTypes.filter(s => s.category === category).length})`}
              </option>
            ))}
          </select>
        </div>

        {/* Sensor List */}
        <div className="space-y-3">
          {filteredSensors.length > 0 ? (
            filteredSensors.map(sensor => (
              <motion.div
                key={sensor.id}
                className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => isEditMode && handleSensorDrop(sensor)}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{sensor.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">{sensor.name}</h4>
                    <p className="text-xs text-gray-400 capitalize">{sensor.category}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-300 mb-2">{sensor.description}</p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Unit: {sensor.unit}</span>
                  <span>Range: {sensor.range}</span>
                </div>
                {isEditMode && (
                  <div className="mt-2 text-xs text-blue-400">
                    ✨ Click to add to scene
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p>No sensors found matching your criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {!isEditMode && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-300">
              💡 Enter Edit Mode to add sensors to your digital twin
            </p>
          </div>
        )}

        {isEditMode && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <h5 className="text-sm font-medium text-green-300 mb-2">Edit Mode Tips</h5>
            <ul className="text-xs text-green-200 space-y-1">
              <li>• Click sensors to add them to the scene</li>
              <li>• Drag sensors to reposition them</li>
              <li>• Positions snap to grid for precision</li>
              <li>• Don't forget to save your changes</li>
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Main Enhanced 3D Twin Component
export const Enhanced3DTwin = ({ 
  digitalTwin, 
  sensorData, 
  onSensorSelect,
  onSensorPositionUpdate,
  onSensorAdd,
  onModelPositionUpdate,
  onModelImport,
  onSave
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [showSensorLibrary, setShowSensorLibrary] = useState(false);
  const [showModelImport, setShowModelImport] = useState(false);
  const [sensors, setSensors] = useState(digitalTwin.sensors || []);
  const [twinConfig, setTwinConfig] = useState(digitalTwin.config || {});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const handleSensorClick = (sensor) => {
    setSelectedSensor(sensor);
    if (onSensorSelect) {
      onSensorSelect(sensor);
    }
  };

  const handleSensorPositionChange = (sensorId, newPosition) => {
    setSensors(prev => prev.map(sensor => 
      sensor.id === sensorId 
        ? { ...sensor, position: newPosition }
        : sensor
    ));
    setHasUnsavedChanges(true);
    
    if (onSensorPositionUpdate) {
      onSensorPositionUpdate(sensorId, newPosition);
    }
  };

  const handleSensorAdd = (newSensor) => {
    setSensors(prev => [...prev, newSensor]);
    setHasUnsavedChanges(true);
    
    if (onSensorAdd) {
      onSensorAdd(newSensor);
    }
  };

  const handleSensorDelete = (sensorId) => {
    setSensors(prev => prev.filter(sensor => sensor.id !== sensorId));
    setHasUnsavedChanges(true);
    if (selectedSensor?.id === sensorId) {
      setSelectedSensor(null);
    }
  };

  const handleModelPositionChange = (newPosition) => {
    setTwinConfig(prev => ({
      ...prev,
      position: newPosition
    }));
    setHasUnsavedChanges(true);
    
    if (onModelPositionUpdate) {
      onModelPositionUpdate(newPosition);
    }
  };

  const handleModelImport = (modelData) => {
    const updatedTwin = {
      ...digitalTwin,
      model_url: modelData.url,
      config: {
        ...twinConfig,
        position: modelData.position,
        scale: modelData.scale,
        imported: true,
        importedAt: new Date().toISOString()
      }
    };
    
    setTwinConfig(updatedTwin.config);
    setHasUnsavedChanges(true);
    
    if (onModelImport) {
      onModelImport(modelData);
    }
  };

  const handleSave = async () => {
    try {
      const updatedTwin = {
        ...digitalTwin,
        sensors: sensors,
        config: twinConfig,
        lastModified: new Date().toISOString()
      };

      if (onSave) {
        await onSave(updatedTwin);
      }
      
      setHasUnsavedChanges(false);
      setIsEditMode(false);
      console.log('Twin configuration saved successfully');
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = '✅ Configuration saved successfully!';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
      
    } catch (error) {
      console.error('Failed to save twin configuration:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = '❌ Failed to save configuration';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    }
  };

  const handleCancel = () => {
    setSensors(digitalTwin.sensors || []);
    setTwinConfig(digitalTwin.config || {});
    setHasUnsavedChanges(false);
    setIsEditMode(false);
    setShowSensorLibrary(false);
    setShowModelImport(false);
    setSelectedSensor(null);
  };

  const handleExport = () => {
    const exportData = {
      digitalTwin: {
        ...digitalTwin,
        sensors: sensors,
        config: twinConfig
      },
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${digitalTwin.name || 'digital-twin'}-config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [20, 15, 20], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}
        shadows
      >
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={50}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        <pointLight position={[0, 20, 0]} intensity={0.5} color="#60A5FA" />
        <pointLight position={[-10, 10, 10]} intensity={0.3} color="#F59E0B" />

        <Environment preset="city" />

        {/* Ground with better materials */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial 
            color="#1F2937" 
            metalness={0.1}
            roughness={0.9}
          />
        </mesh>

        {/* Enhanced Grid */}
        {showGrid && (
          <>
            <gridHelper 
              args={[50, 50, '#374151', '#374151']} 
              position={[0, -0.9, 0]} 
            />
            {snapToGrid && isEditMode && (
              <gridHelper 
                args={[20, 20, '#60A5FA', '#60A5FA']} 
                position={[0, -0.85, 0]} 
              />
            )}
          </>
        )}

        {/* Twin Model */}
        <EnhancedTwinModel 
          digitalTwin={{...digitalTwin, config: twinConfig}}
          isEditMode={isEditMode}
          onModelPositionChange={handleModelPositionChange}
          snapToGrid={snapToGrid}
        />

        {/* Sensors */}
        {sensors.map((sensor) => (
          <DraggableSensor
            key={sensor.id}
            sensor={sensor}
            isEditMode={isEditMode}
            onPositionChange={handleSensorPositionChange}
            onSensorClick={handleSensorClick}
            isSelected={selectedSensor?.id === sensor.id}
            realTimeData={sensorData}
            snapToGrid={snapToGrid}
          />
        ))}

        {/* Controls */}
        <OrbitControls 
          enabled={!isEditMode || selectedSensor === null}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={100}
          dampingFactor={0.05}
          enableDamping={true}
        />

        {/* Twin Label with enhanced styling */}
        <Text
          position={[0, 25, 0]}
          fontSize={2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          {digitalTwin.name}
        </Text>

        {/* Status indicator */}
        <Text
          position={[0, 22, 0]}
          fontSize={0.8}
          color={isEditMode ? "#F59E0B" : "#10B981"}
          anchorX="center"
          anchorY="middle"
        >
          {isEditMode ? "🔧 EDIT MODE" : "👁️ VIEW MODE"}
        </Text>
      </Canvas>

      {/* Enhanced Edit Mode Controls */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 text-white border border-gray-700">
          <h4 className="font-semibold mb-3 flex items-center">
            {isEditMode ? '🔧 Edit Mode' : '👁️ View Mode'}
            <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded">
              {sensors.length} sensors
            </span>
          </h4>
          
          <div className="space-y-2">
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center justify-center"
              >
                ✏️ Enter Edit Mode
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowSensorLibrary(!showSensorLibrary)}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm"
                  >
                    📊 Sensors
                  </button>
                  <button
                    onClick={() => setShowModelImport(!showModelImport)}
                    className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-sm"
                  >
                    🎲 Models
                  </button>
                </div>

                {/* Edit Mode Options */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={snapToGrid}
                      onChange={(e) => setSnapToGrid(e.target.checked)}
                      className="rounded"
                    />
                    <span>Snap to Grid</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={(e) => setShowGrid(e.target.checked)}
                      className="rounded"
                    />
                    <span>Show Grid</span>
                  </label>
                </div>
                
                {hasUnsavedChanges ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm font-medium"
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-sm"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-sm"
                    >
                      👁️ View Mode
                    </button>
                    <button
                      onClick={handleExport}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
                    >
                      📤
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!isEditMode ? (
            <div className="mt-3 space-y-1 text-sm text-gray-300">
              <div>🖱️ Drag to rotate view</div>
              <div>🔍 Scroll to zoom in/out</div>
              <div>📍 Click sensors for details</div>
            </div>
          ) : (
            <div className="mt-3 space-y-1 text-sm text-gray-300">
              <div>🔧 Drag objects to reposition</div>
              <div>➕ Add sensors & models</div>
              <div>💾 Save when finished</div>
            </div>
          )}
        </div>

        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-yellow-300"
          >
            <div className="text-sm font-medium flex items-center">
              ⚠️ Unsaved Changes
              <span className="ml-auto text-xs bg-yellow-500/30 px-2 py-1 rounded">
                {sensors.length} sensors
              </span>
            </div>
            <div className="text-xs mt-1">Don't forget to save your modifications</div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Sensor Info Panel */}
      {selectedSensor && !isEditMode && (
        <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm border border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl">
              {selectedSensor.type === 'temperature' && '🌡️'}
              {selectedSensor.type === 'pressure' && '⚡'}
              {selectedSensor.type === 'vibration' && '📳'}
              {selectedSensor.type === 'camera' && '📷'}
              {selectedSensor.type === 'gps' && '📍'}
              {selectedSensor.type === 'load' && '⚖️'}
              {selectedSensor.type === 'motor' && '⚙️'}
              {selectedSensor.type === 'environmental' && '🌿'}
              {selectedSensor.type === 'safety' && '🛡️'}
              {selectedSensor.type === 'flow' && '💧'}
              {selectedSensor.type === 'proximity' && '📏'}
            </span>
            <div className="flex-1">
              <h4 className="font-semibold">{selectedSensor.name}</h4>
              <div className="text-xs text-gray-400 capitalize">{selectedSensor.type} sensor</div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={`font-medium ${
                (sensorData?.[selectedSensor.id]?.status || selectedSensor.status) === 'critical' ? 'text-red-400' :
                (sensorData?.[selectedSensor.id]?.status || selectedSensor.status) === 'warning' ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {sensorData?.[selectedSensor.id]?.status || selectedSensor.status || 'normal'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Current Value:</span>
              <span className="font-mono">{sensorData?.[selectedSensor.id]?.value || 'N/A'} {selectedSensor.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Range:</span>
              <span className="text-xs font-mono">{selectedSensor.range}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Position:</span>
              <span className="text-xs font-mono">
                ({selectedSensor.position[0].toFixed(1)}, {selectedSensor.position[1].toFixed(1)}, {selectedSensor.position[2].toFixed(1)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Update:</span>
              <span className="text-xs">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => setSelectedSensor(null)}
              className="flex-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              Close
            </button>
            <button
              onClick={() => {
                setIsEditMode(true);
                setSelectedSensor(null);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Delete sensor option in edit mode */}
      {selectedSensor && isEditMode && (
        <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 text-white border border-gray-700">
          <h5 className="font-medium mb-2">Selected: {selectedSensor.name}</h5>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedSensor(null)}
              className="flex-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
            >
              Deselect
            </button>
            <button
              onClick={() => handleSensorDelete(selectedSensor.id)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}

      {/* Sensor Library */}
      <AnimatePresence>
        {showSensorLibrary && (
          <SensorLibrary
            isOpen={showSensorLibrary}
            onClose={() => setShowSensorLibrary(false)}
            onSensorAdd={handleSensorAdd}
            isEditMode={isEditMode}
          />
        )}
      </AnimatePresence>

      {/* Model Import Panel */}
      <AnimatePresence>
        {showModelImport && (
          <ModelImportPanel
            isOpen={showModelImport}
            onClose={() => setShowModelImport(false)}
            onModelImport={handleModelImport}
            isEditMode={isEditMode}
          />
        )}
      </AnimatePresence>

      {/* Performance stats (development mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white p-2 rounded text-xs font-mono">
          <div>Sensors: {sensors.length}</div>
          <div>Edit Mode: {isEditMode ? 'ON' : 'OFF'}</div>
          <div>Grid Snap: {snapToGrid ? 'ON' : 'OFF'}</div>
          <div>Unsaved: {hasUnsavedChanges ? 'YES' : 'NO'}</div>
        </div>
      )}
    </div>
  );
};