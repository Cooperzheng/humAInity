'use client';

import { create } from 'zustand';
import { AgentProfile, AgentState } from '../../types/Agent';
import { INITIAL_RESOURCES } from '../../config/GameConfig';

export type LogItem = {
  id: number;
  text: string;
  type: 'chat' | 'system';
};

// 保留旧的 AgentState 导出以兼容现有代码
// @deprecated 使用 ../../types/Agent 中的 AgentState
// TODO: 在 Step 4 迁移完成后移除
export type { AgentState };

type GameStore = {
  // ========== 资源库存系统 (Genesis V0.2) ==========
  inventory: {
    wood: number;
    berry: number;
    meat: number;
  };
  
  // @deprecated 使用 inventory.wood 代替
  wood: number;
  // @deprecated 使用 inventory.berry 代替
  food: number;
  
  logs: LogItem[];
  isNearAgent: boolean;
  inputFocused: boolean;
  pendingCommand: string | null;
  
  // ========== 多智能体系统 (Genesis V0.2) ==========
  /**
   * agents: 智能体字典 (key为id)
   * 支持多个智能体并行管理
   */
  agents: Record<string, AgentProfile>;
  
  /**
   * selectedAgentId: 当前选中的智能体ID
   * 用于 UI 显示"灵魂透视镜"面板
   */
  selectedAgentId: string | null;
  
  // ========== Actions ==========
  addLog: (text: string, type?: LogItem['type']) => void;
  
  // 资源操作 (Genesis V0.2)
  addResource: (type: 'wood' | 'berry' | 'meat', amount: number) => void;
  consumeResource: (type: 'wood' | 'berry' | 'meat', amount: number) => boolean;
  
  // @deprecated 使用 addResource('wood', n) 代替
  addWood: (n: number) => void;
  // @deprecated 使用 addResource('berry', n) 代替
  addFood: (n: number) => void;
  
  setNearAgent: (v: boolean) => void;
  setInputFocused: (v: boolean) => void;
  setPendingCommand: (cmd: string | null) => void;
  
  /**
   * updateAgent: 更新智能体状态
   * @param id - 智能体ID
   * @param updates - 部分更新的字段
   */
  updateAgent: (id: string, updates: Partial<AgentProfile>) => void;
  
  /**
   * selectAgent: 选中智能体（用于UI显示详情）
   * @param id - 智能体ID
   */
  selectAgent: (id: string) => void;
  
  /**
   * deselectAgent: 取消选中
   */
  deselectAgent: () => void;
  
  /**
   * modifyAllAgents: GM 工具 - 批量修改所有智能体
   * @param modifier - 修改函数
   */
  modifyAllAgents: (modifier: (agent: AgentProfile) => AgentProfile) => void;
};

export const useGameState = create<GameStore>((set) => ({
  // ========== 资源库存初始化 (Genesis V0.2) ==========
  inventory: {
    wood: INITIAL_RESOURCES.wood,
    berry: INITIAL_RESOURCES.berry,
    meat: INITIAL_RESOURCES.meat,
  },
  
  // 兼容层 - 映射到 inventory（保持旧测试兼容，初始值为 0）
  wood: 0,
  food: 0,
  
  logs: [],
  isNearAgent: false,
  inputFocused: false,
  pendingCommand: null,
  
  // ========== 初始化默认智能体：Dmitri ==========
  agents: {
    'dmitri': {
      id: 'dmitri',
      name: 'Dmitri',
      primaryRole: 'worker',
      currentAssignment: 'Lumberjack',  // 初始职责：伐木工
      stats: {
        satiety: 100,  // 满饱食度
        energy: 100,   // 满精力
        health: 100,   // 满血
      },
      capTraits: ['Strong'],      // 能力特质：强壮
      psychTraits: ['Loyal'],     // 心理特质：忠诚
      state: 'IDLE',              // 初始状态：闲置
      thoughtHistory: [],
      shortTermMemory: [],
    }
  },
  selectedAgentId: null,
  
  // ========== Resource Actions ==========
  addLog: (text, type = 'system') =>
    set((state) => ({
      logs: [...state.logs, { id: Date.now(), text, type }].slice(-200),
    })),
  
  // Genesis V0.2: 新资源系统
  addResource: (type, amount) =>
    set((state) => {
      const newInventory = {
        ...state.inventory,
        [type]: state.inventory[type] + amount,
      };
      // 同步兼容层（仅 wood, food 映射不影响 inventory）
      const updates: any = { inventory: newInventory };
      if (type === 'wood') updates.wood = state.wood + amount;
      if (type === 'berry') updates.food = state.food + amount;
      return updates;
    }),
  
  consumeResource: (type, amount) => {
    const state = useGameState.getState();
    if (state.inventory[type] >= amount) {
      set((state) => {
        const newInventory = {
          ...state.inventory,
          [type]: state.inventory[type] - amount,
        };
        // 同步兼容层
        const updates: any = { inventory: newInventory };
        if (type === 'wood') updates.wood = state.wood - amount;
        if (type === 'berry') updates.food = state.food - amount;
        return updates;
      });
      return true;
    }
    return false;
  },
  
  // 兼容层 (Deprecated) - 独立计数，不影响 inventory
  addWood: (n) =>
    set((state) => ({
      wood: state.wood + n,
    })),
  addFood: (n) =>
    set((state) => ({
      food: state.food + n,
    })),
  
  setNearAgent: (v) => set(() => ({ isNearAgent: v })),
  setInputFocused: (v) => set(() => ({ inputFocused: v })),
  setPendingCommand: (cmd) => set(() => ({ pendingCommand: cmd })),
  
  // ========== Agent Actions (Genesis V0.2) ==========
  updateAgent: (id, updates) =>
    set((state) => {
      const oldAgent = state.agents[id];
      
      // 检测 currentAssignment 变化时自动生成想法
      const assignmentChanged = 
        updates.currentAssignment && 
        updates.currentAssignment !== oldAgent.currentAssignment;
      
      let newThoughtHistory = updates.thoughtHistory || oldAgent.thoughtHistory;
      
      if (assignmentChanged) {
        const newThought = {
          tick: Date.now(),
          content: `我的新职责是 ${updates.currentAssignment}，我会尽力完成的。`,
          trigger: '职责变更',
          mood: 'determined'
        };
        // 将新想法追加到开头（最新在 index 0）
        newThoughtHistory = [newThought, ...oldAgent.thoughtHistory].slice(0, 20);
        console.log(`[GameState] Agent ${id} assignment changed: ${oldAgent.currentAssignment} -> ${updates.currentAssignment}`);
      }
      
      return {
        agents: {
          ...state.agents,
          [id]: {
            ...oldAgent,
            ...updates,
            thoughtHistory: newThoughtHistory,
          },
        },
      };
    }),
  
  selectAgent: (id) => set(() => ({ selectedAgentId: id })),
  
  deselectAgent: () => set(() => ({ selectedAgentId: null })),
  
  // ========== GM Tools (Genesis V0.2) ==========
  modifyAllAgents: (modifier) =>
    set((state) => {
      const newAgents: Record<string, AgentProfile> = {};
      Object.entries(state.agents).forEach(([id, agent]) => {
        newAgents[id] = modifier(agent);
      });
      return { agents: newAgents };
    }),
}));

// ========== 兼容层 (Compatibility Layer) ==========
// 为现有代码提供临时兼容，供 WorkerAgent 和 useGameLogic 使用
// @deprecated 在 Step 4 迁移完成后移除此兼容层
// TODO: 迁移所有现有代码使用 agents 字典后删除

/**
 * useAgentState - 获取 dmitri 的状态（兼容旧代码）
 * @deprecated 使用 useGameState((s) => s.agents['dmitri'].state)
 */
export const useAgentState = () => {
  const dmitriState = useGameState((s) => s.agents['dmitri']?.state || 'IDLE');
  return dmitriState;
};

/**
 * useSetAgentState - 设置 dmitri 的状态（兼容旧代码）
 * @deprecated 使用 useGameState((s) => s.updateAgent('dmitri', { state: newState }))
 */
export const useSetAgentState = () => {
  const updateAgent = useGameState((s) => s.updateAgent);
  return (state: AgentState) => updateAgent('dmitri', { state });
};

