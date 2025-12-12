import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useGameState } from '../app/components/Game/GameState';

const createMockAgent = (id: string) => ({
  id,
  name: id.charAt(0).toUpperCase() + id.slice(1),
  primaryRole: 'worker' as const,
  currentAssignment: 'Lumberjack',
  stats: { satiety: 100, energy: 100, health: 100 },
  capTraits: ['Strong'],
  psychTraits: ['Loyal'],
  state: 'IDLE' as const,
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
        dmitri: createMockAgent('dmitri'),
        anna: createMockAgent('anna'),
      },
      selectedAgentId: null,
    })
  );

describe('智能体选中系统 (Genesis V0.2 Step 3)', () => {
  beforeEach(() => {
    resetStore();
  });

  it('初始状态下 selectedAgentId 应为 null', () => {
    const state = useGameState.getState();
    expect(state.selectedAgentId).toBeNull();
  });

  it('selectAgent 应设置 selectedAgentId', () => {
    act(() => {
      useGameState.getState().selectAgent('dmitri');
    });

    const state = useGameState.getState();
    expect(state.selectedAgentId).toBe('dmitri');
  });

  it('deselectAgent 应清空 selectedAgentId', () => {
    // 先选中
    act(() => {
      useGameState.getState().selectAgent('dmitri');
    });

    expect(useGameState.getState().selectedAgentId).toBe('dmitri');

    // 再取消选中
    act(() => {
      useGameState.getState().deselectAgent();
    });

    expect(useGameState.getState().selectedAgentId).toBeNull();
  });

  it('可以切换选中不同的智能体', () => {
    // 选中 dmitri
    act(() => {
      useGameState.getState().selectAgent('dmitri');
    });

    expect(useGameState.getState().selectedAgentId).toBe('dmitri');

    // 切换到 anna
    act(() => {
      useGameState.getState().selectAgent('anna');
    });

    expect(useGameState.getState().selectedAgentId).toBe('anna');
  });

  it('选中不存在的智能体ID应仍然设置 selectedAgentId', () => {
    // 这允许在智能体加载前就设置选中状态
    act(() => {
      useGameState.getState().selectAgent('nonexistent');
    });

    expect(useGameState.getState().selectedAgentId).toBe('nonexistent');
  });

  it('重复选中相同智能体应更新 selectedAgentId', () => {
    act(() => {
      useGameState.getState().selectAgent('dmitri');
    });

    expect(useGameState.getState().selectedAgentId).toBe('dmitri');

    // 再次选中相同智能体
    act(() => {
      useGameState.getState().selectAgent('dmitri');
    });

    expect(useGameState.getState().selectedAgentId).toBe('dmitri'); // 仍然是 dmitri
  });

  it('多次调用 deselectAgent 应保持 null', () => {
    act(() => {
      useGameState.getState().selectAgent('dmitri');
    });

    act(() => {
      useGameState.getState().deselectAgent();
    });

    expect(useGameState.getState().selectedAgentId).toBeNull();

    // 再次取消选中
    act(() => {
      useGameState.getState().deselectAgent();
    });

    expect(useGameState.getState().selectedAgentId).toBeNull(); // 仍然是 null
  });

  it('选中状态应独立于智能体状态变化', () => {
    act(() => {
      useGameState.getState().selectAgent('dmitri');
    });

    expect(useGameState.getState().selectedAgentId).toBe('dmitri');

    // 更新智能体状态
    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        state: 'WORKING'
      });
    });

    // selectedAgentId 应保持不变
    expect(useGameState.getState().selectedAgentId).toBe('dmitri');
    expect(useGameState.getState().agents['dmitri'].state).toBe('WORKING');
  });

  it('删除选中的智能体后 selectedAgentId 应保持（由UI层处理）', () => {
    act(() => {
      useGameState.getState().selectAgent('dmitri');
    });

    expect(useGameState.getState().selectedAgentId).toBe('dmitri');

    // 模拟删除智能体（从 agents 字典中移除）
    act(() => {
      const { agents } = useGameState.getState();
      const { dmitri, ...rest } = agents;
      useGameState.setState({ agents: rest });
    });

    // selectedAgentId 仍然存在（由UI层SoulInspector检测并处理）
    expect(useGameState.getState().selectedAgentId).toBe('dmitri');
    expect(useGameState.getState().agents['dmitri']).toBeUndefined();
  });
});

