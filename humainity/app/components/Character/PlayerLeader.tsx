'use client';

import { useRef, useEffect, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameState } from '../Game/GameState';
import { useWASDControls } from '../../hooks/useWASDControls';
import { WORLD_CONFIG, MOVEMENT_CONFIG } from '../../config/GameConfig';

// PlayerLeader component - 玩家化身
interface PlayerLeaderProps {
  leaderName: string;
}

const PlayerLeader = forwardRef<THREE.Group, PlayerLeaderProps>(function PlayerLeader(
  { leaderName },
  ref
) {
  const groupRef = useRef<THREE.Group>(null);
  // expose ref
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(groupRef.current);
    } else if (ref) {
      (ref as React.MutableRefObject<THREE.Group | null>).current = groupRef.current;
    }
  }, [ref]);

  const { inputFocused } = useGameState();
  const getMovement = useWASDControls(MOVEMENT_CONFIG.playerSpeed); // 降低速度，匹配比例
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const swingPhase = useRef(0);

  useFrame((state) => {
    if (groupRef.current) {
      if (inputFocused) return; // 输入时不移动
      // 1. 获取键盘输入向量 (本地坐标系：z负=前, z正=后, x负=左, x正=右)
      const input = getMovement();
      
      // 如果没有输入，直接返回
      if (input.x === 0 && input.z === 0) return;

      // 2. 获取摄像机的水平方向
      const camera = state.camera;
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0; // 投影到 XZ 平面
      forward.normalize();

      // 3. 计算摄像机的右侧方向
      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize(); // 确保方向一致

      // 4. 计算实际移动向量
      const moveVector = new THREE.Vector3();
      moveVector.addScaledVector(forward, -input.z); // W/S
      moveVector.addScaledVector(right, input.x);    // A/D

      // 当前帧移动量，用于手臂摆动
      const moveLength = moveVector.length();

      // 更新位置
      groupRef.current.position.add(moveVector);
      
      // 边界限制（保持在地图内）
      groupRef.current.position.x = Math.max(-WORLD_CONFIG.mapBoundary, Math.min(WORLD_CONFIG.mapBoundary, groupRef.current.position.x));
      groupRef.current.position.z = Math.max(-WORLD_CONFIG.mapBoundary, Math.min(WORLD_CONFIG.mapBoundary, groupRef.current.position.z));

      // 手臂摆动：仅在移动时摆动，幅度随速度
      const moving = moveLength > MOVEMENT_CONFIG.movementThreshold;
      const targetSpeed = moving ? MOVEMENT_CONFIG.walkSwingSpeed : 0; // 降低摆动速度
      swingPhase.current += state.clock.getDelta() * targetSpeed;
      const amp = moving ? MOVEMENT_CONFIG.walkSwingAmplitude : 0; // 降低摆动幅度
      const angle = Math.sin(swingPhase.current) * amp;
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = angle;   // 前后摆动
        rightArmRef.current.rotation.x = -angle; // 对称摆动
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 身体 - 胶囊体（用圆柱体代替） */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.5, 4, 8]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
      
      {/* 头部 - 球体 */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#ff8c42" />
      </mesh>

      {/* 左臂 */}
      <mesh
        ref={leftArmRef}
        position={[-0.28, 0.36, 0]} // 肩高0.55，下移一半臂长
        rotation={[0, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.05, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#ff7b45" />
      </mesh>

      {/* 右臂 */}
      <mesh
        ref={rightArmRef}
        position={[0.28, 0.36, 0]}
        rotation={[0, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.05, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#ff7b45" />
      </mesh>

      {/* 头顶名称标签 */}
      <Html position={[0, 1.05, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'serif',
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}>
          {leaderName || '玩家'}
        </div>
      </Html>
    </group>
  );
});

export default PlayerLeader;

