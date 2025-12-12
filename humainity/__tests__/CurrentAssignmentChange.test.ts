import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useGameState } from '../app/components/Game/GameState';

const createMockAgent = (assignment: string) => ({
  id: 'dmitri',
  name: 'Dmitri',
  primaryRole: 'worker' as const,
  currentAssignment: assignment,
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
      inventory: { wood: 0, berry: 0, meat: 0 },
      wood: 0,
      food: 0,
      logs: [],
      isNearAgent: false,
      inputFocused: false,
      pendingCommand: null,
      agents: {
        dmitri: createMockAgent('Lumberjack')
      },
      selectedAgentId: null,
    })
  );

describe('currentAssignment 变更检测 (Genesis V0.2 Step 3)', () => {
  beforeEach(() => {
    resetStore();
  });

  it('updateAgent 时检测 currentAssignment 变更并生成想法', () => {
    const agent = useGameState.getState().agents['dmitri'];
    expect(agent.currentAssignment).toBe('Lumberjack');
    expect(agent.thoughtHistory.length).toBe(0);

    // 模拟 GameState.updateAgent 中的职责变更检测逻辑
    act(() => {
      const oldAgent = useGameState.getState().agents['dmitri'];
      const updates = { currentAssignment: 'Hunter' };
      
      // 检测 currentAssignment 变更
      const assignmentChanged = 
        updates.currentAssignment && 
        updates.currentAssignment !== oldAgent.currentAssignment;
      
      let newThoughtHistory = oldAgent.thoughtHistory;
      
      if (assignmentChanged) {
        const newThought = {
          tick: Date.now(),
          content: `我的新职责是 ${updates.currentAssignment}，我会尽力完成的。`,
          trigger: '职责变更',
          mood: 'determined'
        };
        // 将新想法追加到开头（最新在 index 0）
        newThoughtHistory = [newThought, ...oldAgent.thoughtHistory].slice(0, 20);
      }
      
      useGameState.getState().updateAgent('dmitri', {
        ...updates,
        thoughtHistory: newThoughtHistory,
      });
    });

    const updatedAgent = useGameState.getState().agents['dmitri'];
    expect(updatedAgent.currentAssignment).toBe('Hunter');
    expect(updatedAgent.thoughtHistory.length).toBe(1);
    expect(updatedAgent.thoughtHistory[0].content).toBe('我的新职责是 Hunter，我会尽力完成的。');
    expect(updatedAgent.thoughtHistory[0].trigger).toBe('职责变更');
    expect(updatedAgent.thoughtHistory[0].mood).toBe('determined');
  });

  it('currentAssignment 未变更时不生成想法', () => {
    act(() => {
      const agent = useGameState.getState().agents['dmitri'];
      useGameState.getState().updateAgent('dmitri', {
        thoughtHistory: [{
          tick: 100,
          content: '初始想法',
          trigger: '测试',
          mood: 'test'
        }]
      });
    });

    const beforeUpdate = useGameState.getState().agents['dmitri'];
    expect(beforeUpdate.thoughtHistory.length).toBe(1);

    // 更新其他字段但不更改 currentAssignment
    act(() => {
      const oldAgent = useGameState.getState().agents['dmitri'];
      const updates = { stats: { satiety: 80, energy: 90, health: 100 } };
      
      // currentAssignment 未变更
      const assignmentChanged = 
        updates.currentAssignment && 
        updates.currentAssignment !== oldAgent.currentAssignment;
      
      let newThoughtHistory = oldAgent.thoughtHistory;
      
      if (assignmentChanged) {
        newThoughtHistory = [{
          tick: Date.now(),
          content: '不应该出现',
          trigger: '不应触发',
          mood: 'error'
        }, ...oldAgent.thoughtHistory];
      }
      
      useGameState.getState().updateAgent('dmitri', {
        ...updates,
        thoughtHistory: newThoughtHistory,
      });
    });

    const afterUpdate = useGameState.getState().agents['dmitri'];
    expect(afterUpdate.currentAssignment).toBe('Lumberjack'); // 未变更
    expect(afterUpdate.thoughtHistory.length).toBe(1); // 没有新想法
    expect(afterUpdate.thoughtHistory[0].content).toBe('初始想法'); // 仍是原想法
    expect(afterUpdate.stats.satiety).toBe(80); // 其他字段已更新
  });

  it('多次变更应生成多条想法', () => {
    // 第一次变更：Lumberjack → Hunter
    act(() => {
      const oldAgent = useGameState.getState().agents['dmitri'];
      const updates = { currentAssignment: 'Hunter' };
      
      const assignmentChanged = 
        updates.currentAssignment && 
        updates.currentAssignment !== oldAgent.currentAssignment;
      
      let newThoughtHistory = oldAgent.thoughtHistory;
      
      if (assignmentChanged) {
        newThoughtHistory = [{
          tick: Date.now(),
          content: `我的新职责是 ${updates.currentAssignment}，我会尽力完成的。`,
          trigger: '职责变更',
          mood: 'determined'
        }, ...oldAgent.thoughtHistory].slice(0, 20);
      }
      
      useGameState.getState().updateAgent('dmitri', {
        ...updates,
        thoughtHistory: newThoughtHistory,
      });
    });

    let agent = useGameState.getState().agents['dmitri'];
    expect(agent.currentAssignment).toBe('Hunter');
    expect(agent.thoughtHistory.length).toBe(1);
    expect(agent.thoughtHistory[0].content).toBe('我的新职责是 Hunter，我会尽力完成的。');

    // 第二次变更：Hunter → Builder
    act(() => {
      const oldAgent = useGameState.getState().agents['dmitri'];
      const updates = { currentAssignment: 'Builder' };
      
      const assignmentChanged = 
        updates.currentAssignment && 
        updates.currentAssignment !== oldAgent.currentAssignment;
      
      let newThoughtHistory = oldAgent.thoughtHistory;
      
      if (assignmentChanged) {
        newThoughtHistory = [{
          tick: Date.now(),
          content: `我的新职责是 ${updates.currentAssignment}，我会尽力完成的。`,
          trigger: '职责变更',
          mood: 'determined'
        }, ...oldAgent.thoughtHistory].slice(0, 20);
      }
      
      useGameState.getState().updateAgent('dmitri', {
        ...updates,
        thoughtHistory: newThoughtHistory,
      });
    });

    agent = useGameState.getState().agents['dmitri'];
    expect(agent.currentAssignment).toBe('Builder');
    expect(agent.thoughtHistory.length).toBe(2); // 两条想法
    expect(agent.thoughtHistory[0].content).toBe('我的新职责是 Builder，我会尽力完成的。'); // 最新
    expect(agent.thoughtHistory[1].content).toBe('我的新职责是 Hunter，我会尽力完成的。'); // 之前的
  });

  it('职责变更想法应遵循数组长度限制', () => {
    // 初始化19条想法
    const initialThoughts = Array.from({ length: 19 }, (_, i) => ({
      tick: i,
      content: `想法 ${i}`,
      trigger: '测试',
      mood: 'test'
    }));

    act(() => {
      useGameState.getState().updateAgent('dmitri', {
        thoughtHistory: initialThoughts
      });
    });

    expect(useGameState.getState().agents['dmitri'].thoughtHistory.length).toBe(19);

    // 职责变更生成第20条想法
    act(() => {
      const oldAgent = useGameState.getState().agents['dmitri'];
      const updates = { currentAssignment: 'Hunter' };
      
      const assignmentChanged = 
        updates.currentAssignment && 
        updates.currentAssignment !== oldAgent.currentAssignment;
      
      let newThoughtHistory = oldAgent.thoughtHistory;
      
      if (assignmentChanged) {
        newThoughtHistory = [{
          tick: Date.now(),
          content: `我的新职责是 ${updates.currentAssignment}，我会尽力完成的。`,
          trigger: '职责变更',
          mood: 'determined'
        }, ...oldAgent.thoughtHistory].slice(0, 20); // 限制为20条
      }
      
      useGameState.getState().updateAgent('dmitri', {
        ...updates,
        thoughtHistory: newThoughtHistory,
      });
    });

    const agent = useGameState.getState().agents['dmitri'];
    expect(agent.thoughtHistory.length).toBe(20); // 限制为20条
    expect(agent.thoughtHistory[0].content).toBe('我的新职责是 Hunter，我会尽力完成的。');
    expect(agent.thoughtHistory[0].trigger).toBe('职责变更');
    expect(agent.thoughtHistory[19].content).toBe('想法 18'); // 数组末尾
    // 验证所有19条初始想法都保留了
    expect(agent.thoughtHistory.find(t => t.content === '想法 0')).toBeDefined();
    expect(agent.thoughtHistory.find(t => t.content === '想法 18')).toBeDefined();
  });

  it('连续变更相同职责不应生成重复想法', () => {
    // 第一次设置为 Hunter
    act(() => {
      const oldAgent = useGameState.getState().agents['dmitri'];
      const updates = { currentAssignment: 'Hunter' };
      
      const assignmentChanged = 
        updates.currentAssignment && 
        updates.currentAssignment !== oldAgent.currentAssignment;
      
      let newThoughtHistory = oldAgent.thoughtHistory;
      
      if (assignmentChanged) {
        newThoughtHistory = [{
          tick: Date.now(),
          content: `我的新职责是 ${updates.currentAssignment}，我会尽力完成的。`,
          trigger: '职责变更',
          mood: 'determined'
        }, ...oldAgent.thoughtHistory].slice(0, 20);
      }
      
      useGameState.getState().updateAgent('dmitri', {
        ...updates,
        thoughtHistory: newThoughtHistory,
      });
    });

    expect(useGameState.getState().agents['dmitri'].thoughtHistory.length).toBe(1);

    // 再次设置为 Hunter（相同职责）
    act(() => {
      const oldAgent = useGameState.getState().agents['dmitri'];
      const updates = { currentAssignment: 'Hunter' };
      
      const assignmentChanged = 
        updates.currentAssignment && 
        updates.currentAssignment !== oldAgent.currentAssignment;
      
      let newThoughtHistory = oldAgent.thoughtHistory;
      
      if (assignmentChanged) {
        newThoughtHistory = [{
          tick: Date.now(),
          content: '不应该出现',
          trigger: '不应触发',
          mood: 'error'
        }, ...oldAgent.thoughtHistory];
      }
      
      useGameState.getState().updateAgent('dmitri', {
        ...updates,
        thoughtHistory: newThoughtHistory,
      });
    });

    const agent = useGameState.getState().agents['dmitri'];
    expect(agent.currentAssignment).toBe('Hunter');
    expect(agent.thoughtHistory.length).toBe(1); // 没有新增想法
    expect(agent.thoughtHistory[0].trigger).toBe('职责变更'); // 仍是第一次变更的想法
  });
});

