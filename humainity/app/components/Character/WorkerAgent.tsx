'use client';

import { useRef, useEffect, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { AgentState } from '../Game/GameState';
import {
  NPC_CONFIG,
  MOVEMENT_CONFIG,
  INTERACTION_CONFIG,
  ACTION_CONFIG,
  getWanderInterval
} from '../../config/GameConfig';

// WorkerAgent component - NPC 智能体 "德米特里"
interface WorkerAgentProps {
  agentId: string; // Genesis V0.2 Step 3: 智能体ID
  playerRef: React.RefObject<THREE.Group>;
  agentState: AgentState;
  isNearAgent: boolean; // 新增：玩家是否在近场
  isSelected: boolean; // Genesis V0.2 Step 3: 是否被选中
  actionTarget: { x: number; z: number } | null;
  onActionDone: () => void;
  onSelect: () => void; // Genesis V0.2 Step 3: 选中回调
}

const WorkerAgent = forwardRef<THREE.Group, WorkerAgentProps>(function WorkerAgent(
  { agentId, playerRef, agentState, isNearAgent, isSelected, actionTarget, onActionDone, onSelect },
  ref
) {
  const groupRef = useRef<THREE.Group>(null);
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(groupRef.current);
    } else if (ref) {
      (ref as React.MutableRefObject<THREE.Group | null>).current = groupRef.current;
    }
  }, [ref]);
  const targetRef = useRef({ x: NPC_CONFIG.initialPosition[0], z: NPC_CONFIG.initialPosition[2] });
  const timerRef = useRef(0);
  const moveSpeedRef = useRef(MOVEMENT_CONFIG.npcSpeed);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const swingPhase = useRef(0);
  const isSwingingRef = useRef(false);

  const relaxArms = () => {
    const angle = 0;
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = angle;
      rightArmRef.current.rotation.x = -angle;
    }
  };

  const getStatusIcon = (): string => {
    // 新增核心状态图标（Step 3 UI 对接需要稳定输出）
    if (agentState === 'DELIVERING') return '📦 ';
    if (agentState === 'SEEKING_FOOD') return '🏃‍♀️ ';
    if (agentState === 'EATING') return '🍖 ';
    if (agentState === 'EXHAUSTED') return '😩 ';
    if (agentState === 'SLEEPING') return '💤 ';

    // 旧状态（保留）
    if (agentState === 'ACTING') return '🪓 ';
    if (agentState === 'THINKING') return '⚙️ ';
    if (agentState === 'LISTENING' && isNearAgent) return '👂 ';
    return '';
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const me = groupRef.current;

    // 行为：ACTING 时移动到目标并挥动
    if (agentState === 'ACTING' && actionTarget) {
      const dx = actionTarget.x - me.position.x;
      const dz = actionTarget.z - me.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      let moving = false;
      if (dist > INTERACTION_CONFIG.arrivalThreshold) {
        moving = true;
        isSwingingRef.current = false; // 还在移动，不是挥动状态
        me.position.x += (dx / dist) * moveSpeedRef.current;
        me.position.z += (dz / dist) * moveSpeedRef.current;
      } else {
        // 到达目标 -> 挥动
        // 关键修复：第一次进入挥动状态时，重置 swingPhase
        if (!isSwingingRef.current) {
          swingPhase.current = 0;
          isSwingingRef.current = true;
        }
        
        swingPhase.current += delta * ACTION_CONFIG.chopSwingSpeed;
        const amp = ACTION_CONFIG.chopSwingAmplitude;
        const angle = Math.sin(swingPhase.current) * amp;
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = angle;
          rightArmRef.current.rotation.x = -angle;
        }
        // 延长挥动时间：约 8 次挥动后（~4秒）回调
        if (swingPhase.current > ACTION_CONFIG.chopDuration) {
          swingPhase.current = 0;
          isSwingingRef.current = false; // 重置标志
          onActionDone();
        }
        return;
      }

      // 摆动
      const targetSpeed = moving ? MOVEMENT_CONFIG.walkSwingSpeed : 0;
      swingPhase.current += delta * targetSpeed;
      const amp = moving ? MOVEMENT_CONFIG.walkSwingAmplitude : 0;
      const angle = Math.sin(swingPhase.current) * amp;
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = angle;
        rightArmRef.current.rotation.x = -angle;
      }
      return;
    }

    // 行为：SEEKING_FOOD / DELIVERING / SLEEPING 朝 actionTarget 移动（到达后驻留）
    if (
      actionTarget &&
      (agentState === 'SEEKING_FOOD' || agentState === 'DELIVERING' || agentState === 'SLEEPING')
    ) {
      const dx = actionTarget.x - me.position.x;
      const dz = actionTarget.z - me.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      let moving = false;
      if (dist > INTERACTION_CONFIG.arrivalThreshold) {
        moving = true;
        me.position.x += (dx / dist) * moveSpeedRef.current;
        me.position.z += (dz / dist) * moveSpeedRef.current;
      }

      // 手臂摆动（行走）
      const targetSpeed = moving ? MOVEMENT_CONFIG.walkSwingSpeed : 0;
      swingPhase.current += delta * targetSpeed;
      const amp = moving ? MOVEMENT_CONFIG.walkSwingAmplitude : 0;
      const angle = Math.sin(swingPhase.current) * amp;
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = angle;
        rightArmRef.current.rotation.x = -angle;
      }
      return;
    }

    // EATING / EXHAUSTED / STARVING：不游走（驻留/静止）
    if (agentState === 'EATING' || agentState === 'EXHAUSTED' || agentState === 'STARVING' || agentState === 'SLEEPING') {
      relaxArms();
      return;
    }

    // LISTENING：朝向玩家，停留不走
    if (agentState === 'LISTENING' && playerRef.current) {
      const p = playerRef.current.position;
      const dx = p.x - me.position.x;
      const dz = p.z - me.position.z;
      me.rotation.y = Math.atan2(dx, dz);
      relaxArms();
      return;
    }

    // THINKING：不移动，手臂放松
    if (agentState === 'THINKING') {
      relaxArms();
      return;
    }

    // ASKING：询问时朝向玩家，停留不走
    if (agentState === 'ASKING' && playerRef.current) {
      const p = playerRef.current.position;
      const dx = p.x - me.position.x;
      const dz = p.z - me.position.z;
      me.rotation.y = Math.atan2(dx, dz);
      relaxArms();
      return;
    }

    // IDLE: 随机漫步
    if (agentState !== 'IDLE') {
      relaxArms();
      return;
    }
    timerRef.current += delta;
    if (timerRef.current > getWanderInterval()) {
      timerRef.current = 0;
      targetRef.current = {
        x: (Math.random() - 0.5) * NPC_CONFIG.wanderRangeHalf * 2, // -8 到 8
        z: (Math.random() - 0.5) * NPC_CONFIG.wanderRangeHalf * 2
      };
    }

    const dx = targetRef.current.x - me.position.x;
    const dz = targetRef.current.z - me.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    let moving = false;
    if (distance > INTERACTION_CONFIG.idleArrivalThreshold) {
      moving = true;
      me.position.x += (dx / distance) * moveSpeedRef.current;
      me.position.z += (dz / distance) * moveSpeedRef.current;
    }

    // 手臂摆动
    const targetSpeed = moving ? MOVEMENT_CONFIG.walkSwingSpeed : 0;
    swingPhase.current += delta * targetSpeed;
    const amp = moving ? MOVEMENT_CONFIG.walkSwingAmplitude : 0;
    const angle = Math.sin(swingPhase.current) * amp;
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = angle;
      rightArmRef.current.rotation.x = -angle;
    }
  });

  return (
    <group
      ref={groupRef}
      position={NPC_CONFIG.initialPosition}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* 身体 */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.55, 4, 8]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
      
      {/* 头部 */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#5ba3f5" />
      </mesh>
      
      {/* 左臂 */}
      <mesh
        ref={leftArmRef}
        position={[-0.28, 0.36, 0]} // 肩高0.55，下移一半臂长(0.38/2)
        rotation={[0, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.05, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#3a7bc8" />
      </mesh>
      
      {/* 右臂 */}
      <mesh
        ref={rightArmRef}
        position={[0.28, 0.36, 0]}
        rotation={[0, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.05, 0.05, 0.38, 8]} />
        <meshStandardMaterial color="#3a7bc8" />
      </mesh>
      
      {/* 头顶状态标签 */}
      <Html position={[0, 1.2, 0]} center>
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
          {getStatusIcon()}德米特里
        </div>
      </Html>

      {/* 选中指示器 - 倒三角 */}
      {isSelected && (
        <Html position={[0, 1.5, 0]} center>
          <div style={{
            fontSize: '20px',
            color: '#FFD700',
            textShadow: '0 0 4px rgba(255, 215, 0, 0.8)',
            pointerEvents: 'none',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            ▼
          </div>
        </Html>
      )}
    </group>
  );
});

export default WorkerAgent;

