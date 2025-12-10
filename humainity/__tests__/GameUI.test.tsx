import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameUI from '../app/components/Game/GameUI';
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

describe('GameUI', () => {
  beforeEach(() => {
    resetStore();
  });

  it('资源面板显示 wood 和 food', () => {
    act(() =>
      useGameState.setState({
        wood: 5,
        food: 3,
      })
    );
    render(<GameUI leaderName="Test" />);
    expect(screen.getByText(/🪵 木材：5/)).toBeInTheDocument();
    expect(screen.getByText(/🍎 食物：3/)).toBeInTheDocument();
  });

  it('资源面板使用古典石材样式', () => {
    render(<GameUI leaderName="Test" />);
    const resourcePanel = screen.getByText('资源').parentElement;
    expect(resourcePanel).toHaveClass('bg-stone-300');
    expect(resourcePanel).toHaveClass('border-stone-800');
    expect(resourcePanel).toHaveClass('font-serif');
  });

  it('日志窗口标题为"文明记录 (Chronicles)"', () => {
    render(<GameUI leaderName="Test" />);
    expect(screen.getByText('文明记录 (Chronicles)')).toBeInTheDocument();
  });

  it('近距交互时展示聆听占位提示', () => {
    act(() =>
      useGameState.setState({
        isNearAgent: true,
        agentState: 'LISTENING',
      })
    );
    render(<GameUI leaderName="Test" />);
    expect(screen.getByPlaceholderText('正在与德米特里交谈...')).toBeInTheDocument();
  });

  it('发送消息后写入 pendingCommand 并清空输入', async () => {
    const user = userEvent.setup();
    render(<GameUI leaderName="Test" />);
    const input = screen.getByPlaceholderText('喊话（距离过远）...');

    await user.type(input, '砍树{enter}');

    expect(useGameState.getState().pendingCommand).toBe('砍树');
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('文明记录只显示系统消息', () => {
    act(() =>
      useGameState.setState({
        logs: [
          { id: 1, text: '系统：游戏开始', type: 'system' },
          { id: 2, text: 'Test: 你好', type: 'chat' },
          { id: 3, text: '德米特里: 你好', type: 'chat' },
          { id: 4, text: '系统：德米特里砍伐了树木', type: 'system' },
        ],
      })
    );
    render(<GameUI leaderName="Test" />);

    // 文明记录区域应该只包含系统消息
    expect(screen.getByText('系统：游戏开始')).toBeInTheDocument();
    expect(screen.getByText('系统：德米特里砍伐了树木')).toBeInTheDocument();
    
    // 对话消息不应该出现在文明记录中（它们在对话面板）
    const chroniclesSection = screen.getByText('文明记录 (Chronicles)').parentElement?.parentElement;
    expect(chroniclesSection).not.toHaveTextContent('Test: 你好');
    expect(chroniclesSection).not.toHaveTextContent('德米特里: 你好');
  });

  it('发送消息后重置 inputFocused 状态', async () => {
    const user = userEvent.setup();
    render(<GameUI leaderName="Test" />);
    const input = screen.getByPlaceholderText('喊话（距离过远）...') as HTMLInputElement;

    // 聚焦输入框
    await user.click(input);
    expect(useGameState.getState().inputFocused).toBe(true);

    // 输入并发送
    await user.type(input, '测试{enter}');

    // 验证 inputFocused 被重置为 false
    expect(useGameState.getState().inputFocused).toBe(false);
  });
});

