import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface CraneModelProps {
  sensorData: any;
}

export const CraneModel: React.FC<CraneModelProps> = ({ sensorData }) => {
  const craneRef = useRef<THREE.Group>(null);
  const hookRef = useRef<THREE.Group>(null);
  const bridgeRef = useRef<THREE.Group>(null);
  const trolleyRef = useRef<THREE.Group>(null);

  // Animation based on sensor data
  useFrame((state) => {
    if (hookRef.current && sensorData?.lifting) {
      // Animate hook height
      const targetHeight = (sensorData.lifting.hookHeight || 15) / 2;
      hookRef.current.position.y = THREE.MathUtils.lerp(hookRef.current.position.y, targetHeight, 0.1);
      
      // Animate load swing
      const swingAngle = (sensorData.lifting.loadSwing || 0) * 0.1;
      hookRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * swingAngle;
    }

    if (bridgeRef.current && sensorData?.movement) {
      // Animate bridge position
      const bridgePosition = (sensorData.movement.bridgePosition || 0) * 0.1;
      bridgeRef.current.position.x = THREE.MathUtils.lerp(bridgeRef.current.position.x, bridgePosition, 0.05);
    }

    if (trolleyRef.current && sensorData?.movement) {
      // Animate trolley position
      const trolleyPosition = (sensorData.movement.trolleyPosition || 0) * 0.1;
      trolleyRef.current.position.z = THREE.MathUtils.lerp(trolleyRef.current.position.z, trolleyPosition, 0.05);
    }
  });

  // Dynamic materials based on system health
  const getHealthColor = (health: number) => {
    if (health >= 90) return '#10B981'; // Green
    if (health >= 70) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const systemHealth = sensorData?.systemHealth || 100;
  const structureMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: getHealthColor(systemHealth),
      metalness: 0.8,
      roughness: 0.2
    }), [systemHealth]
  );

  const steelMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#64748b',
      metalness: 0.9,
      roughness: 0.1
    }), []
  );

  const cableMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#374151',
      metalness: 0.6,
      roughness: 0.4
    }), []
  );

  return (
    <group ref={craneRef} position={[0, 0, 0]}>
      {/* Base and Tower */}
      <group position={[0, 0, 0]}>
        {/* Base Platform */}
        <Box 
          args={[6, 0.5, 6]} 
          position={[0, 0.25, 0]}
          material={steelMaterial}
          castShadow
          receiveShadow
        />
        
        {/* Tower Legs */}
        {[-2, 2].map((x, i) => 
          [-2, 2].map((z, j) => (
            <Cylinder
              key={`leg-${i}-${j}`}
              args={[0.3, 0.3, 20]}
              position={[x, 10, z]}
              material={structureMaterial}
              castShadow
            />
          ))
        )}
        
        {/* Tower Cross Bracing */}
        {[5, 10, 15].map((height, i) => (
          <group key={`bracing-${i}`} position={[0, height, 0]}>
            <Box args={[4.5, 0.2, 0.2]} position={[0, 0, -2]} material={steelMaterial} />
            <Box args={[4.5, 0.2, 0.2]} position={[0, 0, 2]} material={steelMaterial} />
            <Box args={[0.2, 0.2, 4.5]} position={[-2, 0, 0]} material={steelMaterial} />
            <Box args={[0.2, 0.2, 4.5]} position={[2, 0, 0]} material={steelMaterial} />
          </group>
        ))}
      </group>

      {/* Bridge (moves left-right) */}
      <group ref={bridgeRef} position={[0, 20, 0]}>
        <Box 
          args={[30, 1, 2]} 
          position={[0, 0, 0]}
          material={structureMaterial}
          castShadow
        />
        
        {/* Bridge Support Beams */}
        <Box args={[30, 0.5, 0.5]} position={[0, 0.75, -1]} material={steelMaterial} />
        <Box args={[30, 0.5, 0.5]} position={[0, 0.75, 1]} material={steelMaterial} />
        
        {/* Trolley (moves forward-backward on bridge) */}
        <group ref={trolleyRef} position={[0, -1, 0]}>
          <Box 
            args={[2, 1, 1.5]} 
            position={[0, 0, 0]}
            material={steelMaterial}
            castShadow
          />
          
          {/* Motor Housing */}
          <Cylinder
            args={[0.6, 0.6, 1]}
            position={[0, 0.5, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            material={new THREE.MeshStandardMaterial({ 
              color: sensorData?.motor?.hoistMotorTemp > 80 ? '#EF4444' : '#1E40AF',
              metalness: 0.7,
              roughness: 0.3
            })}
            castShadow
          />
          
          {/* Hook Assembly */}
          <group ref={hookRef} position={[0, -8, 0]}>
            {/* Cable */}
            <Cylinder
              args={[0.05, 0.05, (sensorData?.lifting?.wireLength || 25) / 2]}
              position={[0, -(sensorData?.lifting?.wireLength || 25) / 4, 0]}
              material={cableMaterial}
            />
            
            {/* Hook */}
            <Sphere
              args={[0.5]}
              position={[0, -(sensorData?.lifting?.wireLength || 25) / 2, 0]}
              material={new THREE.MeshStandardMaterial({ 
                color: '#FCD34D',
                metalness: 0.8,
                roughness: 0.2
              })}
              castShadow
            />
            
            {/* Load (if present) */}
            {sensorData?.lifting?.loadWeight > 100 && (
              <Box
                args={[2, 1, 2]}
                position={[0, -(sensorData?.lifting?.wireLength || 25) / 2 - 1, 0]}
                material={new THREE.MeshStandardMaterial({ 
                  color: '#DC2626',
                  metalness: 0.5,
                  roughness: 0.7
                })}
                castShadow
              />
            )}
          </group>
        </group>
      </group>

      {/* Safety Lighting */}
      {sensorData?.safety?.emergencyBrake && (
        <pointLight
          position={[0, 25, 0]}
          color="#EF4444"
          intensity={2}
          distance={50}
        />
      )}
      
      {/* Environmental Effects */}
      {sensorData?.environmental?.windSpeed > 15 && (
        <group>
          {/* Wind effect visualization could be added here */}
        </group>
      )}
    </group>
  );
};