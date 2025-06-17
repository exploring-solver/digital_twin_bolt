import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import ModelLoader from './ModelLoader'
import DeviceMapper from './DeviceMapper'

/**
 * Main 3D scene canvas component
 * Renders the industrial environment with real-time data visualization
 */
function SceneCanvas() {
  return (
    <Canvas
      camera={{ position: [10, 8, 10], fov: 60 }}
      shadows
      className="w-full h-full"
    >
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Environment and controls */}
      <Environment preset="warehouse" />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      
      {/* Grid floor */}
      <Grid
        position={[0, -0.01, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6366f1"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#8b5cf6"
        fadeDistance={25}
        fadeStrength={1}
      />
      
      {/* 3D Models and device mapping */}
      <Suspense fallback={<LoadingIndicator />}>
        <ModelLoader />
        <DeviceMapper />
      </Suspense>
    </Canvas>
  )
}

/**
 * Loading indicator for 3D assets
 */
function LoadingIndicator() {
  return (
    <mesh position={[0, 2, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6366f1" />
    </mesh>
  )
}

export default SceneCanvas