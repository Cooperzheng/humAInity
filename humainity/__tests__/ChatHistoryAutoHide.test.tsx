import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import GameUI from '../app/components/Game/GameUI';
import { useGameState } from '../app/components/Game/GameState';

// Mock GameState
vi.mock('../app/components/Game/GameState', () => ({
  useGameState: vi.fn(),
}));

describe('对话历史自动隐藏机制', () => {
  const mockGameState = {
    wood: 5,
    food: 0,
    // Genesis V0.2: 新增 inventory 字段
    inventory: {
      wood: 5,
      berry: 50,
      meat: 0,
    },
    logs: [
      { id: 1, text: '系统：游戏开始', type: 'system' },
      { id: 2, text: 'Archon: 你好', type: 'chat' },
      { id: 3, text: '德米特里: 您好，领袖', type: 'chat' },
      { id: 4, text: 'Archon: 砍树', type: 'chat' },
      { id: 5, text: '德米特里: 好的，砍几棵？', type: 'chat' },
      { id: 6, text: 'Archon: 3', type: 'chat' },
      { id: 7, text: '德米特里: 好的，欣3棵。', type: 'chat' },
      { id: 8, text: '系统：德米特里砍伐了树木，木材 +1', type: 'system' },
    ],
    isNearAgent: true,
    inputFocused: false,
    // Genesis V0.2: 新增 agents 字典
    agents: {
      dmitri: {
        id: 'dmitri',
        name: 'Dmitri',
        primaryRole: 'worker',
        currentAssignment: 'Lumberjack',
        stats: { satiety: 100, energy: 100, health: 100 },
        capTraits: ['Strong'],
        psychTraits: ['Loyal'],
        state: 'LISTENING',
        thoughtHistory: [],
        shortTermMemory: [],
      }
    },
    addLog: vi.fn(),
    setPendingCommand: vi.fn(),
    setInputFocused: vi.fn(),
    updateAgent: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    (useGameState as any).mockReturnValue(mockGameState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('失焦状态下，对话历史显示最近3条', () => {
    render(<GameUI leaderName="Archon" />);

    // 对话历史应该可见（初始状态），显示最近3条
    expect(screen.getByText('德米特里: 好的，砍几棵？')).toBeInTheDocument();
    expect(screen.getByText('Archon: 3')).toBeInTheDocument();
    expect(screen.getByText('德米特里: 好的，欣3棵。')).toBeInTheDocument();

    // 不应该显示更早的对话
    expect(screen.queryByText('Archon: 你好')).not.toBeInTheDocument();
    expect(screen.queryByText('德米特里: 您好，领袖')).not.toBeInTheDocument();
    expect(screen.queryByText('Archon: 砍树')).not.toBeInTheDocument();
  });

  it('聚焦状态下，对话历史显示所有记录', () => {
    (useGameState as any).mockReturnValue({
      ...mockGameState,
      inputFocused: true,
    });

    render(<GameUI leaderName="Archon" />);

    // 应该显示所有对话记录
    expect(screen.getByText('Archon: 你好')).toBeInTheDocument();
    expect(screen.getByText('德米特里: 您好，领袖')).toBeInTheDocument();
    expect(screen.getByText('Archon: 砍树')).toBeInTheDocument();
    expect(screen.getByText('德米特里: 好的，砍几棵？')).toBeInTheDocument();
    expect(screen.getByText('Archon: 3')).toBeInTheDocument();
    expect(screen.getByText('德米特里: 好的，欣3棵。')).toBeInTheDocument();
  });

  it('失焦后5秒内，对话历史仍然可见', () => {
    render(<GameUI leaderName="Archon" />);

    // 初始状态：对话历史可见（显示最近3条）
    expect(screen.getByText('Archon: 3')).toBeInTheDocument();

    // 前进4秒
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // 对话历史仍然可见
    expect(screen.getByText('Archon: 3')).toBeInTheDocument();
  });

  it('失焦超过5秒后，对话历史自动隐藏', () => {
    render(<GameUI leaderName="Archon" />);

    // 初始状态：对话历史可见
    expect(screen.getByText('Archon: 3')).toBeInTheDocument();

    // 前进5秒
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // 对话历史应该被隐藏（直接断言，不使用 waitFor）
    expect(screen.queryByText('Archon: 3')).not.toBeInTheDocument();
  });

  it('隐藏后重新聚焦，对话历史立即显示', () => {
    const { rerender } = render(<GameUI leaderName="Archon" />);

    // 等待5秒，对话历史隐藏
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // 对话历史应该被隐藏
    expect(screen.queryByText('Archon: 3')).not.toBeInTheDocument();

    // 重新聚焦
    (useGameState as any).mockReturnValue({
      ...mockGameState,
      inputFocused: true,
    });

    rerender(<GameUI leaderName="Archon" />);

    // 对话历史立即显示，并且显示所有记录
    expect(screen.getByText('Archon: 你好')).toBeInTheDocument();
    expect(screen.getByText('Archon: 砍树')).toBeInTheDocument();
    expect(screen.getByText('Archon: 3')).toBeInTheDocument();
  });

  it('失焦倒计时期间再次聚焦，定时器应被清除', () => {
    const { rerender } = render(<GameUI leaderName="Archon" />);

    // 初始状态：对话历史可见（显示最近3条）
    expect(screen.getByText('Archon: 3')).toBeInTheDocument();

    // 前进3秒（未到5秒）
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // 重新聚焦
    (useGameState as any).mockReturnValue({
      ...mockGameState,
      inputFocused: true,
    });

    rerender(<GameUI leaderName="Archon" />);

    // 再前进3秒（总共6秒，但因为重新聚焦，定时器应该被清除）
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // 对话历史仍然可见（因为现在是聚焦状态），并且显示所有记录
    expect(screen.getByText('Archon: 你好')).toBeInTheDocument();
    expect(screen.getByText('Archon: 砍树')).toBeInTheDocument();
    expect(screen.getByText('Archon: 3')).toBeInTheDocument();

    // 再次失焦
    (useGameState as any).mockReturnValue({
      ...mockGameState,
      inputFocused: false,
    });

    rerender(<GameUI leaderName="Archon" />);

    // 前进5秒
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // 现在对话历史应该被隐藏
    expect(screen.queryByText('Archon: 3')).not.toBeInTheDocument();
  });

  it('聚焦时对话历史区域高度增加', () => {
    const { rerender, container } = render(<GameUI leaderName="Archon" />);

    // 失焦状态：max-h-28
    let chatHistoryDiv = container.querySelector('.max-h-28');
    expect(chatHistoryDiv).toBeInTheDocument();

    // 聚焦状态
    (useGameState as any).mockReturnValue({
      ...mockGameState,
      inputFocused: true,
    });

    rerender(<GameUI leaderName="Archon" />);

    // 聚焦状态：max-h-60
    chatHistoryDiv = container.querySelector('.max-h-60');
    expect(chatHistoryDiv).toBeInTheDocument();
  });

  it('失焦超过5秒后隐藏，但收到新消息时重新显示', () => {
    const { rerender } = render(<GameUI leaderName="Archon" />);

    // 初始状态：对话历史可见
    expect(screen.getByText('Archon: 3')).toBeInTheDocument();

    // 前进5秒，对话历史隐藏
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // 对话历史应该被隐藏
    expect(screen.queryByText('Archon: 3')).not.toBeInTheDocument();

    // 模拟收到新的对话消息（NPC 回复）
    const updatedLogs = [
      ...mockGameState.logs,
      { id: 9, text: '德米特里: 正在砍第2棵树...', type: 'chat' },
    ];

    (useGameState as any).mockReturnValue({
      ...mockGameState,
      logs: updatedLogs,
      inputFocused: false, // 仍然是失焦状态
    });

    rerender(<GameUI leaderName="Archon" />);

    // 对话历史应该重新显示（显示最近3条）
    expect(screen.getByText('Archon: 3')).toBeInTheDocument();
    expect(screen.getByText('德米特里: 好的，欣3棵。')).toBeInTheDocument();
    expect(screen.getByText('德米特里: 正在砍第2棵树...')).toBeInTheDocument();

    // 新消息触发新的5秒倒计时，4秒后仍可见
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText('德米特里: 正在砍第2棵树...')).toBeInTheDocument();

    // 再过1秒（总共5秒），对话历史再次隐藏
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText('德米特里: 正在砍第2棵树...')).not.toBeInTheDocument();
  });
});

