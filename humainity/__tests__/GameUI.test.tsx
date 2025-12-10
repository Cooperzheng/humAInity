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

  it('动态占位符：近场时显示"与德米特里交谈..."', () => {
    act(() =>
      useGameState.setState({
        isNearAgent: true,
        agentState: 'LISTENING',
      })
    );
    render(<GameUI leaderName="Test" />);
    expect(screen.getByPlaceholderText('与德米特里交谈...')).toBeInTheDocument();
  });

  it('动态占位符：远场时显示"输入消息..."', () => {
    act(() =>
      useGameState.setState({
        isNearAgent: false,
      })
    );
    render(<GameUI leaderName="Test" />);
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('动态占位符：ASKING 状态也视为近场交谈', () => {
    act(() =>
      useGameState.setState({
        isNearAgent: true,
        agentState: 'ASKING',
      })
    );
    render(<GameUI leaderName="Test" />);
    expect(screen.getByPlaceholderText('与德米特里交谈...')).toBeInTheDocument();
  });

  it('发送消息后写入 pendingCommand 并清空输入', async () => {
    const user = userEvent.setup();
    render(<GameUI leaderName="Test" />);
    const input = screen.getByPlaceholderText('输入消息...');

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
    const input = screen.getByPlaceholderText('输入消息...') as HTMLInputElement;

    // 聚焦输入框
    await user.click(input);
    expect(useGameState.getState().inputFocused).toBe(true);

    // 输入并发送
    await user.type(input, '测试{enter}');

    // 验证 inputFocused 被重置为 false
    expect(useGameState.getState().inputFocused).toBe(false);
  });

  it('操作指引：inputFocused 为 false 时显示', () => {
    act(() =>
      useGameState.setState({
        inputFocused: false,
      })
    );
    render(<GameUI leaderName="Test" />);
    
    // 验证操作指引显示（通过查找按键提示）
    expect(screen.getByText('移动')).toBeInTheDocument();
    expect(screen.getByText('交谈')).toBeInTheDocument();
    expect(screen.getByText('缩放视角')).toBeInTheDocument();
  });

  it('操作指引：inputFocused 为 true 时隐藏', () => {
    act(() =>
      useGameState.setState({
        inputFocused: true,
      })
    );
    render(<GameUI leaderName="Test" />);
    
    // 验证操作指引不显示
    expect(screen.queryByText('移动')).not.toBeInTheDocument();
    expect(screen.queryByText('交谈')).not.toBeInTheDocument();
    expect(screen.queryByText('缩放视角')).not.toBeInTheDocument();
  });

  it('状态指示器：默认状态显示灰色气泡', () => {
    act(() =>
      useGameState.setState({
        isNearAgent: false,
        agentState: 'IDLE',
      })
    );
    const { container } = render(<GameUI leaderName="Test" />);
    
    // 查找气泡 emoji
    expect(container.textContent).toContain('💬');
  });

  it('状态指示器：近场 LISTENING 状态显示金色耳朵（呼吸动画）', () => {
    act(() =>
      useGameState.setState({
        isNearAgent: true,
        agentState: 'LISTENING',
        inputFocused: true, // 隐藏操作指引，避免 MouseWheelIcon 干扰
      })
    );
    const { container } = render(<GameUI leaderName="Test" />);
    
    // 查找 EarIcon（SVG）- 现在页面上唯一的 SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-pulse');
    expect(svg).toHaveClass('text-amber-400');
  });

  it('状态指示器：近场 ASKING 状态也显示金色耳朵', () => {
    act(() =>
      useGameState.setState({
        isNearAgent: true,
        agentState: 'ASKING',
        inputFocused: true, // 隐藏操作指引，避免 MouseWheelIcon 干扰
      })
    );
    const { container } = render(<GameUI leaderName="Test" />);
    
    // 查找 EarIcon（SVG）- 现在页面上唯一的 SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-pulse');
  });

  it('状态指示器：近场但非 LISTENING/ASKING 状态显示气泡', () => {
    act(() =>
      useGameState.setState({
        isNearAgent: true,
        agentState: 'THINKING',
      })
    );
    const { container } = render(<GameUI leaderName="Test" />);
    
    // 应该显示气泡而不是耳朵
    expect(container.textContent).toContain('💬');
  });

  it('日志窗口位置调整为 top-12（为系统菜单预留空间）', () => {
    render(<GameUI leaderName="Test" />);
    const logWindow = screen.getByText('文明记录 (Chronicles)').parentElement?.parentElement;
    expect(logWindow).toHaveClass('top-12');
  });

  it('对话框宽度使用紧凑的 w-80（灵动岛紧凑版）', () => {
    render(<GameUI leaderName="Test" />);
    const input = screen.getByPlaceholderText('输入消息...') as HTMLInputElement;
    const dialoguePanel = input.closest('.w-80');
    expect(dialoguePanel).toBeInTheDocument();
  });

  it('操作指引使用淡化样式（低存在感设计）', () => {
    act(() =>
      useGameState.setState({
        inputFocused: false,
      })
    );
    const { container } = render(<GameUI leaderName="Test" />);
    
    // 查找操作指引容器（通过文本"移动"定位父元素）
    const controlsText = screen.getByText('移动');
    const controlsContainer = controlsText.closest('.bg-black\\/20');
    
    expect(controlsContainer).toBeInTheDocument();
    expect(controlsContainer).toHaveClass('bg-black/20'); // 淡化背景
  });
});

