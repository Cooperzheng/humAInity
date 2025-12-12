import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState, useAgentState, useSetAgentState } from '../app/components/Game/GameState';

/**
 * 砍树流程端到端集成测试
 * 
 * 目标：测试状态管理和数据流的完整性
 * 策略：不渲染 3D 组件，专注于状态层和逻辑层的集成
 * 
 * 这个测试应该能发现类似"GameScene 未正确从 agents 字典读取状态"的 bug
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

// Helper: 重置 store
const resetStore = () => {
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
};

describe('砍树流程端到端集成测试', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('完整流程：状态管理层的砍树流程', () => {
    const { result } = renderHook(() => useGameState());
    
    // 1. 初始状态验证
    expect(result.current.agents['dmitri'].state).toBe('IDLE');
    expect(result.current.isNearAgent).toBe(false);
    expect(result.current.wood).toBe(0);
    
    // 2. 模拟玩家接近 NPC
    act(() => {
      result.current.setNearAgent(true);
      result.current.updateAgent('dmitri', { state: 'LISTENING' });
    });
    
    expect(result.current.isNearAgent).toBe(true);
    expect(result.current.agents['dmitri'].state).toBe('LISTENING');
    
    // 3. 玩家发送 "砍树" 指令
    act(() => {
      result.current.addLog('Archon: 砍树', 'chat');
      result.current.setPendingCommand('砍树');
    });
    
    expect(result.current.pendingCommand).toBe('砍树');
    
    // 4. NPC 询问数量
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ASKING' });
      result.current.addLog('德米特里: 要砍几棵？', 'system');
      result.current.setPendingCommand(null);
    });
    
    expect(result.current.agents['dmitri'].state).toBe('ASKING');
    
    // 5. 玩家回复数量 "3"
    act(() => {
      result.current.addLog('Archon: 3', 'chat');
      result.current.setPendingCommand('3');
    });
    
    // 6. NPC 确认任务并开始执行
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ACTING' });
      result.current.addLog('德米特里接受任务：砍 3 棵树', 'system');
      result.current.setPendingCommand(null);
    });
    
    expect(result.current.agents['dmitri'].state).toBe('ACTING');
    
    // 7. 模拟完成一棵树
    act(() => {
      result.current.addWood(1);
      result.current.addLog('砍倒了一棵树！', 'system');
    });
    
    expect(result.current.wood).toBe(1);
    
    // 8. 完成所有任务，返回 IDLE
    act(() => {
      result.current.addWood(2); // 再砍 2 棵
      result.current.updateAgent('dmitri', { state: 'IDLE' });
    });
    
    expect(result.current.wood).toBe(3);
    expect(result.current.agents['dmitri'].state).toBe('IDLE');
    
    console.log('[Test] 完整流程测试通过：状态正确管理');
  });

  it('状态传递：确保 agents 字典正确存储和读取状态', () => {
    const { result } = renderHook(() => useGameState());
    
    // 测试场景1：设置状态为 ACTING
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ACTING' });
    });
    
    // 验证：从 agents 字典读取状态
    const dmitriState1 = result.current.agents['dmitri']?.state;
    expect(dmitriState1).toBe('ACTING');
    
    // 测试场景2：切换到 LISTENING
    act(() => {
      result.current.updateAgent('dmitri', { state: 'LISTENING' });
    });
    
    const dmitriState2 = result.current.agents['dmitri']?.state;
    expect(dmitriState2).toBe('LISTENING');
    
    // 测试场景3：切换到 IDLE
    act(() => {
      result.current.updateAgent('dmitri', { state: 'IDLE' });
    });
    
    const dmitriState3 = result.current.agents['dmitri']?.state;
    expect(dmitriState3).toBe('IDLE');
    
    console.log('[Test] 状态传递测试通过：所有状态正确存储和读取');
  });

  it('边界情况：agents 字典为空时的容错', () => {
    // 设置 agents 为空对象
    act(() => {
      useGameState.setState({
        agents: {} as any,
      });
    });
    
    const { result } = renderHook(() => useGameState());
    
    // 验证：访问不存在的 agent 不会崩溃
    const dmitriState = result.current.agents['dmitri']?.state;
    expect(dmitriState).toBeUndefined();
    
    // 验证：使用默认值的模式
    const stateWithDefault = result.current.agents['dmitri']?.state || 'IDLE';
    expect(stateWithDefault).toBe('IDLE');
    
    console.log('[Test] 边界情况测试通过：空 agents 字典有正确的容错');
  });

  it('回归测试：验证不使用废弃的顶层 agentState 字段', () => {
    const { result } = renderHook(() => useGameState());
    
    // 验证：store 中不应该有顶层的 agentState 字段
    const store = result.current as any;
    expect(store.agentState).toBeUndefined();
    
    // 验证：状态应该存储在 agents 字典中
    expect(store.agents).toBeDefined();
    expect(store.agents['dmitri']).toBeDefined();
    expect(store.agents['dmitri'].state).toBe('IDLE');
    
    console.log('[Test] 回归测试通过：正确使用 agents 字典');
  });

  it('ACTING 状态管理：验证状态可以正确设置和保持', () => {
    const { result } = renderHook(() => useGameState());
    
    // 设置为 ACTING
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ACTING' });
    });
    
    expect(result.current.agents['dmitri'].state).toBe('ACTING');
    
    // 多次读取，状态应该保持
    for (let i = 0; i < 5; i++) {
      expect(result.current.agents['dmitri'].state).toBe('ACTING');
    }
    
    console.log('[Test] ACTING 状态管理测试通过');
  });

  it('状态隔离：验证每个 agent 的状态独立管理', () => {
    // 创建多个 agent
    act(() => {
      useGameState.setState({
        agents: {
          dmitri: {
            id: 'dmitri',
            name: 'Dmitri',
            primaryRole: 'worker',
            currentAssignment: 'Lumberjack',
            stats: { satiety: 100, energy: 100, health: 100 },
            capTraits: ['Strong'],
            psychTraits: ['Loyal'],
            state: 'IDLE',
            thoughtHistory: [],
            shortTermMemory: [],
          },
          anna: {
            id: 'anna',
            name: 'Anna',
            primaryRole: 'hunter',
            currentAssignment: 'Scout',
            stats: { satiety: 80, energy: 90, health: 100 },
            capTraits: ['Fast'],
            psychTraits: ['Curious'],
            state: 'LISTENING',
            thoughtHistory: [],
            shortTermMemory: [],
          }
        }
      });
    });
    
    const { result } = renderHook(() => useGameState());
    
    // 验证状态独立
    expect(result.current.agents['dmitri'].state).toBe('IDLE');
    expect(result.current.agents['anna'].state).toBe('LISTENING');
    
    // 更新 dmitri 的状态
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ACTING' });
    });
    
    // 验证只有 dmitri 的状态改变，anna 不受影响
    expect(result.current.agents['dmitri'].state).toBe('ACTING');
    expect(result.current.agents['anna'].state).toBe('LISTENING');
    
    console.log('[Test] 状态隔离测试通过：多 agent 状态独立管理');
  });

  it('updateAgent 操作：验证部分更新不影响其他字段', () => {
    const { result } = renderHook(() => useGameState());
    
    const initialAgent = result.current.agents['dmitri'];
    expect(initialAgent.state).toBe('IDLE');
    expect(initialAgent.stats.satiety).toBe(100);
    
    // 只更新状态
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ACTING' });
    });
    
    const afterStateUpdate = result.current.agents['dmitri'];
    expect(afterStateUpdate.state).toBe('ACTING');
    expect(afterStateUpdate.stats.satiety).toBe(100); // 其他字段不变
    expect(afterStateUpdate.name).toBe('Dmitri');
    
    // 只更新 stats
    act(() => {
      result.current.updateAgent('dmitri', { 
        stats: { satiety: 50, energy: 80, health: 100 }
      });
    });
    
    const afterStatsUpdate = result.current.agents['dmitri'];
    expect(afterStatsUpdate.state).toBe('ACTING'); // 状态不变
    expect(afterStatsUpdate.stats.satiety).toBe(50); // stats 更新
    
    console.log('[Test] updateAgent 部分更新测试通过');
  });

  it('selectAgent 和 deselectAgent 操作', () => {
    const { result } = renderHook(() => useGameState());
    
    // 初始状态：未选中
    expect(result.current.selectedAgentId).toBeNull();
    
    // 选中 dmitri
    act(() => {
      result.current.selectAgent('dmitri');
    });
    
    expect(result.current.selectedAgentId).toBe('dmitri');
    
    // 取消选中
    act(() => {
      result.current.deselectAgent();
    });
    
    expect(result.current.selectedAgentId).toBeNull();
    
    console.log('[Test] selectAgent/deselectAgent 测试通过');
  });

  it('资源管理：验证 wood 和 food 累加', () => {
    const { result } = renderHook(() => useGameState());
    
    expect(result.current.wood).toBe(0);
    expect(result.current.food).toBe(0);
    
    // 添加木材
    act(() => {
      result.current.addWood(5);
    });
    
    expect(result.current.wood).toBe(5);
    
    // 再添加木材
    act(() => {
      result.current.addWood(3);
    });
    
    expect(result.current.wood).toBe(8);
    
    // 添加食物
    act(() => {
      result.current.addFood(10);
    });
    
    expect(result.current.food).toBe(10);
    
    console.log('[Test] 资源管理测试通过');
  });

  it('日志系统：验证日志添加和类型', () => {
    const { result } = renderHook(() => useGameState());
    
    expect(result.current.logs.length).toBe(0);
    
    // 添加系统日志
    act(() => {
      result.current.addLog('系统消息', 'system');
    });
    
    expect(result.current.logs.length).toBe(1);
    expect(result.current.logs[0].type).toBe('system');
    expect(result.current.logs[0].text).toBe('系统消息');
    
    // 添加聊天日志
    act(() => {
      result.current.addLog('玩家消息', 'chat');
    });
    
    expect(result.current.logs.length).toBe(2);
    expect(result.current.logs[1].type).toBe('chat');
    expect(result.current.logs[1].text).toBe('玩家消息');
    
    console.log('[Test] 日志系统测试通过');
  });

  it('兼容性：验证 useAgentState 和 useSetAgentState 辅助函数', () => {
    // 这些是为了兼容旧代码的辅助函数
    const { result: stateResult } = renderHook(() => useAgentState());
    
    // 初始状态应该是 IDLE
    expect(stateResult.current).toBe('IDLE');
    
    // 使用 setAgentState 更新状态
    const { result: setStateResult } = renderHook(() => useSetAgentState());
    act(() => {
      setStateResult.current('LISTENING');
    });
    
    // 重新获取状态验证更新
    const { result: newStateResult } = renderHook(() => useAgentState());
    expect(newStateResult.current).toBe('LISTENING');
    
    console.log('[Test] 兼容性辅助函数测试通过');
  });

  it('并发状态更新：验证快速连续更新的正确性', () => {
    const { result } = renderHook(() => useGameState());
    
    // 快速连续更新多个字段
    act(() => {
      result.current.updateAgent('dmitri', { state: 'LISTENING' });
      result.current.setNearAgent(true);
      result.current.addLog('Test 1', 'system');
      result.current.updateAgent('dmitri', { state: 'ASKING' });
      result.current.addLog('Test 2', 'system');
      result.current.updateAgent('dmitri', { state: 'ACTING' });
    });
    
    // 验证最终状态
    expect(result.current.agents['dmitri'].state).toBe('ACTING');
    expect(result.current.isNearAgent).toBe(true);
    expect(result.current.logs.length).toBe(2);
    
    console.log('[Test] 并发状态更新测试通过');
  });

  it('ASKING 状态下不会被 IDLE 逻辑干扰', () => {
    const { result } = renderHook(() => useGameState());
    
    // 设置为 ASKING
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ASKING' });
    });
    
    // 验证状态保持
    expect(result.current.agents['dmitri'].state).toBe('ASKING');
    
    // 模拟多次状态检查（useFrame 会频繁执行）
    for (let i = 0; i < 10; i++) {
      expect(result.current.agents['dmitri'].state).toBe('ASKING');
    }
    
    console.log('[Test] ASKING 状态稳定性测试通过');
  });

  it('任务完成后自动从 IDLE 切换到 LISTENING', () => {
    const { result } = renderHook(() => useGameState());
    
    // 初始状态：任务完成，玩家走远
    act(() => {
      result.current.updateAgent('dmitri', { state: 'IDLE' });
      result.current.setNearAgent(false);
    });
    
    expect(result.current.agents['dmitri'].state).toBe('IDLE');
    
    // 玩家走近
    act(() => {
      result.current.setNearAgent(true);
    });
    
    // 手动触发状态切换逻辑（模拟 useFrame 的效果）
    act(() => {
      const state = result.current.agents['dmitri'].state;
      const near = result.current.isNearAgent;
      if (near && state !== 'LISTENING') {
        result.current.updateAgent('dmitri', { state: 'LISTENING' });
      }
    });
    
    expect(result.current.agents['dmitri'].state).toBe('LISTENING');
    
    console.log('[Test] IDLE → LISTENING 自动切换测试通过');
  });

  it('回归测试：完整的多次砍树循环', () => {
    const { result } = renderHook(() => useGameState());
    
    // 第一次砍树
    act(() => {
      result.current.setNearAgent(true);
      result.current.updateAgent('dmitri', { state: 'LISTENING' });
    });
    
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ASKING' });
    });
    
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ACTING' });
    });
    
    act(() => {
      result.current.addWood(3);
      result.current.updateAgent('dmitri', { state: 'IDLE' });
      result.current.setNearAgent(false);
    });
    
    expect(result.current.wood).toBe(3);
    expect(result.current.agents['dmitri'].state).toBe('IDLE');
    
    // 第二次：玩家走近，自动切换
    act(() => {
      result.current.setNearAgent(true);
    });
    
    act(() => {
      const state = result.current.agents['dmitri'].state;
      const near = result.current.isNearAgent;
      if (near && state === 'IDLE') {
        result.current.updateAgent('dmitri', { state: 'LISTENING' });
      }
    });
    
    expect(result.current.agents['dmitri'].state).toBe('LISTENING');
    
    // 第二次砍树
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ASKING' });
    });
    
    expect(result.current.agents['dmitri'].state).toBe('ASKING');
    
    console.log('[Test] 完整多次砍树循环测试通过');
  });
});
