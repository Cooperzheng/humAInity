'use client';

import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type ResourceType = 'tree' | 'stone';

interface ResourceTileProps {
  position: [number, number, number];
  type: ResourceType;
  state?: 'normal' | 'falling';
  onFallComplete?: () => void;
}

export default function ResourceTile({ position, type, state = 'normal', onFallComplete }: ResourceTileProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const fallCompleteCalledRef = useRef(false);

  // 倒地动画逻辑
  useFrame(() => {
    if (state === 'falling' && groupRef.current && type === 'tree') {
      // 绕Z轴旋转，模拟树木倒地
      if (groupRef.current.rotation.z < Math.PI / 2) {
        groupRef.current.rotation.z += 0.05; // 旋转速度
      } else if (!fallCompleteCalledRef.current) {
        // 倒地完成，延迟后触发回调
        fallCompleteCalledRef.current = true;
        setTimeout(() => onFallComplete?.(), 500);
      }
    }
  });

  if (type === 'tree') {
    return (
      <group
        ref={groupRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* 树干 */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 1.0, 6]} />
          <meshStandardMaterial 
            color={hovered ? "#b8956a" : "#8b7355"} 
            emissive={hovered ? "#6d5d4b" : "#000000"}
            emissiveIntensity={hovered ? 0.3 : 0}
          />
        </mesh>
        {/* 树冠 */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <coneGeometry args={[0.8, 1.6, 6]} />
          <meshStandardMaterial 
            color={hovered ? "#7a9e4a" : "#5a7e3a"} 
            emissive={hovered ? "#4a6e2a" : "#000000"}
            emissiveIntensity={hovered ? 0.3 : 0}
          />
        </mesh>
      </group>
    );
  }

  // 石头
  return (
    <mesh
      position={position}
      castShadow
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <dodecahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial 
        color={hovered ? "#b0a090" : "#8a8070"} 
        emissive={hovered ? "#7a7060" : "#000000"}
        emissiveIntensity={hovered ? 0.3 : 0}
      />
    </mesh>
  );
}

