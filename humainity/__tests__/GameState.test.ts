import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useGameState } from '../app/components/Game/GameState';

const resetStore = () =>
  act(() =>
    useGameState.setState({
      wood: 0,
      food: 0,
      logs: [],
      isNearAgent: false,
      inputFocused: false,
      agentState: 'IDLE',
      pendingCommand: null,
    })
  );

describe('useGameState store', () => {
  beforeEach(() => {
    resetStore();
  });

  it('初始状态：wood 和 food 均为 0', () => {
    const state = useGameState.getState();
    expect(state.wood).toBe(0);
    expect(state.food).toBe(0);
  });

  it('addWood 累加资源', () => {
    const { addWood } = useGameState.getState();
    act(() => addWood(2));
    expect(useGameState.getState().wood).toBe(2);
  });

  it('addFood 累加食物资源', () => {
    const { addFood } = useGameState.getState();
    act(() => addFood(3));
    expect(useGameState.getState().food).toBe(3);
    act(() => addFood(2));
    expect(useGameState.getState().food).toBe(5);
  });

  it('addLog 记录系统日志', () => {
    const { addLog } = useGameState.getState();
    act(() => addLog('测试日志', 'system'));
    const last = useGameState.getState().logs.at(-1);
    expect(last?.text).toBe('测试日志');
    expect(last?.type).toBe('system');
  });
});

