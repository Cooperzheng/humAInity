'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState, AgentState } from '../components/Game/GameState';
import { ResourceType } from '../components/World/ResourceTile';
import {
  INTERACTION_CONFIG,
  HISMA_DELAY_CONFIG,
  RESPONSE_DELAY_CONFIG,
  ACTION_CONFIG,
  RESOURCE_CONFIG,
  FACILITIES,
  FOOD_TYPES,
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
    pendingCommand,
    setPendingCommand,
    addLog,
    addWood,
    isNearAgent,
    inputFocused,
    agents,         // Genesis V0.2: 使用 agents 字典
    updateAgent,    // Genesis V0.2: 更新智能体状态
    inventory,      // Genesis V0.2: 库存系统
    consumeResource, // Genesis V0.2: 消费资源
    addResource,    // Genesis V0.2: 添加资源
  } = useGameState();
  
  // 获取 dmitri 的状态（兼容现有逻辑）
  const dmitri = agents['dmitri'];
  const agentState = dmitri?.state || 'IDLE';
  const setAgentState = (state: AgentState) => updateAgent('dmitri', { state });

  const [actionTarget, setActionTarget] = useState<{ x: number; z: number } | null>(null);
  const actionDoneRef = useRef<() => void>(() => {});
  const waitingQuantityRef = useRef(false);
  const chopQueueRef = useRef(0);

  // 使用 ref 缓存上一次的状态，避免频繁更新
  const lastNearRef = useRef(false);
  // 缓存待更新的状态，避免在 useFrame 中直接调用 setState
  const pendingStateUpdateRef = useRef<AgentState | null>(null);
  // HISMA: 状态锁定（用于“卸货/进食”等短暂停留期间，禁止近场逻辑抢占）
  const stateLockUntilRef = useRef<number>(0);
  // 统一管理本 Hook 内创建的 timeout，避免卸载/状态切换后回写
  const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const registerTimeout = (id: ReturnType<typeof setTimeout>) => {
    timeoutsRef.current.push(id);
    return id;
  };
  const eatingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const postDeliveryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrivalHandledRef = useRef({
    seekingFood: false,
    delivering: false,
    sleeping: false,
  });

  const arbitrateIdleOrListening = (): AgentState => {
    if (!agentRef.current || !playerRef.current) return 'IDLE';
    const dx = playerRef.current.position.x - agentRef.current.position.x;
    const dz = playerRef.current.position.z - agentRef.current.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    return dist < INTERACTION_CONFIG.interactionRange ? 'LISTENING' : 'IDLE';
  };

  // unmount cleanup：清理所有 timeout，避免 setState on unmounted
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
      if (eatingTimeoutRef.current) clearTimeout(eatingTimeoutRef.current);
      if (postDeliveryTimeoutRef.current) clearTimeout(postDeliveryTimeoutRef.current);
    };
  }, []);

  // 状态切换时，取消不再需要的延迟回调，避免旧计时器回写
  useEffect(() => {
    if (agentState !== 'EATING' && eatingTimeoutRef.current) {
      clearTimeout(eatingTimeoutRef.current);
      eatingTimeoutRef.current = null;
    }
    if (agentState !== 'IDLE' && postDeliveryTimeoutRef.current) {
      clearTimeout(postDeliveryTimeoutRef.current);
      postDeliveryTimeoutRef.current = null;
    }
  }, [agentState]);

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

    // ====== HISMA: 到达检测（必须在 useFrame 中做，确保位置变化能触发） ======
    // SEEKING_FOOD：到达储粮点 -> 切换 EATING，并在延迟后结算
    if (agentState === 'SEEKING_FOOD' && actionTarget && !arrivalHandledRef.current.seekingFood) {
      const dx2 = agentRef.current.position.x - actionTarget.x;
      const dz2 = agentRef.current.position.z - actionTarget.z;
      const dist2 = Math.sqrt(dx2 * dx2 + dz2 * dz2);
      if (dist2 < INTERACTION_CONFIG.arrivalThreshold) {
        arrivalHandledRef.current.seekingFood = true;

        // 到达后开始“吃饭表现”
        setAgentState('EATING');
        stateLockUntilRef.current = Date.now() + HISMA_DELAY_CONFIG.eatingMs;

        // 进食期间停在原地
        setActionTarget(null);

        if (eatingTimeoutRef.current) clearTimeout(eatingTimeoutRef.current);
        eatingTimeoutRef.current = registerTimeout(setTimeout(() => {
          // 若状态已被打断（理论上不会），则不结算
          const current = useGameState.getState().agents['dmitri'];
          if (!current || current.state !== 'EATING') return;

          let consumed = false;
          let restoredAmount = 0;

          // 优先吃肉，再吃浆果
          if (consumeResource('meat', 1)) {
            restoredAmount = FOOD_TYPES.meat.restore;
            consumed = true;
            addLog(`系统：德米特里食用了${FOOD_TYPES.meat.icon}${FOOD_TYPES.meat.name}，恢复饱食度 +${restoredAmount}。`, 'system');
          } else if (consumeResource('berry', 1)) {
            restoredAmount = FOOD_TYPES.berry.restore;
            consumed = true;
            addLog(`系统：德米特里食用了${FOOD_TYPES.berry.icon}${FOOD_TYPES.berry.name}，恢复饱食度 +${restoredAmount}。`, 'system');
          }

          const d = useGameState.getState().agents['dmitri'];
          if (consumed && d) {
            const newSatiety = Math.min(100, d.stats.satiety + restoredAmount);
            updateAgent('dmitri', { stats: { ...d.stats, satiety: newSatiety } });
          }

          // 进食结束：按距离仲裁（你选择：near->LISTENING，否则->IDLE）
          setAgentState(arbitrateIdleOrListening());
        }, HISMA_DELAY_CONFIG.eatingMs));
      }
    } else if (agentState !== 'SEEKING_FOOD') {
      arrivalHandledRef.current.seekingFood = false;
    }

    // DELIVERING：到达储粮点 -> 入库后“卸货驻留”延迟，再仲裁
    if (agentState === 'DELIVERING' && actionTarget && !arrivalHandledRef.current.delivering) {
      const dx2 = agentRef.current.position.x - actionTarget.x;
      const dz2 = agentRef.current.position.z - actionTarget.z;
      const dist2 = Math.sqrt(dx2 * dx2 + dz2 * dz2);
      if (dist2 < INTERACTION_CONFIG.arrivalThreshold) {
        arrivalHandledRef.current.delivering = true;

        addResource('wood', RESOURCE_CONFIG.woodPerTree);
        addLog('系统：德米特里将木材送回储粮点，木材 +1。', 'system');

        setActionTarget(null);
        setAgentState('IDLE'); // 卸货期间保持 IDLE
        stateLockUntilRef.current = Date.now() + HISMA_DELAY_CONFIG.deliveryUnloadMs;

        if (postDeliveryTimeoutRef.current) clearTimeout(postDeliveryTimeoutRef.current);
        postDeliveryTimeoutRef.current = registerTimeout(setTimeout(() => {
          // 卸货结束：按距离仲裁
          setAgentState(arbitrateIdleOrListening());
        }, HISMA_DELAY_CONFIG.deliveryUnloadMs));
      }
    } else if (agentState !== 'DELIVERING') {
      arrivalHandledRef.current.delivering = false;
    }

    // SLEEPING：到达篝火后，停留（由 useSurvival 控制何时醒来）
    if (agentState === 'SLEEPING' && actionTarget && !arrivalHandledRef.current.sleeping) {
      const dx2 = agentRef.current.position.x - actionTarget.x;
      const dz2 = agentRef.current.position.z - actionTarget.z;
      const dist2 = Math.sqrt(dx2 * dx2 + dz2 * dz2);
      if (dist2 < INTERACTION_CONFIG.arrivalThreshold) {
        arrivalHandledRef.current.sleeping = true;
        setActionTarget(null);
        addLog('系统：德米特里在篝火旁沉沉睡去...', 'system');
      }
    } else if (agentState !== 'SLEEPING') {
      arrivalHandledRef.current.sleeping = false;
    }

    // ====== 近场自动切换：仅在非执行状态 + 非锁定期内生效 ======
    const now = Date.now();
    if (now < stateLockUntilRef.current) return;

    // 如果玩家正在输入，或NPC正在执行任务/生存动作，不要强制切换状态
    if (
      inputFocused ||
      agentState === 'THINKING' ||
      agentState === 'ACTING' ||
      agentState === 'ASKING' ||
      agentState === 'SEEKING_FOOD' ||
      agentState === 'EATING' ||
      agentState === 'DELIVERING' ||
      agentState === 'SLEEPING' ||
      agentState === 'EXHAUSTED' ||
      agentState === 'STARVING'
    ) return;
    
    // 根据距离决定目标状态，使用 ref 缓存避免在渲染期间 setState
    if (near && agentState !== 'LISTENING') {
      pendingStateUpdateRef.current = 'LISTENING';
    } else if (!near && agentState !== 'IDLE') {
      pendingStateUpdateRef.current = 'IDLE';
    }
  });

  // 应用待更新的状态（在渲染完成后安全执行）
  useEffect(() => {
    if (pendingStateUpdateRef.current) {
      const newState = pendingStateUpdateRef.current;
      pendingStateUpdateRef.current = null;
      setAgentState(newState);
    }
  });

  // ========== HISMA P1: 生存本能层 - 进食逻辑 (Genesis V0.2) ==========
  useEffect(() => {
    if (agentState !== 'STARVING') return;
    
    // 检查库存是否有食物
    if (inventory.meat > 0 || inventory.berry > 0) {
      // 前往储粮点
      setActionTarget({ x: FACILITIES.granary[0], z: FACILITIES.granary[2] });
      setAgentState('SEEKING_FOOD');
      addLog('系统：德米特里感到饥饿，前往储粮点寻找食物。', 'system');
    } else {
      // 库存不足，显示警告（每5秒提示一次，避免刷屏）
      addLog('系统：⚠️ 警告！储粮点无食物，德米特里陷入饥饿状态。', 'system');
    }
  }, [agentState, inventory]);

  // ========== HISMA P1: 生存本能层 - 睡眠逻辑 (Genesis V0.2) ==========
  useEffect(() => {
    if (agentState !== 'EXHAUSTED') return;
    
    // 前往篝火休息
    setActionTarget({ x: FACILITIES.bonfire[0], z: FACILITIES.bonfire[2] });
    setAgentState('SLEEPING');
    addLog('系统：德米特里精力耗尽，前往篝火旁休息。', 'system');
  }, [agentState]);

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
      registerTimeout(setTimeout(() => addLog('德米特里: （距离太远，我听不到你在说什么...）', 'chat'), getRandomDelay(RESPONSE_DELAY_CONFIG.tooFar)));
      return;
    }

    // 玩家消息已在 GameUI 中立即显示，这里不再重复
    if (!isChop) {
      // 随机延迟 NPC 回复
      registerTimeout(setTimeout(() => addLog('德米特里: 收到，但我暂时只会砍树相关的指令。', 'chat'), getRandomDelay(RESPONSE_DELAY_CONFIG.unsupportedCommand)));
      return;
    }

    // 询问数量（随机延迟）
    setAgentState('ASKING');
    waitingQuantityRef.current = true;
    registerTimeout(setTimeout(() => addLog('德米特里: 需要砍几棵树？', 'chat'), getRandomDelay(RESPONSE_DELAY_CONFIG.askQuantity)));
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
      registerTimeout(setTimeout(() => addLog('德米特里: 没听清数量，请再说一次数字。', 'chat'), firstDelay + secondDelay));
      return;
    }
    const qty = Math.max(ACTION_CONFIG.minChopQuantity, Math.min(ACTION_CONFIG.maxChopQuantity, parseInt(numMatch[0], 10)));
    chopQueueRef.current = qty;
    
    // 随机延迟 NPC 确认回复
    const confirmDelay = getRandomDelay(RESPONSE_DELAY_CONFIG.confirm);
    registerTimeout(setTimeout(() => addLog(`德米特里: 好的，砍 ${qty} 棵。`, 'chat'), confirmDelay));
    
    // NPC 说完话后再开始行动（额外等待 500-800ms）
    registerTimeout(setTimeout(() => {
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
    }, confirmDelay + getRandomDelay(RESPONSE_DELAY_CONFIG.actionStart))); // NPC 说完话后再开始行动
  }, [pendingCommand, addLog, setPendingCommand, setAgentState, resources, isNearAgent, leaderName]);

  // 砍树完成逻辑
  const onActionDone = () => {
    // ========== HISMA P3: 砍树完成逻辑 ==========
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
      registerTimeout(setTimeout(() => {
        setResources((current) => current.filter((r) => r.id !== treeId));
      }, RESOURCE_CONFIG.treeRemovalDelay));
      
      return clone;
    });
    
    // 注意：此时不立即添加木材到库存，而是标记为"待运送"
    // 木材将在 DELIVERING 到达储粮点后再添加
    addLog('系统：德米特里砍伐了树木。', 'system');
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
          registerTimeout(setTimeout(() => {
            if (!agentRef.current || !playerRef.current) {
              setAgentState('IDLE');
              return;
            }
            const dx = playerRef.current.position.x - agentRef.current.position.x;
            const dz = playerRef.current.position.z - agentRef.current.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            setAgentState(dist < INTERACTION_CONFIG.interactionRange ? 'LISTENING' : 'IDLE');
          }, INTERACTION_CONFIG.stateCheckDelay));
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
      // ========== HISMA P3: 所有砍树任务完成，返回储粮点归库 (Genesis V0.2) ==========
      setActionTarget({ x: FACILITIES.granary[0], z: FACILITIES.granary[2] });
      setAgentState('DELIVERING');
      addLog('系统：德米特里准备将木材送回储粮点。', 'system');
    }
  };

  return {
    actionTarget,
    onActionDone
  };
}

