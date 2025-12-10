'use client';

import { useRef, useEffect, useState, forwardRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import ResourceTile, { ResourceType } from '../World/ResourceTile';
import GameUI from './GameUI';
import { useGameState, AgentState } from './GameState';

// Ground component - Low-Poly 风格占位符地面 (80x80)
function Ground() {
  return (
    <mesh position={[0, -0.5, 0]} receiveShadow>
      <boxGeometry args={[80, 1, 80]} />
      <meshStandardMaterial color="#a89968" />
    </mesh>
  );
}

// Mountain component - 山脉（由多个锥体组成）
function Mountain({ position }: { position: [number, number, number] }) {
  const baseX = position[0];
  const baseZ = position[2];
  
  // 使用 useMemo 稳定随机生成的山峰数据，避免每帧重新生成导致闪烁
  const peaks = useMemo(() => {
    const peakData = [];
    const peakCount = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < peakCount; i++) {
      const offsetX = (Math.random() - 0.5) * 6;
      const offsetZ = (Math.random() - 0.5) * 6;
      const height = Math.random() * 4 + 3;
      const radius = Math.random() * 2 + 1.5;
      const grayShade = Math.floor(Math.random() * 40) + 100; // 100-140 灰度
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
function Water({ position, size = [8, 6] }: { position: [number, number, number]; size?: [number, number] }) {
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

// useWASDControls Hook - WASD 键盘控制
function useWASDControls(speed = 0.1) {
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        e.preventDefault(); // 在游戏聚焦时阻止默认行为
        keys.current[key as keyof typeof keys.current] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        e.preventDefault();
        keys.current[key as keyof typeof keys.current] = false;
      }
    };

    // 添加到 document
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    console.log('WASD controls initialized');

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 使用 useRef 保持 speed 的引用，或者直接在计算时传入
  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // 返回一个获取当前移动向量的函数
  return () => {
    const movement = { x: 0, z: 0 };
    const s = speedRef.current;
    
    if (keys.current.w) movement.z -= s;
    if (keys.current.s) movement.z += s;
    if (keys.current.a) movement.x -= s;
    if (keys.current.d) movement.x += s;
    
    return movement;
  };
}

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
  const getMovement = useWASDControls(0.05); // 降低速度，匹配比例
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
      groupRef.current.position.x = Math.max(-38, Math.min(38, groupRef.current.position.x));
      groupRef.current.position.z = Math.max(-38, Math.min(38, groupRef.current.position.z));

      // 手臂摆动：仅在移动时摆动，幅度随速度
      const moving = moveLength > 0.0001;
      const targetSpeed = moving ? 4 : 0; // 降低摆动速度
      swingPhase.current += state.clock.getDelta() * targetSpeed;
      const amp = moving ? 0.24 : 0; // 降低摆动幅度
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

// WorkerAgent component - NPC 智能体 "德米特里"
interface WorkerAgentProps {
  playerRef: React.RefObject<THREE.Group>;
  agentState: AgentState;
  isNearAgent: boolean; // 新增：玩家是否在近场
  actionTarget: { x: number; z: number } | null;
  onActionDone: () => void;
}

const WorkerAgent = forwardRef<THREE.Group, WorkerAgentProps>(function WorkerAgent(
  { playerRef, agentState, isNearAgent, actionTarget, onActionDone },
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
  const targetRef = useRef({ x: 2, z: 2 });
  const timerRef = useRef(0);
  const moveSpeedRef = useRef(0.01);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const swingPhase = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const me = groupRef.current;

    // 若处于 THINKING/ACTING/LISTENING，停止随机游走
    const active = agentState === 'THINKING' || agentState === 'ACTING' || agentState === 'LISTENING';

    // 行为：ACTING 时移动到目标并挥动
    if (agentState === 'ACTING' && actionTarget) {
      const dx = actionTarget.x - me.position.x;
      const dz = actionTarget.z - me.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      let moving = false;
      if (dist > 0.15) {
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
        
        swingPhase.current += delta * 6;
        const amp = 0.5;
        const angle = Math.sin(swingPhase.current) * amp;
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = angle;
          rightArmRef.current.rotation.x = -angle;
        }
        // 延长挥动时间：约 8 次挥动后（~4秒）回调
        if (swingPhase.current > Math.PI * 8) {
          swingPhase.current = 0;
          isSwingingRef.current = false; // 重置标志
          onActionDone();
        }
        return;
      }

      // 摆动
      const targetSpeed = moving ? 4 : 0;
      swingPhase.current += delta * targetSpeed;
      const amp = moving ? 0.24 : 0;
      const angle = Math.sin(swingPhase.current) * amp;
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = angle;
        rightArmRef.current.rotation.x = -angle;
      }
      return;
    }

    // LISTENING：朝向玩家，停留不走
    if (agentState === 'LISTENING' && playerRef.current) {
      const p = playerRef.current.position;
      const dx = p.x - me.position.x;
      const dz = p.z - me.position.z;
      me.rotation.y = Math.atan2(dx, dz);
      const angle = 0; // 手臂放松
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = angle;
        rightArmRef.current.rotation.x = -angle;
      }
      return;
    }

    // THINKING：不移动，手臂放松
    if (agentState === 'THINKING') {
      const angle = 0;
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = angle;
        rightArmRef.current.rotation.x = -angle;
      }
      return;
    }

    // IDLE: 随机漫步
    timerRef.current += delta;
    if (timerRef.current > Math.random() * 2 + 3) {
      timerRef.current = 0;
      targetRef.current = {
        x: (Math.random() - 0.5) * 16, // -8 到 8
        z: (Math.random() - 0.5) * 16
      };
    }

    const dx = targetRef.current.x - me.position.x;
    const dz = targetRef.current.z - me.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    let moving = false;
    if (distance > 0.1) {
      moving = true;
      me.position.x += (dx / distance) * moveSpeedRef.current;
      me.position.z += (dz / distance) * moveSpeedRef.current;
    }

    // 手臂摆动
    const targetSpeed = moving ? 4 : 0;
    swingPhase.current += delta * targetSpeed;
    const amp = moving ? 0.24 : 0;
    const angle = Math.sin(swingPhase.current) * amp;
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = angle;
      rightArmRef.current.rotation.x = -angle;
    }
  });

  return (
    <group ref={groupRef} position={[2, 0, 2]}>
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
          {isNearAgent && agentState === 'LISTENING' ? '👂 ' : agentState === 'THINKING' ? '⚙️ ' : agentState === 'ACTING' ? '🪓 ' : ''}德米特里
        </div>
      </Html>
    </group>
  );
});

// GameSceneInner - 包含 Three.js 对象
type Resource = {
  id: number;
  type: ResourceType;
  position: [number, number, number];
  state?: 'normal' | 'falling';
};

function GameSceneInner({ leaderName }: { leaderName: string }) {
  const playerRef = useRef<THREE.Group>(null);
  const agentRef = useRef<THREE.Group>(null);
  const { setNearAgent, setAgentState, agentState, pendingCommand, setPendingCommand, addLog, addWood, isNearAgent, inputFocused } =
    useGameState();

  const [resources, setResources] = useState<Resource[]>(() => {
    const arr: Resource[] = [];
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      const type: ResourceType = Math.random() > 0.3 ? 'tree' : 'stone';
      arr.push({ id: Date.now() + i, type, position: [x, 0, z] });
    }
    return arr;
  });

  const [actionTarget, setActionTarget] = useState<{ x: number; z: number } | null>(null);
  const actionDoneRef = useRef<() => void>(() => {});

  // 使用 ref 缓存上一次的状态，避免频繁更新
  const lastNearRef = useRef(false);
  const lastAgentStateRef = useRef<AgentState>('IDLE');

  // 近场检测
  useFrame(() => {
    if (!playerRef.current || !agentRef.current) return;
    const p = playerRef.current.position;
    const a = agentRef.current.position;
    const dx = p.x - a.x;
    const dz = p.z - a.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const near = dist < 3;
    
    // 始终更新近场状态，即使在输入时也要保持状态同步
    // 但只在状态真正改变时才调用 setState，减少不必要的渲染
    if (near !== lastNearRef.current) {
      lastNearRef.current = near;
      setNearAgent(near);
    }

    // 如果玩家正在输入，或NPC正在执行任务，不要强制切换状态
    if (inputFocused || agentState === 'THINKING' || agentState === 'ACTING' || agentState === 'ASKING') return;
    
    let newState: AgentState | null = null;
    if (near) {
      if (agentState !== 'LISTENING') newState = 'LISTENING';
    } else {
      if (agentState !== 'IDLE') newState = 'IDLE';
    }
    
    // 只在状态真正需要改变时才更新
    if (newState && newState !== lastAgentStateRef.current) {
      lastAgentStateRef.current = newState;
      setAgentState(newState);
    }
  });

  // 生成随机延迟（模拟 NPC 思考时间）
  const getRandomDelay = (min = 800, max = 1500) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // 处理玩家指令
  useEffect(() => {
    const cmd = pendingCommand;
    if (!cmd) return;

    // 如果刚刚在等待数量，这里不处理，交给数量解析逻辑
    if (waitingQuantityRef.current) return;
    setPendingCommand(null);

    // 安全检查：如果 ref 未初始化，使用状态变量作为后备
    let isReallyNear = isNearAgent; // 默认使用状态变量
    
    if (playerRef.current && agentRef.current && 
        playerRef.current.position && agentRef.current.position) {
      // 关键修复：实时计算距离，不依赖可能过时的 isNearAgent 状态
      const p = playerRef.current.position;
      const a = agentRef.current.position;
      const dx = p.x - a.x;
      const dz = p.z - a.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      isReallyNear = dist < 3;
      
      console.log('[GameScene] Processing command:', cmd, 'distance:', dist.toFixed(2), 'isReallyNear:', isReallyNear, 'agentState:', agentState);
    } else {
      console.log('[GameScene] Processing command:', cmd, 'refs not ready, using isNearAgent:', isReallyNear, 'agentState:', agentState);
    }

    const lower = cmd.toLowerCase();
    const isChop = lower.includes('砍树') || lower.includes('伐木');

    if (!isReallyNear || agentState !== 'LISTENING') {
      // 修复：改为 chat 类型，让用户在对话框中看到反馈
      setTimeout(() => addLog('德米特里: （距离太远，我听不到你在说什么...）', 'chat'), getRandomDelay(800, 1400));
      return;
    }

    // 玩家消息已在 GameUI 中立即显示，这里不再重复
    if (!isChop) {
      // 随机延迟 NPC 回复
      setTimeout(() => addLog('德米特里: 收到，但我暂时只会砍树相关的指令。', 'chat'), getRandomDelay(1000, 1800));
      return;
    }

    // 询问数量（随机延迟）
    setAgentState('ASKING');
    waitingQuantityRef.current = true;
    setTimeout(() => addLog('德米特里: 需要砍几棵树？', 'chat'), getRandomDelay(800, 1400));
  }, [pendingCommand, isNearAgent, agentState, addLog, setPendingCommand, resources, addWood, setAgentState]);

  const waitingQuantityRef = useRef(false);
  const chopQueueRef = useRef(0);

  // 处理数量回复
  useEffect(() => {
    if (!waitingQuantityRef.current) return;
    const cmd = pendingCommand;
    if (!cmd) return;
    waitingQuantityRef.current = false;
    setPendingCommand(null);

    const numMatch = cmd.match(/\d+/);
    if (!numMatch) {
      setAgentState('ASKING');
      waitingQuantityRef.current = true;
      // 关键修复：串联延迟，确保"没听清"在"需要砍几棵树？"之后1-2秒显示
      const firstDelay = getRandomDelay(800, 1400);
      const secondDelay = getRandomDelay(1000, 2000);
      setTimeout(() => addLog('德米特里: 没听清数量，请再说一次数字。', 'chat'), firstDelay + secondDelay);
      return;
    }
    const qty = Math.max(1, Math.min(20, parseInt(numMatch[0], 10)));
    chopQueueRef.current = qty;
    
    // 随机延迟 NPC 确认回复
    const confirmDelay = getRandomDelay(800, 1400);
    setTimeout(() => addLog(`德米特里: 好的，砍 ${qty} 棵。`, 'chat'), confirmDelay);
    
    // NPC 说完话后再开始行动（额外等待 500-800ms）
    setTimeout(() => {
      // 寻找最近的树
      if (!agentRef.current) return;
      const aPos = agentRef.current.position;
      let nearestTree: Resource | null = null;
      let bestDist = Infinity;
      
      resources.forEach((r) => {
        if (r.type !== 'tree') return;
        const dx = r.position[0] - aPos.x;
        const dz = r.position[2] - aPos.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        if (d < bestDist) {
          bestDist = d;
          nearestTree = r;
        }
      });

      if (!nearestTree) {
        addLog('系统：附近没有树木可砍。', 'system');
        setAgentState(isNearAgent ? 'LISTENING' : 'IDLE');
        chopQueueRef.current = 0;
        return;
      }

      // 记录玩家命令NPC的交互日志
      addLog(`系统：${leaderName}命令德米特里砍伐${qty}棵树木，德米特里接受任务。`, 'system');
      
      // 设置目标并进入 ACTING 状态
      setActionTarget({ x: nearestTree.position[0], z: nearestTree.position[2] });
      setAgentState('ACTING');
    }, confirmDelay + getRandomDelay(500, 800)); // NPC 说完话后再开始行动
  }, [pendingCommand, addLog, setPendingCommand, setAgentState, resources, isNearAgent]);
  
  return (
    <>
      {/* 正交相机 - 45度角俯视等轴测视角 (更宽阔视野) */}
      <OrthographicCamera
        makeDefault
        position={[18, 22, 18]}
        zoom={14}
        near={0.1}
        far={200}
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
        onActionDone={() => {
          // 完成一次砍树 - 标记树木为倒地状态，而非立即删除
          let treeId: number | null = null;
          
          setResources((prev) => {
            if (!agentRef.current) return prev;
            const aPos = agentRef.current.position;
            let nearestIndex = -1;
            let best = Infinity;
            prev.forEach((r, idx) => {
              if (r.type !== 'tree' || r.state === 'falling') return;
              const dx = r.position[0] - aPos.x;
              const dz = r.position[2] - aPos.z;
              const d = dx * dx + dz * dz;
              if (d < best) {
                best = d;
                nearestIndex = idx;
              }
            });
            if (nearestIndex === -1) return prev;
            
            // 标记为falling状态
            const clone = [...prev];
            treeId = clone[nearestIndex].id;
            clone[nearestIndex] = { ...clone[nearestIndex], state: 'falling' };
            
            // 2秒后删除树木（倒地动画完成后）
            setTimeout(() => {
              setResources((current) => current.filter((r) => r.id !== treeId));
            }, 2000);
            
            return clone;
          });
          
          addWood(1);
          addLog('系统：德米特里砍伐了树木，木材 +1。', 'system');
          chopQueueRef.current = Math.max(0, chopQueueRef.current - 1);
          
          if (chopQueueRef.current > 0) {
            // 继续寻找下一棵树
            if (!agentRef.current) return;
            const aPos = agentRef.current.position;
            
            // 重新获取当前的 resources（因为刚标记了一棵为falling）
            setResources((currentResources) => {
              const treesLeft = currentResources.filter((r) => r.type === 'tree' && r.state !== 'falling');
              
              if (treesLeft.length === 0) {
                addLog('系统：没有树木可砍了。', 'system');
                chopQueueRef.current = 0;
                setActionTarget(null);
                // 延迟检查近场状态，因为此时可能玩家已经走远
                setTimeout(() => {
                  if (!agentRef.current || !playerRef.current) {
                    setAgentState('IDLE');
                    return;
                  }
                  const dx = playerRef.current.position.x - agentRef.current.position.x;
                  const dz = playerRef.current.position.z - agentRef.current.position.z;
                  const dist = Math.sqrt(dx * dx + dz * dz);
                  setAgentState(dist < 3 ? 'LISTENING' : 'IDLE');
                }, 100);
                return currentResources;
              }
              
              // 找到最近的下一棵树
              let nearestTree: Resource | null = null;
              let bestDist = Infinity;
              treesLeft.forEach((r) => {
                const dx = r.position[0] - aPos.x;
                const dz = r.position[2] - aPos.z;
                const d = Math.sqrt(dx * dx + dz * dz);
                if (d < bestDist) {
                  bestDist = d;
                  nearestTree = r;
                }
              });
              
              if (nearestTree) {
                setActionTarget({ x: nearestTree.position[0], z: nearestTree.position[2] });
                setAgentState('ACTING');
              }
              
              return currentResources;
            });
          } else {
            // 所有任务完成，返回初始状态
            setActionTarget(null);
            // 延迟检查近场状态
            setTimeout(() => {
              if (!agentRef.current || !playerRef.current) {
                setAgentState('IDLE');
                return;
              }
              const dx = playerRef.current.position.x - agentRef.current.position.x;
              const dz = playerRef.current.position.z - agentRef.current.position.z;
              const dist = Math.sqrt(dx * dx + dz * dz);
              setAgentState(dist < 3 ? 'LISTENING' : 'IDLE');
            }, 100);
          }
        }}
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

