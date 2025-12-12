import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import GameUI from '../app/components/Game/GameUI';
import { useGameState } from '../app/components/Game/GameState';

// Mock SoulInspector to avoid R3F dependencies
vi.mock('../app/components/Inspector/SoulInspector', () => ({
  default: () => null,
}));

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
        }
      },
      selectedAgentId: null,
    })
  );

describe('HUD 资源显示测试', () => {
  beforeEach(() => {
    resetStore();
  });

  it('应显示 berry 和 meat 的 tooltip', () => {
    const { container } = render(<GameUI leaderName="测试领袖" />);

    // 查找所有带 title 的 div
    const divsWithTitle = Array.from(container.querySelectorAll('[title]'));
    
    const berryDiv = divsWithTitle.find(el => el.getAttribute('title') === '基础食物 +10 饱食度');
    const meatDiv = divsWithTitle.find(el => el.getAttribute('title') === '高级食物 +30 饱食度');

    expect(berryDiv).toBeDefined();
    expect(meatDiv).toBeDefined();
    expect(berryDiv?.textContent).toContain('🫐 浆果');
    expect(meatDiv?.textContent).toContain('🥩 生肉');
  });

  it('当资源为 0 时应显示红色警示', () => {
    const { container } = render(<GameUI leaderName="测试领袖" />);

    // 所有资源都是 0，应该都有红色警示
    const redSpans = container.querySelectorAll('.text-red-600');
    expect(redSpans.length).toBeGreaterThanOrEqual(3); // wood, berry, meat
  });

  it('当资源不为 0 时不应显示红色', () => {
    act(() => {
      useGameState.setState({
        inventory: { wood: 10, berry: 20, meat: 5 }
      });
    });

    const { container } = render(<GameUI leaderName="测试领袖" />);

    // 不应该有红色警示（因为资源不为 0）
    const redSpans = container.querySelectorAll('.text-red-600');
    expect(redSpans.length).toBe(0);
  });

  it('混合情况：部分为 0 部分不为 0', () => {
    act(() => {
      useGameState.setState({
        inventory: { wood: 5, berry: 0, meat: 3 }
      });
    });

    const { container } = render(<GameUI leaderName="测试领袖" />);

    // 应该只有 1 个红色警示（berry 为 0）
    const redSpans = container.querySelectorAll('.text-red-600');
    expect(redSpans.length).toBe(1);
    
    // 验证数值正确显示
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
