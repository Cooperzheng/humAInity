import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useGameState } from '../app/components/Game/GameState';

const resetStore = () =>
  act(() =>
    useGameState.setState({
      wood: 0,
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

  it('addWood 累加资源', () => {
    const { addWood } = useGameState.getState();
    act(() => addWood(2));
    expect(useGameState.getState().wood).toBe(2);
  });

  it('addLog 记录系统日志', () => {
    const { addLog } = useGameState.getState();
    act(() => addLog('测试日志', 'system'));
    const last = useGameState.getState().logs.at(-1);
    expect(last?.text).toBe('测试日志');
    expect(last?.type).toBe('system');
  });
});

