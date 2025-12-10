'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState, AgentState } from '../components/Game/GameState';
import { ResourceType } from '../components/World/ResourceTile';
import {
  INTERACTION_CONFIG,
  RESPONSE_DELAY_CONFIG,
  ACTION_CONFIG,
  RESOURCE_CONFIG,
  getRandomDelay
} from '../config/GameConfig';

// Resource 类型定义
export type Resource = {
  id: number;
  type: ResourceType;
  position: [number, number, number];
  state?: 'normal' | 'falling';
};

interface UseGameLogicParams {
  playerRef: React.RefObject<THREE.Group>;
  agentRef: React.RefObject<THREE.Group>;
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  leaderName: string;
}

interface UseGameLogicReturn {
  actionTarget: { x: number; z: number } | null;
  onActionDone: () => void;
}

// 注意：getRandomDelay 辅助函数已从 GameConfig 导入

export function useGameLogic({
  playerRef,
  agentRef,
  resources,
  setResources,
  leaderName
}: UseGameLogicParams): UseGameLogicReturn {
  const {
    setNearAgent,
    setAgentState,
    agentState,
    pendingCommand,
    setPendingCommand,
    addLog,
    addWood,
    isNearAgent,
    inputFocused
  } = useGameState();

  const [actionTarget, setActionTarget] = useState<{ x: number; z: number } | null>(null);
  const actionDoneRef = useRef<() => void>(() => {});
  const waitingQuantityRef = useRef(false);
  const chopQueueRef = useRef(0);

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
    const near = dist < INTERACTION_CONFIG.interactionRange;
    
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
      isReallyNear = dist < INTERACTION_CONFIG.interactionRange;
      
      console.log('[GameScene] Processing command:', cmd, 'distance:', dist.toFixed(2), 'isReallyNear:', isReallyNear, 'agentState:', agentState);
    } else {
      console.log('[GameScene] Processing command:', cmd, 'refs not ready, using isNearAgent:', isReallyNear, 'agentState:', agentState);
    }

    const lower = cmd.toLowerCase();
    const isChop = lower.includes('砍树') || lower.includes('伐木');

    if (!isReallyNear || agentState !== 'LISTENING') {
      // 修复：改为 chat 类型，让用户在对话框中看到反馈
      setTimeout(() => addLog('德米特里: （距离太远，我听不到你在说什么...）', 'chat'), getRandomDelay(RESPONSE_DELAY_CONFIG.tooFar));
      return;
    }

    // 玩家消息已在 GameUI 中立即显示，这里不再重复
    if (!isChop) {
      // 随机延迟 NPC 回复
      setTimeout(() => addLog('德米特里: 收到，但我暂时只会砍树相关的指令。', 'chat'), getRandomDelay(RESPONSE_DELAY_CONFIG.unsupportedCommand));
      return;
    }

    // 询问数量（随机延迟）
    setAgentState('ASKING');
    waitingQuantityRef.current = true;
    setTimeout(() => addLog('德米特里: 需要砍几棵树？', 'chat'), getRandomDelay(RESPONSE_DELAY_CONFIG.askQuantity));
  }, [pendingCommand, isNearAgent, agentState, addLog, setPendingCommand, setAgentState]);

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
      const firstDelay = getRandomDelay(RESPONSE_DELAY_CONFIG.askQuantity);
      const secondDelay = getRandomDelay(RESPONSE_DELAY_CONFIG.clarify);
      setTimeout(() => addLog('德米特里: 没听清数量，请再说一次数字。', 'chat'), firstDelay + secondDelay);
      return;
    }
    const qty = Math.max(ACTION_CONFIG.minChopQuantity, Math.min(ACTION_CONFIG.maxChopQuantity, parseInt(numMatch[0], 10)));
    chopQueueRef.current = qty;
    
    // 随机延迟 NPC 确认回复
    const confirmDelay = getRandomDelay(RESPONSE_DELAY_CONFIG.confirm);
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
    }, confirmDelay + getRandomDelay(RESPONSE_DELAY_CONFIG.actionStart)); // NPC 说完话后再开始行动
  }, [pendingCommand, addLog, setPendingCommand, setAgentState, resources, isNearAgent, leaderName]);

  // 砍树完成逻辑
  const onActionDone = () => {
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
      }, RESOURCE_CONFIG.treeRemovalDelay);
      
      return clone;
    });
    
    addWood(RESOURCE_CONFIG.woodPerTree);
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
            setAgentState(dist < INTERACTION_CONFIG.interactionRange ? 'LISTENING' : 'IDLE');
          }, INTERACTION_CONFIG.stateCheckDelay);
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
        setAgentState(dist < INTERACTION_CONFIG.interactionRange ? 'LISTENING' : 'IDLE');
      }, INTERACTION_CONFIG.stateCheckDelay);
    }
  };

  return {
    actionTarget,
    onActionDone
  };
}

