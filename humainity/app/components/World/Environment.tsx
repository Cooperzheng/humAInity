'use client';

import { useMemo } from 'react';
import { WORLD_CONFIG, ENVIRONMENT_CONFIG } from '../../config/GameConfig';

// Ground component - Low-Poly 风格占位符地面 (80x80)
export function Ground() {
  return (
    <mesh position={[0, WORLD_CONFIG.groundDepth, 0]} receiveShadow>
      <boxGeometry args={[WORLD_CONFIG.mapSize, WORLD_CONFIG.groundThickness, WORLD_CONFIG.mapSize]} />
      <meshStandardMaterial color="#a89968" />
    </mesh>
  );
}

// Mountain component - 山脉（由多个锥体组成）
export function Mountain({ position }: { position: [number, number, number] }) {
  const baseX = position[0];
  const baseZ = position[2];
  
  // 使用 useMemo 稳定随机生成的山峰数据，避免每帧重新生成导致闪烁
  const peaks = useMemo(() => {
    const peakData = [];
    const peakCount = Math.floor(Math.random() * (ENVIRONMENT_CONFIG.mountain.peakCountMax - ENVIRONMENT_CONFIG.mountain.peakCountMin)) + ENVIRONMENT_CONFIG.mountain.peakCountMin;
    
    for (let i = 0; i < peakCount; i++) {
      const offsetX = (Math.random() - 0.5) * ENVIRONMENT_CONFIG.mountain.peakOffsetRange;
      const offsetZ = (Math.random() - 0.5) * ENVIRONMENT_CONFIG.mountain.peakOffsetRange;
      const height = Math.random() * (ENVIRONMENT_CONFIG.mountain.heightMax - ENVIRONMENT_CONFIG.mountain.heightMin) + ENVIRONMENT_CONFIG.mountain.heightMin;
      const radius = Math.random() * (ENVIRONMENT_CONFIG.mountain.radiusMax - ENVIRONMENT_CONFIG.mountain.radiusMin) + ENVIRONMENT_CONFIG.mountain.radiusMin;
      const grayShade = Math.floor(Math.random() * (ENVIRONMENT_CONFIG.mountain.grayscaleMax - ENVIRONMENT_CONFIG.mountain.grayscaleMin)) + ENVIRONMENT_CONFIG.mountain.grayscaleMin; // 100-140 灰度
      const color = `rgb(${grayShade}, ${grayShade}, ${grayShade})`;
      
      peakData.push(
        <mesh
          key={i}
          position={[baseX + offsetX, height / 2, baseZ + offsetZ]}
          castShadow={false}
          receiveShadow
        >
          <coneGeometry args={[radius, height, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    }
    return peakData;
  }, [baseX, baseZ]); // 仅当山脉位置改变时重新生成
  
  return <group>{peaks}</group>;
}

// Water component - 水体
export function Water({ position, size = ENVIRONMENT_CONFIG.water.defaultSize }: { position: [number, number, number]; size?: [number, number] }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={size} />
      <meshPhysicalMaterial
        color="#5a8aaa"
        transparent
        opacity={0.7}
        roughness={0.1}
        metalness={0.2}
        clearcoat={0.5}
        clearcoatRoughness={0.3}
      />
    </mesh>
  );
}

