import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SoulInspector from '../app/components/Inspector/SoulInspector';
import { useGameState } from '../app/components/Game/GameState';

const createMockAgent = () => ({
  id: 'dmitri',
  name: 'Dmitri',
  primaryRole: 'worker' as const,
  currentAssignment: 'Lumberjack',
  stats: { satiety: 75, energy: 60, health: 90 },
  capTraits: ['Strong', 'Enduring'],
  psychTraits: ['Loyal', 'Pessimistic'],
  state: 'IDLE' as const,
  thoughtHistory: [
    {
      tick: 100,
      content: '今天的工作还算顺利。',
      trigger: '工作完成',
      mood: 'satisfied'
    },
    {
      tick: 50,
      content: '领袖让我砍树，我会尽力完成。',
      trigger: '接受任务',
      mood: 'dutiful'
    }
  ],
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
      agents: { dmitri: createMockAgent() },
      selectedAgentId: null,
    })
  );

describe('SoulInspector 灵魂透视镜', () => {
  beforeEach(() => {
    resetStore();
  });

  it('未选中时不渲染', () => {
    const { container } = render(<SoulInspector />);
    expect(container.firstChild).toBeNull();
  });

  it('选中时渲染面板', () => {
    act(() => {
      useGameState.setState({ selectedAgentId: 'dmitri' });
    });

    render(<SoulInspector />);

    expect(screen.getByText('Dmitri')).toBeInTheDocument();
    expect(screen.getByText('肉体 (The Vessel)')).toBeInTheDocument();
    expect(screen.getByText('灵魂 (The Soul)')).toBeInTheDocument();
  });

  it('显示生存数值进度条', () => {
    act(() => {
      useGameState.setState({ selectedAgentId: 'dmitri' });
    });

    render(<SoulInspector />);

    expect(screen.getByText(/饱食度/)).toBeInTheDocument();
    expect(screen.getByText(/精力值/)).toBeInTheDocument();
    expect(screen.getByText(/健康度/)).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument(); // satiety
    expect(screen.getByText('60%')).toBeInTheDocument(); // energy
    expect(screen.getByText('90%')).toBeInTheDocument(); // health
  });

  it('显示职责和角色', () => {
    act(() => {
      useGameState.setState({ selectedAgentId: 'dmitri' });
    });

    render(<SoulInspector />);

    expect(screen.getByText('Lumberjack')).toBeInTheDocument();
    expect(screen.getByText('worker')).toBeInTheDocument();
  });

  it('显示特质标签', () => {
    act(() => {
      useGameState.setState({ selectedAgentId: 'dmitri' });
    });

    render(<SoulInspector />);

    // 心理特质
    expect(screen.getByText('Loyal')).toBeInTheDocument();
    expect(screen.getByText('Pessimistic')).toBeInTheDocument();

    // 能力特质
    expect(screen.getByText('Strong')).toBeInTheDocument();
    expect(screen.getByText('Enduring')).toBeInTheDocument();
  });

  it('显示当前想法', () => {
    act(() => {
      useGameState.setState({ selectedAgentId: 'dmitri' });
    });

    render(<SoulInspector />);

    expect(screen.getByText('今天的工作还算顺利。')).toBeInTheDocument();
  });

  it('显示历史想法', () => {
    act(() => {
      useGameState.setState({ selectedAgentId: 'dmitri' });
    });

    render(<SoulInspector />);

    expect(screen.getByText('领袖让我砍树，我会尽力完成。')).toBeInTheDocument();
    expect(screen.getByText('接受任务')).toBeInTheDocument();
  });

  it('关闭按钮应调用 deselectAgent', async () => {
    const user = userEvent.setup();

    act(() => {
      useGameState.setState({ selectedAgentId: 'dmitri' });
    });

    render(<SoulInspector />);

    expect(useGameState.getState().selectedAgentId).toBe('dmitri');

    const closeButton = screen.getByTitle('关闭');
    await user.click(closeButton);

    expect(useGameState.getState().selectedAgentId).toBeNull();
  });

  it('点击遮罩层应取消选中', async () => {
    const user = userEvent.setup();

    act(() => {
      useGameState.setState({ selectedAgentId: 'dmitri' });
    });

    const { container } = render(<SoulInspector />);

    expect(useGameState.getState().selectedAgentId).toBe('dmitri');

    // 找到遮罩层（第一个 div）
    const overlay = container.querySelector('.bg-black\\/30');
    expect(overlay).toBeInTheDocument();

    if (overlay) {
      await user.click(overlay as HTMLElement);
      expect(useGameState.getState().selectedAgentId).toBeNull();
    }
  });

  it('thoughtHistory 为空时显示占位符', () => {
    act(() => {
      useGameState.setState({
        selectedAgentId: 'dmitri',
        agents: {
          dmitri: {
            ...createMockAgent(),
            thoughtHistory: [],
          }
        }
      });
    });

    render(<SoulInspector />);

    expect(screen.getByText('（此刻内心平静...）')).toBeInTheDocument();
    expect(screen.getByText('（还没有历史记录）')).toBeInTheDocument();
  });
});
