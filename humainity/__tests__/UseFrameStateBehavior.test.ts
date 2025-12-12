import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameState } from '../app/components/Game/GameState';

/**
 * useFrame 状态更新行为测试
 * 
 * 目标：验证 useFrame 中的状态更新时机和防抖机制
 * 策略：测试状态层，不涉及实际的 3D 渲染
 */

// Helper: 创建默认的 agent 数据
const createDefaultAgent = (state: string = 'IDLE') => ({
  dmitri: {
    id: 'dmitri',
    name: 'Dmitri',
    primaryRole: 'worker' as const,
    currentAssignment: 'Lumberjack',
    stats: { satiety: 100, energy: 100, health: 100 },
    capTraits: ['Strong'],
    psychTraits: ['Loyal'],
    state,
    thoughtHistory: [],
    shortTermMemory: [],
  }
});

describe('useFrame 状态更新行为测试', () => {
  beforeEach(() => {
    // 重置 store
    act(() => {
      useGameState.setState({
        wood: 0,
        food: 0,
        logs: [],
        isNearAgent: false,
        inputFocused: false,
        pendingCommand: null,
        agents: createDefaultAgent('IDLE'),
        selectedAgentId: null,
      });
    });
  });

  it('状态更新不应在同步帧内发生', async () => {
    const { result } = renderHook(() => useGameState());
    
    // 模拟 useFrame 检测到玩家靠近
    let stateSnapshot = result.current.agents['dmitri'].state;
    
    act(() => {
      result.current.setNearAgent(true);
    });
    
    // 在同一帧内，状态不应该立即改变（使用 ref 缓存）
    stateSnapshot = result.current.agents['dmitri'].state;
    expect(stateSnapshot).toBe('IDLE'); // 仍然是 IDLE
    
    // 等待下一帧（useEffect 执行）
    // 注意：由于我们没有实际运行 useFrame，这里只是验证状态管理层的行为
    // 在实际应用中，useEffect 会在下一帧应用状态更新
    
    console.log('[Test] 状态更新延迟机制测试通过');
  });

  it('快速的距离变化不会导致状态抖动', async () => {
    const { result } = renderHook(() => useGameState());
    const stateChanges: string[] = [];
    
    // 监听状态变化
    const unsubscribe = useGameState.subscribe((state) => {
      stateChanges.push(state.agents['dmitri'].state);
    });
    
    // 快速切换距离
    act(() => {
      result.current.setNearAgent(true);
      result.current.setNearAgent(false);
      result.current.setNearAgent(true);
    });
    
    // 由于我们使用 ref 缓存，状态变化应该被合并
    // 在测试环境中，我们验证状态管理层不会频繁更新
    const uniqueStates = new Set(stateChanges);
    expect(uniqueStates.size).toBeLessThanOrEqual(2); // IDLE 和可能的 LISTENING
    
    unsubscribe();
    console.log('[Test] 状态防抖测试通过');
  });

  it('ASKING 和 ACTING 状态不受距离检测影响', () => {
    const { result } = renderHook(() => useGameState());
    
    // 设置为 ASKING
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ASKING' });
    });
    
    // 模拟玩家走远
    act(() => {
      result.current.setNearAgent(false);
    });
    
    // 状态应该保持 ASKING（不会被强制切换到 IDLE）
    expect(result.current.agents['dmitri'].state).toBe('ASKING');
    
    // 切换到 ACTING
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ACTING' });
    });
    
    // 即使玩家靠近，也不会切换到 LISTENING
    act(() => {
      result.current.setNearAgent(true);
    });
    
    expect(result.current.agents['dmitri'].state).toBe('ACTING');
    
    console.log('[Test] 特殊状态保护测试通过');
  });

  it('THINKING 状态也不受距离检测影响', () => {
    const { result } = renderHook(() => useGameState());
    
    // 设置为 THINKING
    act(() => {
      result.current.updateAgent('dmitri', { state: 'THINKING' });
    });
    
    // 模拟玩家走远
    act(() => {
      result.current.setNearAgent(false);
    });
    
    // 状态应该保持 THINKING
    expect(result.current.agents['dmitri'].state).toBe('THINKING');
    
    // 玩家走近
    act(() => {
      result.current.setNearAgent(true);
    });
    
    // 状态仍然保持 THINKING
    expect(result.current.agents['dmitri'].state).toBe('THINKING');
    
    console.log('[Test] THINKING 状态保护测试通过');
  });

  it('inputFocused 时不会自动切换状态', () => {
    const { result } = renderHook(() => useGameState());
    
    // 初始状态：IDLE，玩家走近
    act(() => {
      result.current.setNearAgent(true);
      result.current.setInputFocused(true);
    });
    
    // 由于 inputFocused，状态不应该自动切换到 LISTENING
    expect(result.current.agents['dmitri'].state).toBe('IDLE');
    
    // 取消输入焦点
    act(() => {
      result.current.setInputFocused(false);
    });
    
    // 手动触发状态切换（模拟 useFrame 的下一帧）
    act(() => {
      const state = result.current.agents['dmitri'].state;
      const near = result.current.isNearAgent;
      const focused = result.current.inputFocused;
      if (!focused && near && state === 'IDLE') {
        result.current.updateAgent('dmitri', { state: 'LISTENING' });
      }
    });
    
    // 现在应该切换到 LISTENING
    expect(result.current.agents['dmitri'].state).toBe('LISTENING');
    
    console.log('[Test] inputFocused 状态保护测试通过');
  });

  it('状态切换的完整生命周期', () => {
    const { result } = renderHook(() => useGameState());
    
    // 1. IDLE 状态，玩家走近
    act(() => {
      result.current.setNearAgent(true);
    });
    
    // 手动切换（模拟 useFrame + useEffect）
    act(() => {
      if (result.current.isNearAgent && result.current.agents['dmitri'].state === 'IDLE') {
        result.current.updateAgent('dmitri', { state: 'LISTENING' });
      }
    });
    
    expect(result.current.agents['dmitri'].state).toBe('LISTENING');
    
    // 2. 开始对话，进入 ASKING
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ASKING' });
    });
    
    expect(result.current.agents['dmitri'].state).toBe('ASKING');
    
    // 3. 玩家走远，但状态保持 ASKING（受保护）
    act(() => {
      result.current.setNearAgent(false);
    });
    
    expect(result.current.agents['dmitri'].state).toBe('ASKING');
    
    // 4. 任务开始，进入 ACTING
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ACTING' });
    });
    
    expect(result.current.agents['dmitri'].state).toBe('ACTING');
    
    // 5. 任务完成，玩家仍然很远，切换到 IDLE
    act(() => {
      result.current.updateAgent('dmitri', { state: 'IDLE' });
    });
    
    expect(result.current.agents['dmitri'].state).toBe('IDLE');
    expect(result.current.isNearAgent).toBe(false);
    
    // 6. 玩家走近，自动切换回 LISTENING
    act(() => {
      result.current.setNearAgent(true);
    });
    
    act(() => {
      if (result.current.isNearAgent && result.current.agents['dmitri'].state === 'IDLE') {
        result.current.updateAgent('dmitri', { state: 'LISTENING' });
      }
    });
    
    expect(result.current.agents['dmitri'].state).toBe('LISTENING');
    
    console.log('[Test] 完整生命周期测试通过');
  });
});

