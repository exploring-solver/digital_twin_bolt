import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Html } from '@react-three/drei';
import { CraneModel } from './CraneModel';
import { SensorOverlay } from './SensorOverlay';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import * as THREE from 'three';

interface CraneVisualizationProps {
  sensorData: any;
}

export const CraneVisualization: React.FC<CraneVisualizationProps> = ({ 
  sensorData
}) => {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-slate-900 to-slate-800">
      {/* 3D Canvas */}
      <Canvas
        camera={{ 
          position: [20, 15, 20], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        shadows
        gl={{ 
          antialias: true,
          alpha: true,
          shadowMap: { enabled: true }
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 20, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />
          
          {/* Environment */}
          <Environment preset="warehouse" />
          
          {/* Ground Grid */}
          <Grid 
            args={[50, 50]} 
            position={[0, -0.1, 0]}
            cellSize={2}
            cellThickness={0.5}
            cellColor="#1e293b"
            sectionSize={10}
            sectionThickness={1}
            sectionColor="#334155"
            fadeDistance={30}
            fadeStrength={1}
          />
          
          {/* Crane Model */}
          <CraneModel sensorData={sensorData} />
          
          {/* Sensor Overlays */}
          <SensorOverlay sensorData={sensorData} />
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={100}
            maxPolarAngle={Math.PI / 2}
            target={[0, 10, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Controls Help */}
      <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm text-slate-300 p-4 rounded-lg max-w-xs">
        <h4 className="text-sm font-medium text-white mb-2">Controls</h4>
        <div className="text-xs space-y-1">
          <p><span className="text-blue-400">Left Click + Drag:</span> Rotate view</p>
          <p><span className="text-blue-400">Scroll:</span> Zoom in/out</p>
          <p><span className="text-blue-400">Right Click + Drag:</span> Pan view</p>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
        <p className="text-sm font-medium">3D Visualization</p>
        <p className="text-xs opacity-80">Real-time crane monitoring</p>
      </div>
    </div>
  );
};

const LoadingFallback = () => (
  <Html center>
    <LoadingSpinner />
  </Html>
);