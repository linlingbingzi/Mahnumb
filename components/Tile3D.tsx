
import React, { useRef, Suspense } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Tile, Suit } from '../types';

// Fix: Removed global JSX augmentation. The previous implementation was overriding the 
// standard React JSX.IntrinsicElements namespace (which contains HTML tags like div, span, etc.)
// with only Three.js elements. Modern @react-three/fiber projects typically handle these 
// types via tsconfig.json or dedicated type definitions.

interface Tile3DProps {
  tile: Tile;
  position: [number, number, number];
  selected: boolean;
  onClick: () => void;
}

const getBrandColor = (suit: Suit) => {
  switch (suit) {
    case 'MAN': return '#3370ff'; // Word Blue
    case 'PIN': return '#f85959'; // PPT Red/Orange
    case 'SOU': return '#28c63f'; // Table Green
    case 'HONOR': return '#7c3aed'; // Jargon Purple
    default: return '#1f2329';
  }
};

const getTypeName = (suit: Suit) => {
  switch (suit) {
    case 'MAN': return 'DOCX';
    case 'PIN': return 'PPTX';
    case 'SOU': return 'XLSX';
    case 'HONOR': return 'CONF';
    default: return 'FILE';
  }
};

export const Tile3D: React.FC<Tile3DProps> = ({ tile, position, selected, onClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const brandColor = getBrandColor(tile.suit);

  useFrame((state) => {
    if (meshRef.current) {
      const targetY = selected ? 0.8 : 0;
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        0.15
      );
      
      if (selected) {
        meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 6) * 0.05;
      }
    }
  });

  return (
    <group 
      ref={meshRef} 
      position={position} 
      rotation={[-0.1, 0, 0]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <Float speed={2} rotationIntensity={0.05} floatIntensity={0.1}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.0, 1.4, 0.22]} />
          <meshStandardMaterial 
            color={brandColor} 
            roughness={0.2} 
            metalness={0.1}
          />
        </mesh>
        
        {/* White Face Layer */}
        <mesh position={[0, 0, 0.111]}>
          <planeGeometry args={[0.9, 1.3]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.05} />
        </mesh>

        {/* Brand Header */}
        <mesh position={[0, 0.55, 0.115]}>
          <planeGeometry args={[1.0, 0.3]} />
          <meshBasicMaterial color={brandColor} transparent opacity={0.8} />
        </mesh>

        {/* Type Icon Text */}
        <Text
          position={[-0.35, 0.57, 0.12]}
          fontSize={0.12}
          color="white"
          fontWeight="bold"
          font="https://fonts.gstatic.com/s/notosanssc/v26/k3kXo84MPtRZneW4mEW66Sshv6P_H6H_E_E.woff"
        >
          {getTypeName(tile.suit)[0]}
        </Text>

        <Suspense fallback={null}>
          <Text
            position={[0, -0.1, 0.12]}
            fontSize={tile.suit === 'HONOR' ? 0.22 : 0.7}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.9}
            textAlign="center"
            fontWeight="black"
            font="https://fonts.gstatic.com/s/notosanssc/v26/k3kXo84MPtRZneW4mEW66Sshv6P_H6H_E_E.woff"
          >
            {tile.label}
          </Text>
        </Suspense>

        <Text
          position={[0, -0.58, 0.12]}
          fontSize={0.08}
          color="#ffffff"
          font="https://fonts.gstatic.com/s/notosanssc/v26/k3kXo84MPtRZneW4mEW66Sshv6P_H6H_E_E.woff"
        >
          {getTypeName(tile.suit)}
        </Text>

        {selected && (
          <group>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.1, 1.5, 0.24]} />
              <meshBasicMaterial color={brandColor} transparent opacity={0.4} side={THREE.BackSide} />
            </mesh>
          </group>
        )}
      </Float>
    </group>
  );
};
