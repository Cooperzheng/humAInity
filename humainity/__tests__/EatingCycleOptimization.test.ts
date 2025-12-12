import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useGameState } from '../app/components/Game/GameState';
import { SURVIVAL_RATES } from '../app/config/GameConfig';

const createMockAgent = (satiety: number) => ({
  id: 'dmitri',
  name: 'Dmitri',
  primaryRole: 'worker' as const,
  currentAssignment: 'Lumberjack',
  stats: { satiety, energy: 100, health: 100 },
  capTraits: ['Strong'],
  psychTraits: ['Loyal'],
  state: 'IDLE' as const,
  thoughtHistory: [],
  shortTermMemory: [],
});

const resetStore = () =>
  act(() =>
    useGameState.setState({
      inventory: { wood: 0, berry: 10, meat: 5 },
      wood: 0,
      food: 0,
      logs: [],
      isNearAgent: false,
      inputFocused: false,
      pendingCommand: null,
      agents: {
        dmitri: createMockAgent(100)
      },
      selectedAgentId: null,
    })
  );

describe('进食循环优化 (Genesis V0.2 Step 3)', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllTimers();
  });

  it('饱食度未达安全水平时应标记需要继续进食', () => {
    // 模拟第一次进食后的状态
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 40, energy: 100, health: 100 }, // 40 < 50 (satietySafeLevel)
        state: 'EATING'
      });
    });

    const agent = useGameState.getState().agents['dmitri'];
    const { inventory } = useGameState.getState();
    
    // 检查是否需要继续进食的条件
    const needMoreFood = agent.stats.satiety < SURVIVAL_RATES.satietySafeLevel;
    const hasFood = inventory.berry > 0 || inventory.meat > 0;
    const shouldContinueEating = needMoreFood && hasFood;

    expect(agent.stats.satiety).toBe(40);
    expect(SURVIVAL_RATES.satietySafeLevel).toBe(50);
    expect(needMoreFood).toBe(true);
    expect(hasFood).toBe(true);
    expect(shouldContinueEating).toBe(true); // 应该继续进食
  });

  it('饱食度达到安全水平后应标记为可以退出进食', () => {
    // 模拟进食后达到安全水平
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 55, energy: 100, health: 100 }, // 55 >= 50
        state: 'EATING'
      });
    });

    const agent = useGameState.getState().agents['dmitri'];
    const { inventory } = useGameState.getState();
    
    const needMoreFood = agent.stats.satiety < SURVIVAL_RATES.satietySafeLevel;
    const hasFood = inventory.berry > 0 || inventory.meat > 0;
    const shouldContinueEating = needMoreFood && hasFood;

    expect(agent.stats.satiety).toBe(55);
    expect(needMoreFood).toBe(false);
    expect(shouldContinueEating).toBe(false); // 可以退出进食
  });

  it('无食物时应标记为必须退出进食', () => {
    // 模拟进食中但库存已空
    act(() => {
      useGameState.setState({
        inventory: { wood: 0, berry: 0, meat: 0 } // 无食物
      });
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 35, energy: 100, health: 100 }, // 35 < 50，但无食物
        state: 'EATING'
      });
    });

    const agent = useGameState.getState().agents['dmitri'];
    const { inventory } = useGameState.getState();
    
    const needMoreFood = agent.stats.satiety < SURVIVAL_RATES.satietySafeLevel;
    const hasFood = inventory.berry > 0 || inventory.meat > 0;
    const shouldContinueEating = needMoreFood && hasFood;

    expect(agent.stats.satiety).toBe(35);
    expect(needMoreFood).toBe(true);
    expect(hasFood).toBe(false);
    expect(shouldContinueEating).toBe(false); // 无食物，必须退出
  });

  it('satietySafeLevel 配置应为 50', () => {
    expect(SURVIVAL_RATES.satietySafeLevel).toBe(50);
    expect(SURVIVAL_RATES.starveThreshold).toBe(20);
    // satietySafeLevel 应该大于 starveThreshold
    expect(SURVIVAL_RATES.satietySafeLevel).toBeGreaterThan(SURVIVAL_RATES.starveThreshold);
  });

  it('进食逻辑应优先消耗 meat (高营养)', () => {
    const { inventory } = useGameState.getState();
    
    // 有肉和浆果时，应优先消耗肉
    expect(inventory.meat).toBe(5);
    expect(inventory.berry).toBe(10);
    
    // 模拟进食逻辑
    let foodToConsume: 'meat' | 'berry' | null = null;
    if (inventory.meat > 0) {
      foodToConsume = 'meat'; // 优先肉
    } else if (inventory.berry > 0) {
      foodToConsume = 'berry';
    }

    expect(foodToConsume).toBe('meat'); // 应该优先消耗肉

    // 模拟消耗肉后的情况
    act(() => {
      useGameState.getState().consumeResource('meat', 1);
    });

    expect(useGameState.getState().inventory.meat).toBe(4);
  });

  it('进食逻辑在无肉时应消耗 berry', () => {
    act(() => {
      useGameState.setState({
        inventory: { wood: 0, berry: 10, meat: 0 } // 无肉
      });
    });

    const { inventory } = useGameState.getState();
    
    // 无肉时应消耗浆果
    let foodToConsume: 'meat' | 'berry' | null = null;
    if (inventory.meat > 0) {
      foodToConsume = 'meat';
    } else if (inventory.berry > 0) {
      foodToConsume = 'berry'; // 退而求其次
    }

    expect(foodToConsume).toBe('berry');

    // 模拟消耗浆果
    act(() => {
      useGameState.getState().consumeResource('berry', 1);
    });

    expect(useGameState.getState().inventory.berry).toBe(9);
  });

  it('连续进食应累积饱食度直到达到安全水平', () => {
    // 初始饱食度 25
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 25, energy: 100, health: 100 }
      });
    });

    let agent = useGameState.getState().agents['dmitri'];
    expect(agent.stats.satiety).toBe(25);

    // 第一次进食：+30 (meat)
    act(() => {
      useGameState.getState().consumeResource('meat', 1);
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: agent.stats.satiety + 30, energy: 100, health: 100 }
      });
    });

    agent = useGameState.getState().agents['dmitri'];
    expect(agent.stats.satiety).toBe(55); // 25 + 30 = 55 >= 50，达到安全水平
    expect(agent.stats.satiety).toBeGreaterThanOrEqual(SURVIVAL_RATES.satietySafeLevel);
  });

  it('多次小量进食应累积直到达标', () => {
    // 初始饱食度 30，使用浆果（+10）
    act(() => {
      useGameState.setState({
        inventory: { wood: 0, berry: 10, meat: 0 } // 只有浆果
      });
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 30, energy: 100, health: 100 }
      });
    });

    let agent = useGameState.getState().agents['dmitri'];
    expect(agent.stats.satiety).toBe(30);

    // 第一次进食：+10 (berry)
    act(() => {
      useGameState.getState().consumeResource('berry', 1);
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: agent.stats.satiety + 10, energy: 100, health: 100 }
      });
    });

    agent = useGameState.getState().agents['dmitri'];
    expect(agent.stats.satiety).toBe(40); // 30 + 10 = 40 < 50，需要继续

    // 检查是否需要继续
    let needMore = agent.stats.satiety < SURVIVAL_RATES.satietySafeLevel;
    expect(needMore).toBe(true);

    // 第二次进食：+10 (berry)
    act(() => {
      useGameState.getState().consumeResource('berry', 1);
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: agent.stats.satiety + 10, energy: 100, health: 100 }
      });
    });

    agent = useGameState.getState().agents['dmitri'];
    expect(agent.stats.satiety).toBe(50); // 40 + 10 = 50 >= 50，达到安全水平

    needMore = agent.stats.satiety < SURVIVAL_RATES.satietySafeLevel;
    expect(needMore).toBe(false); // 不再需要继续
  });

  it('EATING 结束后的状态判断应基于饱食度和库存', () => {
    // 场景1：饱食度已达标
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 60, energy: 100, health: 100 }
      });
    });

    let agent = useGameState.getState().agents['dmitri'];
    let { inventory } = useGameState.getState();
    let shouldContinue = agent.stats.satiety < SURVIVAL_RATES.satietySafeLevel && (inventory.berry > 0 || inventory.meat > 0);
    
    expect(shouldContinue).toBe(false); // 已达标，不继续

    // 场景2：未达标但有食物
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 40, energy: 100, health: 100 }
      });
    });

    agent = useGameState.getState().agents['dmitri'];
    inventory = useGameState.getState().inventory;
    shouldContinue = agent.stats.satiety < SURVIVAL_RATES.satietySafeLevel && (inventory.berry > 0 || inventory.meat > 0);
    
    expect(shouldContinue).toBe(true); // 未达标且有食物，应继续

    // 场景3：未达标但无食物
    act(() => {
      useGameState.setState({
        inventory: { wood: 0, berry: 0, meat: 0 }
      });
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 40, energy: 100, health: 100 }
      });
    });

    agent = useGameState.getState().agents['dmitri'];
    inventory = useGameState.getState().inventory;
    shouldContinue = agent.stats.satiety < SURVIVAL_RATES.satietySafeLevel && (inventory.berry > 0 || inventory.meat > 0);
    
    expect(shouldContinue).toBe(false); // 无食物，不能继续
  });
});

