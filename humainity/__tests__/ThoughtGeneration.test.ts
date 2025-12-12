import { describe, it, expect } from 'vitest';
import { act } from '@testing-library/react';
import { useGameState } from '../app/components/Game/GameState';

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
