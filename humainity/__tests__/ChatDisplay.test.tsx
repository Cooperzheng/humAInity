import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import GameUI from '../app/components/Game/GameUI';
import { useGameState } from '../app/components/Game/GameState';

describe('对话显示测试', () => {
  beforeEach(() => {
    // 每次测试前重置状态
    const { result } = renderHook(() => useGameState());
    act(() => {
      // 清空日志和状态
      while (result.current.logs.length > 0) {
        result.current.logs.pop();
      }
      result.current.setInputFocused(false);
      result.current.setNearAgent(false);
      result.current.updateAgent('dmitri', { state: 'IDLE' });
    });
  });

  it('对话框非聚焦时应只显示最近3条chat消息', () => {
    const { result } = renderHook(() => useGameState());

    // 添加多条不同类型的消息
    act(() => {
      result.current.addLog('系统：游戏开始', 'system');
      result.current.addLog('Archon: 你好', 'chat');
      result.current.addLog('德米特里: 你好，领袖', 'chat');
      result.current.addLog('系统：玩家移动', 'system');
      result.current.addLog('Archon: 砍树', 'chat');
      result.current.addLog('德米特里: 需要几棵？', 'chat');
      result.current.addLog('系统：进入ASKING状态', 'system');
      result.current.addLog('Archon: 3', 'chat');
    });

    // 渲染组件
    render(<GameUI leaderName="Archon" />);

    // 对话框应该只显示chat类型，且非聚焦时只有最近3条
    const chatLogs = result.current.logs.filter((l) => l.type === 'chat');
    expect(chatLogs.length).toBe(5); // 总共5条chat

    // 非聚焦时应该显示最近3条
    const displayedChats = chatLogs.slice(-3);
    expect(displayedChats.length).toBe(3);
    expect(displayedChats[0].text).toBe('Archon: 砍树');
    expect(displayedChats[1].text).toBe('德米特里: 需要几棵？');
    expect(displayedChats[2].text).toBe('Archon: 3');
  });

  it('对话框聚焦时应显示最近5条chat消息', () => {
    const { result } = renderHook(() => useGameState());

    // 添加多条对话消息
    act(() => {
      result.current.addLog('Archon: 消息1', 'chat');
      result.current.addLog('德米特里: 回复1', 'chat');
      result.current.addLog('Archon: 消息2', 'chat');
      result.current.addLog('德米特里: 回复2', 'chat');
      result.current.addLog('Archon: 消息3', 'chat');
      result.current.addLog('德米特里: 回复3', 'chat');
      result.current.addLog('系统：某个系统消息', 'system');
    });

    render(<GameUI leaderName="Archon" />);

    // 聚焦输入框
    const input = screen.getByPlaceholderText(/输入消息/);
    fireEvent.focus(input);

    // 验证状态变化
    waitFor(() => {
      expect(result.current.inputFocused).toBe(true);
    });

    // 聚焦时应该显示最近5条chat
    const chatLogs = result.current.logs.filter((l) => l.type === 'chat');
    const displayedChats = chatLogs.slice(-5);
    expect(displayedChats.length).toBe(5);
  });

  it('系统消息不应出现在对话框中', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.addLog('Archon: 你好', 'chat');
      result.current.addLog('系统：玩家移动', 'system');
      result.current.addLog('系统：资源采集', 'system');
      result.current.addLog('德米特里: 你好', 'chat');
      result.current.addLog('系统：状态变化', 'system');
    });

    render(<GameUI leaderName="Archon" />);

    // 验证只有chat类型的消息
    const chatLogs = result.current.logs.filter((l) => l.type === 'chat');
    const systemLogs = result.current.logs.filter((l) => l.type === 'system');
    
    expect(chatLogs.length).toBe(2);
    expect(systemLogs.length).toBe(3);

    // 对话框中不应该有系统消息
    chatLogs.forEach((log) => {
      expect(log.type).toBe('chat');
      expect(log.text).not.toContain('系统：');
    });
  });

  it('玩家发送消息后应立即显示在对话框中', async () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.setNearAgent(true);
      result.current.updateAgent('dmitri', { state: 'LISTENING' });
    });

    render(<GameUI leaderName="Archon" />);

    const input = screen.getByPlaceholderText(/与德米特里交谈/);
    const sendButton = screen.getByText('发送');

    // 输入消息
    fireEvent.change(input, { target: { value: '砍树' } });
    
    // 发送消息
    fireEvent.click(sendButton);

    // 验证消息立即添加到日志
    await waitFor(() => {
      const logs = result.current.logs;
      expect(logs).toContainEqual(
        expect.objectContaining({
          text: 'Archon: 砍树',
          type: 'chat'
        })
      );
    });

    // 验证输入框已清空
    expect(input).toHaveValue('');
  });

  it('应该正确过滤并显示chat类型消息', () => {
    const { result } = renderHook(() => useGameState());

    // 混合添加各种类型的消息
    act(() => {
      result.current.addLog('系统：初始化', 'system');
      result.current.addLog('Archon: 开始游戏', 'chat');
      result.current.addLog('系统：加载资源', 'system');
      result.current.addLog('德米特里: 准备就绪', 'chat');
      result.current.addLog('系统：场景渲染完成', 'system');
      result.current.addLog('Archon: 你好', 'chat');
      result.current.addLog('系统：德米特里靠近', 'system');
      result.current.addLog('德米特里: 你好，领袖', 'chat');
    });

    const allLogs = result.current.logs;
    const chatLogs = allLogs.filter((l) => l.type === 'chat');
    const systemLogs = allLogs.filter((l) => l.type === 'system');

    expect(allLogs.length).toBe(8);
    expect(chatLogs.length).toBe(4);
    expect(systemLogs.length).toBe(4);

    // 验证过滤正确
    chatLogs.forEach((log) => {
      expect(log.type).toBe('chat');
    });

    systemLogs.forEach((log) => {
      expect(log.type).toBe('system');
    });
  });

  it('发送空消息时不应添加到日志', () => {
    const { result } = renderHook(() => useGameState());

    render(<GameUI leaderName="Archon" />);

    const sendButton = screen.getByText('发送');
    const initialLogCount = result.current.logs.length;

    // 尝试发送空消息
    fireEvent.click(sendButton);

    // 日志数量不应该变化
    expect(result.current.logs.length).toBe(initialLogCount);
  });

  it('按Enter键应该发送消息', async () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.setNearAgent(true);
      result.current.updateAgent('dmitri', { state: 'LISTENING' });
    });

    render(<GameUI leaderName="Archon" />);

    const input = screen.getByPlaceholderText(/与德米特里交谈/);

    // 输入消息
    fireEvent.change(input, { target: { value: '测试消息' } });
    
    // 按Enter
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // 验证消息已发送
    await waitFor(() => {
      expect(result.current.logs).toContainEqual(
        expect.objectContaining({
          text: 'Archon: 测试消息',
          type: 'chat'
        })
      );
    });
  });
});

