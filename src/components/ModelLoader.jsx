import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Cylinder, Sphere } from '@react-three/drei'
import { useDigitalTwinStore } from '../store/digitalTwinStore'

/**
 * Loads and manages 3D models for industrial equipment
 * Uses placeholder geometries until GLB models are available
 */
function ModelLoader() {
  const { devices, sceneObjects } = useDigitalTwinStore()
  
  return (
    <group>
      {/* Pump Station */}
      <PumpModel position={[-5, 0, 0]} deviceId="pump_001" />
      
      {/* Pressure Vessel */}
      <PressureVessel position={[0, 0, 0]} deviceId="vessel_001" />
      
      {/* Flow Meter */}
      <FlowMeter position={[5, 0, 0]} deviceId="flow_001" />
      
      {/* Pipe Network */}
      <PipeNetwork />
    </group>
  )
}

/**
 * Pump model with real-time status visualization
 */
function PumpModel({ position, deviceId }) {
  const meshRef = useRef()
  const { getSensorStatus, sensors } = useDigitalTwinStore()
  
  // Get associated sensor data
  const tempSensor = sensors[`${deviceId}_temp`]
  const status = getSensorStatus(`${deviceId}_temp`)
  
  // Animate based on pump status
  useFrame((state) => {
    if (meshRef.current && tempSensor?.value > 50) {
      meshRef.current.rotation.y += 0.02
    }
  })
  
  // Color based on status
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return '#ef4444'
      case 'warning': return '#f59e0b'
      case 'normal': return '#10b981'
      default: return '#6b7280'
    }
  }
  
  return (
    <group position={position}>
      {/* Pump body */}
      <Cylinder ref={meshRef} args={[1, 1, 2]} position={[0, 1, 0]}>
        <meshStandardMaterial color={getStatusColor()} />
      </Cylinder>
      
      {/* Base */}
      <Box args={[2.5, 0.2, 2.5]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#374151" />
      </Box>
      
      {/* Status indicator */}
      <Sphere args={[0.1]} position={[0, 2.5, 0]}>
        <meshStandardMaterial 
          color={getStatusColor()} 
          emissive={getStatusColor()}
          emissiveIntensity={0.3}
        />
      </Sphere>
    </group>
  )
}

/**
 * Pressure vessel with dynamic pressure visualization
 */
function PressureVessel({ position, deviceId }) {
  const { getSensorStatus, sensors } = useDigitalTwinStore()
  
  const pressureSensor = sensors[`${deviceId}_pressure`]
  const status = getSensorStatus(`${deviceId}_pressure`)
  
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return '#ef4444'
      case 'warning': return '#f59e0b'
      case 'normal': return '#10b981'
      default: return '#6b7280'
    }
  }
  
  return (
    <group position={position}>
      {/* Vessel body */}
      <Cylinder args={[1.5, 1.5, 4]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#64748b" />
      </Cylinder>
      
      {/* Pressure gauge */}
      <Cylinder args={[0.3, 0.3, 0.1]} position={[1.5, 3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color={getStatusColor()} />
      </Cylinder>
      
      {/* Base */}
      <Box args={[3, 0.2, 3]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#374151" />
      </Box>
    </group>
  )
}

/**
 * Flow meter with animated flow visualization
 */
function FlowMeter({ position, deviceId }) {
  const meshRef = useRef()
  const { getSensorStatus, sensors } = useDigitalTwinStore()
  
  const flowSensor = sensors[`${deviceId}_flow`]
  const status = getSensorStatus(`${deviceId}_flow`)
  
  useFrame((state) => {
    if (meshRef.current && flowSensor?.value > 30) {
      meshRef.current.rotation.z += 0.05
    }
  })
  
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return '#ef4444'
      case 'warning': return '#f59e0b'
      case 'normal': return '#10b981'
      default: return '#6b7280'
    }
  }
  
  return (
    <group position={position}>
      {/* Flow meter body */}
      <Box args={[1, 1.5, 1]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#64748b" />
      </Box>
      
      {/* Flow indicator */}
      <Box ref={meshRef} args={[0.1, 0.8, 0.1]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color={getStatusColor()} />
      </Box>
      
      {/* Pipe connections */}
      <Cylinder args={[0.2, 0.2, 2]} position={[-1.5, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#475569" />
      </Cylinder>
      <Cylinder args={[0.2, 0.2, 2]} position={[1.5, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#475569" />
      </Cylinder>
    </group>
  )
}

/**
 * Pipe network connecting equipment
 */
function PipeNetwork() {
  return (
    <group>
      {/* Main horizontal pipe */}
      <Cylinder args={[0.15, 0.15, 12]} position={[0, 0.75, -3]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#475569" />
      </Cylinder>
      
      {/* Vertical connections */}
      <Cylinder args={[0.15, 0.15, 1.5]} position={[-5, 1.5, -3]}>
        <meshStandardMaterial color="#475569" />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 1.5]} position={[0, 1.5, -3]}>
        <meshStandardMaterial color="#475569" />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 1.5]} position={[5, 1.5, -3]}>
        <meshStandardMaterial color="#475569" />
      </Cylinder>
    </group>
  )
}

export default ModelLoader