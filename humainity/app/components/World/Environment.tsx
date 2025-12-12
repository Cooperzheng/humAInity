'use client';

import { useMemo } from 'react';
import { WORLD_CONFIG, ENVIRONMENT_CONFIG, FACILITIES, getSettlementRadius, getResourceRadius } from '../../config/GameConfig';

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

// ZoneBoundaries component - 区域边界可视化（Genesis V0.2）
export function ZoneBoundaries() {
  const settlementRadius = getSettlementRadius();
  const resourceRadius = getResourceRadius();
  
  return (
    <group>
      {/* 聚落核心区 - 青色边界 (无资源生成区) */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[settlementRadius - 0.2, settlementRadius, 64]} />
        <meshBasicMaterial color="cyan" transparent opacity={0.3} />
      </mesh>
      
      {/* 资源区外环 - 橙色边界 (资源生成范围) */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[resourceRadius - 0.2, resourceRadius, 64]} />
        <meshBasicMaterial color="orange" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Bonfire component - 篝火（Genesis V0.2）
export function Bonfire({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 橙色点光源 */}
      <pointLight color="orange" intensity={2} distance={8} castShadow />
      
      {/* 火堆底座 - 圆柱体 */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.6, 8]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>
      
      {/* 火焰占位 - 圆锥体（发光材质） */}
      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.3, 0.7, 6]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      
      {/* 火花占位 - 小球 */}
      <mesh position={[0.2, 1.2, 0.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>
    </group>
  );
}

// Granary component - 储粮点（Genesis V0.2）
export function Granary({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 主体箱子 */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#D2691E" />
      </mesh>
      
      {/* 屋顶 - 金字塔形 */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <coneGeometry args={[1.1, 0.6, 4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* 标记牌 - 小立方体 */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.05]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}

