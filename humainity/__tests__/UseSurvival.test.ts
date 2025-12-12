import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSurvival } from '../app/hooks/useSurvival';
import { useGameState } from '../app/components/Game/GameState';
import { SURVIVAL_RATES } from '../app/config/GameConfig';

const createMockAgent = (satiety: number, energy: number, state: string) => ({
  id: 'dmitri',
  name: 'Dmitri',
  primaryRole: 'worker' as const,
  currentAssignment: 'Lumberjack',
  stats: { satiety, energy, health: 100 },
  capTraits: ['Strong'],
  psychTraits: ['Loyal'],
  state,
  thoughtHistory: [],
  shortTermMemory: [],
});

const resetStore = () =>
  act(() =>
    useGameState.setState({
      inventory: { wood: 0, berry: 50, meat: 0 },
      wood: 0,
      food: 0,
      logs: [],
      isNearAgent: false,
      inputFocused: false,
      pendingCommand: null,
      agents: {
        dmitri: createMockAgent(100, 100, 'IDLE')
      },
      selectedAgentId: null,
    })
  );

describe('useSurvival Hook 单元测试 (Genesis V0.2)', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('闲置状态下每秒饱食度应衰减 0.1', () => {
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 100, energy: 100, health: 100 },
        state: 'IDLE' // 闲置状态
      });
    });

    // 渲染 Hook
    renderHook(() => useSurvival());

    // 模拟1秒时间流逝
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    // 100 - 0.1 = 99.9
    expect(agent.stats.satiety).toBeCloseTo(99.9, 1);
  });

  it('工作状态下每秒饱食度应衰减 0.3', () => {
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 100, energy: 100, health: 100 },
        state: 'WORKING' // 工作状态
      });
    });

    renderHook(() => useSurvival());

    // 模拟1秒
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    // 100 - 0.3 = 99.7
    expect(agent.stats.satiety).toBeCloseTo(99.7, 1);
  });

  it('闲置状态下每秒精力应衰减 0.05', () => {
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 100, energy: 100, health: 100 },
        state: 'IDLE'
      });
    });

    renderHook(() => useSurvival());

    // 模拟1秒
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    // 100 - 0.05 = 99.95
    expect(agent.stats.energy).toBeCloseTo(99.95, 2);
  });

  it('工作状态下每秒精力应衰减 0.2', () => {
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 100, energy: 100, health: 100 },
        state: 'DELIVERING' // DELIVERING 也是工作状态
      });
    });

    renderHook(() => useSurvival());

    // 模拟1秒
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    // 100 - 0.2 = 99.8
    expect(agent.stats.energy).toBeCloseTo(99.8, 1);
  });

  it('SLEEPING 状态下精力应每秒恢复 5.0', () => {
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 100, energy: 30, health: 100 },
        state: 'SLEEPING'
      });
    });

    renderHook(() => useSurvival());

    // 模拟1秒
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    // 30 + 5.0 = 35
    expect(agent.stats.energy).toBeCloseTo(35, 1);
  });

  it('SLEEPING 状态下精力达到 50 时应自动唤醒为 IDLE', () => {
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 100, energy: 46, health: 100 },
        state: 'SLEEPING'
      });
    });

    renderHook(() => useSurvival());

    // 模拟1秒：46 + 5 = 51 >= 50
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    expect(agent.stats.energy).toBeCloseTo(51, 1);
    expect(agent.state).toBe('IDLE'); // 自动唤醒
  });

  it('饱食度 < 20 时应触发 STARVING 状态', () => {
    // 直接设置饱食度为 19（已低于阈值）
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 19, energy: 100, health: 100 },
        state: 'IDLE'
      });
    });

    renderHook(() => useSurvival());

    // 模拟1秒，触发检测
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    expect(agent.stats.satiety).toBeLessThan(SURVIVAL_RATES.starveThreshold);
    expect(agent.state).toBe('STARVING');
  });

  it('精力 < 10 时应触发 EXHAUSTED 状态', () => {
    // 直接设置精力为 9（已低于阈值）
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 100, energy: 9, health: 100 },
        state: 'IDLE'
      });
    });

    renderHook(() => useSurvival());

    // 模拟1秒，触发检测
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    expect(agent.stats.energy).toBeLessThan(SURVIVAL_RATES.exhaustThreshold);
    expect(agent.state).toBe('EXHAUSTED');
  });

  it('已在 SEEKING_FOOD 状态的智能体不应被重复触发 STARVING', () => {
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 15, energy: 100, health: 100 },
        state: 'SEEKING_FOOD' // 已经在寻找食物
      });
    });

    renderHook(() => useSurvival());

    // 模拟1秒
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    expect(agent.state).toBe('SEEKING_FOOD'); // 保持原状态，不切换为 STARVING
  });

  it('已在 EATING 状态的智能体不应被重复触发 STARVING', () => {
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 18, energy: 100, health: 100 },
        state: 'EATING' // 正在进食
      });
    });

    renderHook(() => useSurvival());

    // 模拟1秒
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    expect(agent.state).toBe('EATING'); // 保持进食状态
  });

  it('已在 SLEEPING 状态的智能体不应被重复触发 EXHAUSTED', () => {
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 100, energy: 8, health: 100 },
        state: 'SLEEPING' // 已经在睡觉
      });
    });

    renderHook(() => useSurvival());

    // 模拟1秒（睡眠会恢复精力）
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    expect(agent.state).toBe('SLEEPING'); // 保持睡眠状态
    expect(agent.stats.energy).toBeCloseTo(13, 1); // 8 + 5 = 13
  });

  it('跨层级状态变化时应生成想法', () => {
    // 直接设置饱食度为 19（已低于阈值）
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 19, energy: 100, health: 100 },
        state: 'IDLE', // P3 状态
        thoughtHistory: []
      });
    });

    renderHook(() => useSurvival());

    // 模拟1秒使其触发 STARVING (P1 状态)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    expect(agent.state).toBe('STARVING'); // P3 -> P1
    expect(agent.thoughtHistory.length).toBeGreaterThan(0); // 应该生成了想法
    expect(agent.thoughtHistory[0].trigger).toBe('饥饿触发');
  });

  it('同层级状态变化时不应生成想法', () => {
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 18, energy: 100, health: 100 },
        state: 'STARVING', // P1 状态
        thoughtHistory: [{
          tick: 100,
          content: '已有的想法',
          trigger: '测试',
          mood: 'test'
        }]
      });
    });

    const initialThoughtCount = useGameState.getState().agents['dmitri'].thoughtHistory.length;
    expect(initialThoughtCount).toBe(1);

    renderHook(() => useSurvival());

    // 状态保持在 STARVING（已经跳过状态切换）或切换到 SEEKING_FOOD (同样是 P1)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    // STARVING 和 SEEKING_FOOD 都是 P1，不应生成新想法
    expect(agent.thoughtHistory.length).toBe(initialThoughtCount); // 想法数量不变
  });

  it('数值衰减不应超过边界（不低于0，不高于100）', () => {
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 0.05, energy: 0.03, health: 100 },
        state: 'IDLE'
      });
    });

    renderHook(() => useSurvival());

    // 模拟1秒（理论上会变负，但应该被限制为0）
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    expect(agent.stats.satiety).toBeGreaterThanOrEqual(0);
    expect(agent.stats.energy).toBeGreaterThanOrEqual(0);
  });

  it('精力恢复不应超过 100', () => {
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        stats: { satiety: 100, energy: 98, health: 100 },
        state: 'SLEEPING'
      });
    });

    renderHook(() => useSurvival());

    // 模拟1秒：98 + 5 = 103，应该被限制为 100
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const agent = useGameState.getState().agents['dmitri'];
    expect(agent.stats.energy).toBeLessThanOrEqual(100);
    expect(agent.stats.energy).toBeCloseTo(100, 0);
  });

  it('MOVING, DELIVERING, ACTING 状态应使用工作消耗率', () => {
    const workStates = ['MOVING', 'DELIVERING', 'ACTING'];

    workStates.forEach((state) => {
      resetStore();
      
      act(() => {
        useGameState.getState().updateAgent('dmitri', {
          stats: { satiety: 100, energy: 100, health: 100 },
          state
        });
      });

      renderHook(() => useSurvival());

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const agent = useGameState.getState().agents['dmitri'];
      // 工作状态消耗率
      expect(agent.stats.satiety).toBeCloseTo(99.7, 1); // 100 - 0.3
      expect(agent.stats.energy).toBeCloseTo(99.8, 1); // 100 - 0.2
    });
  });
});

