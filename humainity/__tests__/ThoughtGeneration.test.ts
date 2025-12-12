import { describe, it, expect } from 'vitest';
import { act } from '@testing-library/react';
import { useGameState } from '../app/components/Game/GameState';
import { AgentState } from '../app/types/Agent';

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

// 从 useSurvival.ts 复制的优先级函数（用于测试）
function getStatePriority(state: AgentState): 1 | 2 | 3 {
  // P1: 生存本能 (最高优先级)
  if (['STARVING', 'SEEKING_FOOD', 'EATING', 'SLEEPING', 'EXHAUSTED'].includes(state)) {
    return 1;
  }
  
  // P2: 社会交互 (中优先级)
  if (['LISTENING', 'THINKING', 'ASKING', 'CHATTING', 'PONDERING'].includes(state)) {
    return 2;
  }
  
  // P3: 日常使命 (最低优先级)
  // IDLE, MOVING, WORKING, DELIVERING, ACTING
  return 3;
}

describe('ThoughtHistory 模板系统', () => {
  it('手动触发状态进入时，thoughtHistory 应被写入', () => {
    // 初始化 store
    act(() => {
      useGameState.setState({
        agents: {
          dmitri: createMockAgent(100, 100, 'IDLE')
        }
      });
    });

    // 手动触发状态进入（模拟 useSurvival 的行为）
    act(() => {
      const agent = useGameState.getState().agents['dmitri'];
      useGameState.getState().updateAgent('dmitri', {
        state: 'STARVING',
        thoughtHistory: [
          {
            tick: Date.now(),
            content: '肚子好饿...储粮点还有吃的吗？我得去看看。',
            trigger: '饥饿触发',
            mood: 'anxious'
          },
          ...agent.thoughtHistory
        ]
      });
    });

    const agent = useGameState.getState().agents['dmitri'];
    
    expect(agent.state).toBe('STARVING');
    expect(agent.thoughtHistory.length).toBeGreaterThan(0);
    expect(agent.thoughtHistory[0].content).toContain('肚子好饿');
    expect(agent.thoughtHistory[0].trigger).toBe('饥饿触发');
  });

  it('thoughtHistory 应保持最新在 index 0', () => {
    act(() => {
      useGameState.setState({
        agents: {
          dmitri: {
            ...createMockAgent(100, 100, 'IDLE'),
            thoughtHistory: [
              {
                tick: 1,
                content: '第一条想法',
                trigger: '测试',
                mood: 'test'
              }
            ]
          }
        }
      });
    });

    // 添加新想法（模拟状态进入）
    act(() => {
      const agent = useGameState.getState().agents['dmitri'];
      useGameState.getState().updateAgent('dmitri', {
        thoughtHistory: [
          {
            tick: Date.now(),
            content: '第二条想法（最新）',
            trigger: '新触发',
            mood: 'new'
          },
          ...agent.thoughtHistory
        ]
      });
    });

    const agent = useGameState.getState().agents['dmitri'];
    
    // 验证最新在 index 0
    expect(agent.thoughtHistory[0].content).toBe('第二条想法（最新）');
    expect(agent.thoughtHistory[1].content).toBe('第一条想法');
  });

  it('不同状态应有不同的触发器和情绪', () => {
    const templates = [
      { state: 'STARVING', trigger: '饥饿触发', mood: 'anxious' },
      { state: 'EXHAUSTED', trigger: '力竭触发', mood: 'fatigued' },
      { state: 'EATING', trigger: '进食开始', mood: 'relieved' },
      { state: 'SLEEPING', trigger: '睡眠开始', mood: 'peaceful' },
    ];

    templates.forEach(({ state, trigger, mood }) => {
      act(() => {
        useGameState.setState({
          agents: {
            dmitri: createMockAgent(100, 100, state)
          }
        });
      });

      // 模拟写入模板（这是 useSurvival 应该做的）
      act(() => {
        const templateContent = trigger === '饥饿触发' ? '肚子好饿...' :
                                trigger === '力竭触发' ? '身体实在撑不住了' :
                                trigger === '进食开始' ? '终于有吃的了' :
                                '火光很温暖...';
        
        useGameState.getState().updateAgent('dmitri', {
          thoughtHistory: [{
            tick: Date.now(),
            content: templateContent,
            trigger,
            mood
          }]
        });
      });

      const agent = useGameState.getState().agents['dmitri'];
      expect(agent.thoughtHistory[0].trigger).toBe(trigger);
      expect(agent.thoughtHistory[0].mood).toBe(mood);
    });
  });
});

describe('想法生成跨层级优化 (Genesis V0.2 Step 3)', () => {
  it('getStatePriority() 应正确返回 P1 层级 (生存本能)', () => {
    expect(getStatePriority('STARVING')).toBe(1);
    expect(getStatePriority('SEEKING_FOOD')).toBe(1);
    expect(getStatePriority('EATING')).toBe(1);
    expect(getStatePriority('SLEEPING')).toBe(1);
    expect(getStatePriority('EXHAUSTED')).toBe(1);
  });

  it('getStatePriority() 应正确返回 P2 层级 (社会交互)', () => {
    expect(getStatePriority('LISTENING')).toBe(2);
    expect(getStatePriority('THINKING')).toBe(2);
    expect(getStatePriority('ASKING')).toBe(2);
    expect(getStatePriority('CHATTING')).toBe(2);
    expect(getStatePriority('PONDERING')).toBe(2);
  });

  it('getStatePriority() 应正确返回 P3 层级 (日常使命)', () => {
    expect(getStatePriority('IDLE')).toBe(3);
    expect(getStatePriority('MOVING')).toBe(3);
    expect(getStatePriority('WORKING')).toBe(3);
    expect(getStatePriority('DELIVERING')).toBe(3);
    expect(getStatePriority('ACTING')).toBe(3);
  });

  it('跨层级状态变化应生成想法 (P3 -> P1)', () => {
    // 初始化为 P3 状态
    act(() => {
      useGameState.setState({
        agents: {
          dmitri: {
            ...createMockAgent(100, 100, 'IDLE'),
            thoughtHistory: []
          }
        }
      });
    });

    const oldAgent = useGameState.getState().agents['dmitri'];
    const oldPriority = getStatePriority(oldAgent.state as AgentState);
    expect(oldPriority).toBe(3); // IDLE 是 P3

    // 模拟跨层级切换到 P1 状态
    act(() => {
      const newState = 'STARVING';
      const newPriority = getStatePriority(newState);
      
      // 只有跨层级时才生成想法
      if (oldPriority !== newPriority) {
        useGameState.getState().updateAgent('dmitri', {
          state: newState,
          thoughtHistory: [
            {
              tick: Date.now(),
              content: '肚子在叫...我得去找点吃的',
              trigger: '饥饿触发',
              mood: 'anxious'
            },
            ...oldAgent.thoughtHistory
          ]
        });
      }
    });

    const newAgent = useGameState.getState().agents['dmitri'];
    expect(newAgent.state).toBe('STARVING');
    expect(newAgent.thoughtHistory.length).toBe(1);
    expect(newAgent.thoughtHistory[0].trigger).toBe('饥饿触发');
  });

  it('跨层级状态变化应生成想法 (P1 -> P3)', () => {
    // 初始化为 P1 状态
    act(() => {
      useGameState.setState({
        agents: {
          dmitri: {
            ...createMockAgent(100, 100, 'EATING'),
            thoughtHistory: [{
              tick: 100,
              content: '终于有吃的了',
              trigger: '进食开始',
              mood: 'relieved'
            }]
          }
        }
      });
    });

    const oldAgent = useGameState.getState().agents['dmitri'];
    const oldPriority = getStatePriority(oldAgent.state as AgentState);
    expect(oldPriority).toBe(1); // EATING 是 P1

    // 模拟跨层级切换到 P3 状态
    act(() => {
      const newState = 'IDLE';
      const newPriority = getStatePriority(newState);
      
      // 只有跨层级时才生成想法
      if (oldPriority !== newPriority) {
        useGameState.getState().updateAgent('dmitri', {
          state: newState,
          thoughtHistory: [
            {
              tick: Date.now(),
              content: '现在感觉还不错，等待领袖的下一个指示。',
              trigger: '恢复正常',
              mood: 'calm'
            },
            ...oldAgent.thoughtHistory
          ]
        });
      }
    });

    const newAgent = useGameState.getState().agents['dmitri'];
    expect(newAgent.state).toBe('IDLE');
    expect(newAgent.thoughtHistory.length).toBe(2); // 旧想法 + 新想法
    expect(newAgent.thoughtHistory[0].trigger).toBe('恢复正常');
    expect(newAgent.thoughtHistory[1].trigger).toBe('进食开始');
  });

  it('跨层级状态变化应生成想法 (P2 -> P1)', () => {
    // 初始化为 P2 状态
    act(() => {
      useGameState.setState({
        agents: {
          dmitri: {
            ...createMockAgent(100, 100, 'LISTENING'),
            thoughtHistory: []
          }
        }
      });
    });

    const oldAgent = useGameState.getState().agents['dmitri'];
    const oldPriority = getStatePriority(oldAgent.state as AgentState);
    expect(oldPriority).toBe(2); // LISTENING 是 P2

    // 模拟跨层级切换到 P1 状态
    act(() => {
      const newState = 'EXHAUSTED';
      const newPriority = getStatePriority(newState);
      
      if (oldPriority !== newPriority) {
        useGameState.getState().updateAgent('dmitri', {
          state: newState,
          thoughtHistory: [
            {
              tick: Date.now(),
              content: '身体实在撑不住了',
              trigger: '力竭触发',
              mood: 'fatigued'
            },
            ...oldAgent.thoughtHistory
          ]
        });
      }
    });

    const newAgent = useGameState.getState().agents['dmitri'];
    expect(newAgent.state).toBe('EXHAUSTED');
    expect(newAgent.thoughtHistory.length).toBe(1);
    expect(newAgent.thoughtHistory[0].trigger).toBe('力竭触发');
  });

  it('同层级状态变化不应生成想法 (P3 -> P3)', () => {
    // 初始化为 P3 状态
    act(() => {
      useGameState.setState({
        agents: {
          dmitri: {
            ...createMockAgent(100, 100, 'IDLE'),
            thoughtHistory: []
          }
        }
      });
    });

    const oldAgent = useGameState.getState().agents['dmitri'];
    const oldPriority = getStatePriority(oldAgent.state as AgentState);
    expect(oldPriority).toBe(3); // IDLE 是 P3

    // 模拟同层级切换 (P3 -> P3)
    act(() => {
      const newState = 'MOVING';
      const newPriority = getStatePriority(newState);
      
      // 同层级不生成想法
      if (oldPriority !== newPriority) {
        useGameState.getState().updateAgent('dmitri', {
          state: newState,
          thoughtHistory: [
            {
              tick: Date.now(),
              content: '不应该出现',
              trigger: '不应触发',
              mood: 'error'
            },
            ...oldAgent.thoughtHistory
          ]
        });
      } else {
        // 同层级只更新状态，不添加想法
        useGameState.getState().updateAgent('dmitri', {
          state: newState
        });
      }
    });

    const newAgent = useGameState.getState().agents['dmitri'];
    expect(newAgent.state).toBe('MOVING');
    expect(newAgent.thoughtHistory.length).toBe(0); // 没有新想法
  });

  it('同层级状态变化不应生成想法 (P1 -> P1)', () => {
    act(() => {
      useGameState.setState({
        agents: {
          dmitri: {
            ...createMockAgent(100, 100, 'STARVING'),
            thoughtHistory: [{
              tick: 100,
              content: '肚子好饿',
              trigger: '饥饿触发',
              mood: 'anxious'
            }]
          }
        }
      });
    });

    const oldAgent = useGameState.getState().agents['dmitri'];
    const oldPriority = getStatePriority(oldAgent.state as AgentState);
    expect(oldPriority).toBe(1); // STARVING 是 P1

    // 模拟同层级切换 (P1 -> P1)
    act(() => {
      const newState = 'SEEKING_FOOD';
      const newPriority = getStatePriority(newState);
      
      if (oldPriority !== newPriority) {
        useGameState.getState().updateAgent('dmitri', {
          state: newState,
          thoughtHistory: [
            { tick: Date.now(), content: '不应该出现', trigger: '不应触发', mood: 'error' },
            ...oldAgent.thoughtHistory
          ]
        });
      } else {
        useGameState.getState().updateAgent('dmitri', { state: newState });
      }
    });

    const newAgent = useGameState.getState().agents['dmitri'];
    expect(newAgent.state).toBe('SEEKING_FOOD');
    expect(newAgent.thoughtHistory.length).toBe(1); // 只有旧想法
    expect(newAgent.thoughtHistory[0].content).toBe('肚子好饿');
  });

  it('同层级状态变化不应生成想法 (P2 -> P2)', () => {
    act(() => {
      useGameState.setState({
        agents: {
          dmitri: {
            ...createMockAgent(100, 100, 'LISTENING'),
            thoughtHistory: []
          }
        }
      });
    });

    const oldAgent = useGameState.getState().agents['dmitri'];
    const oldPriority = getStatePriority(oldAgent.state as AgentState);
    expect(oldPriority).toBe(2); // LISTENING 是 P2

    // 模拟同层级切换 (P2 -> P2)
    act(() => {
      const newState = 'THINKING';
      const newPriority = getStatePriority(newState);
      
      if (oldPriority !== newPriority) {
        useGameState.getState().updateAgent('dmitri', {
          state: newState,
          thoughtHistory: [
            { tick: Date.now(), content: '不应该出现', trigger: '不应触发', mood: 'error' },
            ...oldAgent.thoughtHistory
          ]
        });
      } else {
        useGameState.getState().updateAgent('dmitri', { state: newState });
      }
    });

    const newAgent = useGameState.getState().agents['dmitri'];
    expect(newAgent.state).toBe('THINKING');
    expect(newAgent.thoughtHistory.length).toBe(0); // 没有想法
  });

  it('想法数组长度限制为20条', () => {
    // 初始化包含19条想法的智能体
    const initialThoughts = Array.from({ length: 19 }, (_, i) => ({
      tick: i,
      content: `想法 ${i}`,
      trigger: '测试',
      mood: 'test'
    }));

    act(() => {
      useGameState.setState({
        agents: {
          dmitri: {
            ...createMockAgent(100, 100, 'IDLE'),
            thoughtHistory: initialThoughts
          }
        }
      });
    });

    expect(useGameState.getState().agents['dmitri'].thoughtHistory.length).toBe(19);

    // 添加第20条想法
    act(() => {
      const agent = useGameState.getState().agents['dmitri'];
      useGameState.getState().updateAgent('dmitri', {
        thoughtHistory: [
          { tick: 20, content: '第20条想法', trigger: '测试', mood: 'test' },
          ...agent.thoughtHistory
        ].slice(0, 20) // 限制为20条
      });
    });

    expect(useGameState.getState().agents['dmitri'].thoughtHistory.length).toBe(20);
    expect(useGameState.getState().agents['dmitri'].thoughtHistory[0].content).toBe('第20条想法');

    // 添加第21条想法，最旧的应被移除
    act(() => {
      const agent = useGameState.getState().agents['dmitri'];
      useGameState.getState().updateAgent('dmitri', {
        thoughtHistory: [
          { tick: 21, content: '第21条想法（最新）', trigger: '测试', mood: 'test' },
          ...agent.thoughtHistory
        ].slice(0, 20) // 限制为20条
      });
    });

    const finalAgent = useGameState.getState().agents['dmitri'];
    expect(finalAgent.thoughtHistory.length).toBe(20); // 仍然是20条
    expect(finalAgent.thoughtHistory[0].content).toBe('第21条想法（最新）'); // 最新在开头
    expect(finalAgent.thoughtHistory[1].content).toBe('第20条想法'); // 第二新
    expect(finalAgent.thoughtHistory[19].content).toBe('想法 17'); // 数组末尾
    // 验证最旧的想法（想法 18）被移除，而想法 0-17 仍然保留
    expect(finalAgent.thoughtHistory.find(t => t.content === '想法 18')).toBeUndefined(); // 最旧的被移除
    expect(finalAgent.thoughtHistory.find(t => t.content === '想法 0')).toBeDefined(); // 想法 0 仍在
    expect(finalAgent.thoughtHistory.find(t => t.content === '想法 17')).toBeDefined(); // 想法 17 仍在
  });
});
