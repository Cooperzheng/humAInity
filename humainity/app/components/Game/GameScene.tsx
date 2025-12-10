'use client';

import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Ground, Mountain, Water } from '../World/Environment';
import ResourceTile, { ResourceType } from '../World/ResourceTile';
import PlayerLeader from '../Character/PlayerLeader';
import WorkerAgent from '../Character/WorkerAgent';
import GameUI from './GameUI';
import { useGameState } from './GameState';
import { useGameLogic, Resource } from '../../hooks/useGameLogic';
import { WORLD_CONFIG, RESOURCE_CONFIG, CAMERA_CONFIG } from '../../config/GameConfig';

// GameSceneInner - 包含 Three.js 对象
function GameSceneInner({ leaderName }: { leaderName: string }) {
  const playerRef = useRef<THREE.Group>(null);
  const agentRef = useRef<THREE.Group>(null);
  const { agentState, isNearAgent } = useGameState();

  const [resources, setResources] = useState<Resource[]>(() => {
    const arr: Resource[] = [];
    for (let i = 0; i < RESOURCE_CONFIG.initialResourceCount; i++) {
      const x = (Math.random() - 0.5) * WORLD_CONFIG.coreArea;
      const z = (Math.random() - 0.5) * WORLD_CONFIG.coreArea;
      const type: ResourceType = Math.random() > (1 - RESOURCE_CONFIG.treeSpawnProbability) ? 'tree' : 'stone';
      arr.push({ id: Date.now() + i, type, position: [x, 0, z] });
    }
    return arr;
  });

  // 调用提取的游戏逻辑 Hook
  const { actionTarget, onActionDone } = useGameLogic({
    playerRef,
    agentRef,
    resources,
    setResources,
    leaderName
  });

  return (
    <>
      {/* 正交相机 - 45度角俯视等轴测视角 (更宽阔视野) */}
      <OrthographicCamera
        makeDefault
        position={CAMERA_CONFIG.position}
        zoom={CAMERA_CONFIG.zoom}
        near={CAMERA_CONFIG.near}
        far={CAMERA_CONFIG.far}
      />
      
      {/* 暖色调环境光 */}
      <ambientLight intensity={1.0} color="#fff5e6" />
      
      {/* 强烈的平行光（模拟太阳光） */}
      <directionalLight
        position={[15, 30, 15]}
        intensity={3.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={150}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0005}
        shadow-normalBias={0.4}
      />
      
      {/* 地面占位符 */}
      <Ground />
      
      {/* === 地貌生成（外围世界）=== */}
      <Mountain position={[32, 0, 32]} />
      <Mountain position={[-35, 0, 30]} />
      <Mountain position={[30, 0, -33]} />
      <Mountain position={[-32, 0, -35]} />
      
      {/* 水体 */}
      <Water position={[-25, 0.05, 15]} size={[10, 8]} />
      <Water position={[28, 0.05, -20]} size={[8, 6]} />
      
      {/* 资源 */}
      {resources.map((r) => (
        <ResourceTile 
          key={r.id} 
          position={r.position} 
          type={r.type} 
          state={r.state}
        />
      ))}
      
      {/* 角色 */}
      <PlayerLeader leaderName={leaderName} ref={playerRef} />
      <WorkerAgent
        ref={agentRef}
        playerRef={playerRef}
        agentState={agentState}
        isNearAgent={isNearAgent}
        actionTarget={actionTarget}
        onActionDone={onActionDone}
      />
      
      {/* 轨道控制 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={0.4}
        maxPolarAngle={1.2}
      />
    </>
  );
}

// GameScene 包裹 Canvas，处理焦点与背景色
interface GameSceneProps {
  leaderName: string;
}

export default function GameScene({ leaderName }: GameSceneProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { setInputFocused } = useGameState();

  // 处理点击游戏区域：强制清除输入焦点，确保WASD控制恢复
  const handlePointerDown = () => {
    // 强制清除所有输入框焦点
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.tagName === 'INPUT') {
      activeElement.blur();
    }
    // 重置焦点状态
    setInputFocused(false);
    // 让Canvas获得焦点，确保WASD事件能被捕获
    wrapperRef.current?.focus();
  };

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      style={{ width: '100%', height: '100%', outline: 'none' }}
      onPointerDown={handlePointerDown}
      onFocus={() => {
        console.log('Canvas focused - WASD should work now');
        setInputFocused(false); // 双重保险：Canvas获得焦点时也重置状态
      }}
      onKeyDown={(e) => {
        const k = e.key.toLowerCase();
        if (['w', 'a', 's', 'd'].includes(k)) {
          e.preventDefault();
        }
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#f0f0e0']} />
        <GameSceneInner leaderName={leaderName} />
      </Canvas>
      <GameUI leaderName={leaderName} />
    </div>
  );
}
