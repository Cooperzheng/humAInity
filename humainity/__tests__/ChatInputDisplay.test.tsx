import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useGameState } from '../app/components/Game/GameState';
import GameUI from '../app/components/Game/GameUI';

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

describe('对话输入和显示功能测试', () => {
  beforeEach(() => {
    // 重置游戏状态
    useGameState.setState({
      wood: 0,
      food: 0,
      logs: [],
      isNearAgent: false,
      inputFocused: false,
      pendingCommand: null,
      agents: createDefaultAgent('IDLE'),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('输入框应该使用高对比度配色，确保文本清晰可见', () => {
    render(<GameUI leaderName="测试领袖" />);
    
    const input = screen.getByPlaceholderText(/输入消息.../);
    expect(input).toBeInTheDocument();
    
    // 验证输入框使用了增强的配色方案
    expect(input).toHaveClass('bg-[#E8DCC8]'); // 浅色背景
    expect(input).toHaveClass('text-[#2B2B2B]'); // 深色文字
    expect(input).toHaveClass('placeholder:text-stone-700'); // 深色 placeholder
    expect(input).toHaveClass('font-medium'); // 增强字重
  });

  it('近场时输入框应显示"与德米特里交谈..."提示', () => {
    useGameState.setState({
      isNearAgent: true,
      agents: createDefaultAgent('LISTENING'),
    });

    render(<GameUI leaderName="测试领袖" />);
    
    const input = screen.getByPlaceholderText(/与德米特里交谈.../);
    expect(input).toBeInTheDocument();
  });

  it('发送消息后应立即显示在对话历史中', async () => {
    const user = userEvent.setup();
    useGameState.setState({
      isNearAgent: true,
      agents: createDefaultAgent('LISTENING'),
    });

    render(<GameUI leaderName="测试领袖" />);
    
    const input = screen.getByPlaceholderText(/与德米特里交谈.../);
    const sendButton = screen.getByRole('button', { name: /发送/ });

    // 输入消息
    await user.type(input, '你好');
    await user.click(sendButton);

    // 验证消息立即显示
    await waitFor(() => {
      expect(screen.getByText(/测试领袖: 你好/)).toBeInTheDocument();
    });

    // 验证消息类型为 chat
    const state = useGameState.getState();
    const lastLog = state.logs[state.logs.length - 1];
    expect(lastLog.type).toBe('chat');
    expect(lastLog.text).toBe('测试领袖: 你好');
  });

  it('发送空消息时不应添加到日志', async () => {
    const user = userEvent.setup();
    render(<GameUI leaderName="测试领袖" />);
    
    const sendButton = screen.getByRole('button', { name: /发送/ });
    const initialLogsCount = useGameState.getState().logs.length;

    // 点击发送按钮（输入框为空）
    await user.click(sendButton);

    // 验证日志数量未增加
    const finalLogsCount = useGameState.getState().logs.length;
    expect(finalLogsCount).toBe(initialLogsCount);
  });

  it('leaderName 为空时应显示错误提示', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<GameUI leaderName="" />);
    
    const input = screen.getByPlaceholderText(/输入消息.../);
    const sendButton = screen.getByRole('button', { name: /发送/ });

    await user.type(input, '测试消息');
    await user.click(sendButton);

    // 验证控制台错误
    expect(consoleErrorSpy).toHaveBeenCalledWith('[GameUI] leaderName is empty!');

    // 验证错误提示
    await waitFor(() => {
      const state = useGameState.getState();
      const lastLog = state.logs[state.logs.length - 1];
      expect(lastLog.text).toBe('系统：领袖名称未设置，请重新启动游戏。');
      expect(lastLog.type).toBe('system');
    });

    consoleErrorSpy.mockRestore();
  });

  it('按 Enter 键应发送消息', async () => {
    const user = userEvent.setup();
    useGameState.setState({
      isNearAgent: true,
      agents: createDefaultAgent('LISTENING'),
    });

    render(<GameUI leaderName="测试领袖" />);
    
    const input = screen.getByPlaceholderText(/与德米特里交谈.../);

    await user.type(input, '砍树');
    await user.keyboard('{Enter}');

    // 验证消息已发送
    await waitFor(() => {
      expect(screen.getByText(/测试领袖: 砍树/)).toBeInTheDocument();
    });

    // 验证 pendingCommand 已设置
    const state = useGameState.getState();
    expect(state.pendingCommand).toBe('砍树');
  });

  it('发送消息后应清空输入框', async () => {
    const user = userEvent.setup();
    render(<GameUI leaderName="测试领袖" />);
    
    const input = screen.getByPlaceholderText(/输入消息.../) as HTMLInputElement;
    const sendButton = screen.getByRole('button', { name: /发送/ });

    await user.type(input, '测试消息');
    expect(input.value).toBe('测试消息');

    await user.click(sendButton);

    // 验证输入框已清空
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('聚焦输入框时应设置 inputFocused 状态', async () => {
    const user = userEvent.setup();
    render(<GameUI leaderName="测试领袖" />);
    
    const input = screen.getByPlaceholderText(/输入消息.../);

    // 初始状态
    expect(useGameState.getState().inputFocused).toBe(false);

    // 聚焦输入框
    await user.click(input);

    // 验证状态更新
    await waitFor(() => {
      expect(useGameState.getState().inputFocused).toBe(true);
    });
  });

  it('发送消息后应立即清除焦点，确保状态同步', async () => {
    const user = userEvent.setup();
    
    useGameState.setState({
      isNearAgent: true,
      agents: createDefaultAgent('LISTENING'),
    });

    render(<GameUI leaderName="测试领袖" />);
    
    const input = screen.getByPlaceholderText(/与德米特里交谈.../);
    const sendButton = screen.getByRole('button', { name: /发送/ });

    await user.type(input, '测试');
    
    // 发送前 inputFocused 应该为 true
    expect(useGameState.getState().inputFocused).toBe(true);
    
    await user.click(sendButton);

    // 消息应该立即添加到日志
    const state = useGameState.getState();
    expect(state.logs.some(log => log.text === '测试领袖: 测试')).toBe(true);

    // 发送后 inputFocused 应该立即变为 false
    await waitFor(() => {
      expect(useGameState.getState().inputFocused).toBe(false);
    });
  });

  it('连续发送多条消息应全部正确显示', async () => {
    const user = userEvent.setup();
    useGameState.setState({
      isNearAgent: true,
      agents: createDefaultAgent('LISTENING'),
    });

    render(<GameUI leaderName="测试领袖" />);
    
    const input = screen.getByPlaceholderText(/与德米特里交谈.../);
    const sendButton = screen.getByRole('button', { name: /发送/ });

    // 发送第一条消息
    await user.type(input, '消息1');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/测试领袖: 消息1/)).toBeInTheDocument();
    });

    // 发送第二条消息
    await user.type(input, '消息2');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/测试领袖: 消息2/)).toBeInTheDocument();
    });

    // 发送第三条消息
    await user.type(input, '消息3');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/测试领袖: 消息3/)).toBeInTheDocument();
    });

    // 验证所有消息都在日志中
    const state = useGameState.getState();
    expect(state.logs.length).toBeGreaterThanOrEqual(3);
    expect(state.logs.some(log => log.text === '测试领袖: 消息1')).toBe(true);
    expect(state.logs.some(log => log.text === '测试领袖: 消息2')).toBe(true);
    expect(state.logs.some(log => log.text === '测试领袖: 消息3')).toBe(true);
  });

  it('对话历史应根据 inputFocused 状态动态调整显示数量', async () => {
    const user = userEvent.setup();
    
    // 预先添加5条对话日志
    useGameState.setState({
      logs: [
        { id: 1, text: '测试领袖: 消息1', type: 'chat' },
        { id: 2, text: '德米特里: 回复1', type: 'chat' },
        { id: 3, text: '测试领袖: 消息2', type: 'chat' },
        { id: 4, text: '德米特里: 回复2', type: 'chat' },
        { id: 5, text: '测试领袖: 消息3', type: 'chat' },
      ],
      isNearAgent: true,
      agents: createDefaultAgent('LISTENING'),
    });

    render(<GameUI leaderName="测试领袖" />);
    
    const input = screen.getByPlaceholderText(/与德米特里交谈.../);

    // 失焦状态：应该只显示最近3条
    expect(screen.queryByText(/消息1/)).not.toBeInTheDocument();
    expect(screen.queryByText(/回复1/)).not.toBeInTheDocument();
    expect(screen.getByText(/消息2/)).toBeInTheDocument();
    expect(screen.getByText(/回复2/)).toBeInTheDocument();
    expect(screen.getByText(/消息3/)).toBeInTheDocument();

    // 聚焦输入框
    await user.click(input);

    // 聚焦状态：应该显示所有对话
    await waitFor(() => {
      expect(screen.getByText(/消息1/)).toBeInTheDocument();
      expect(screen.getByText(/回复1/)).toBeInTheDocument();
      expect(screen.getByText(/消息2/)).toBeInTheDocument();
      expect(screen.getByText(/回复2/)).toBeInTheDocument();
      expect(screen.getByText(/消息3/)).toBeInTheDocument();
    });
  });
});

