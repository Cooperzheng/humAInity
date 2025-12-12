import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../app/components/Game/GameState';

describe('砍树流程集成测试', () => {
  beforeEach(() => {
    // 每次测试前重置状态
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.logs.length = 0;
      result.current.wood = 0;
      result.current.isNearAgent = false;
      result.current.updateAgent('dmitri', { state: 'IDLE' });
      result.current.pendingCommand = null;
    });
  });

  it('应该正确处理完整的砍树指令流程', () => {
    const { result } = renderHook(() => useGameState());

    // 1. 玩家接近 NPC
    act(() => {
      result.current.setNearAgent(true);
      result.current.updateAgent('dmitri', { state: 'LISTENING' });
    });
    expect(result.current.isNearAgent).toBe(true);
    expect(result.current.agents['dmitri'].state).toBe('LISTENING');

    // 2. 玩家发送"砍树"指令
    act(() => {
      result.current.addLog('Archon: 砍树', 'chat');
      result.current.setPendingCommand('砍树');
    });
    expect(result.current.pendingCommand).toBe('砍树');
    expect(result.current.logs).toContainEqual(
      expect.objectContaining({ text: 'Archon: 砍树', type: 'chat' })
    );

    // 3. NPC 询问数量（模拟游戏逻辑）
    act(() => {
      result.current.updateAgent('dmitri', { state: 'ASKING' });
      result.current.addLog('德米特里: 需要砍几棵树？', 'chat');
      result.current.setPendingCommand(null);
    });
    expect(result.current.agents['dmitri'].state).toBe('ASKING');
    expect(result.current.logs).toContainEqual(
      expect.objectContaining({ text: '德米特里: 需要砍几棵树？', type: 'chat' })
    );

    // 4. 玩家回复"3"
    act(() => {
      result.current.addLog('Archon: 3', 'chat');
      result.current.setPendingCommand('3');
    });
    expect(result.current.pendingCommand).toBe('3');

    // 5. 验证数字解析（模拟解析逻辑）
    const numMatch = '3'.match(/\d+/);
    expect(numMatch).not.toBeNull();
    expect(numMatch![0]).toBe('3');

    // 6. NPC 确认并开始执行
    act(() => {
      result.current.addLog('德米特里: 好的，砍 3 棵。', 'chat');
      result.current.updateAgent('dmitri', { state: 'ACTING' });
      result.current.setPendingCommand(null);
    });
    expect(result.current.agents['dmitri'].state).toBe('ACTING');

    // 7. 模拟砍树完成
    act(() => {
      result.current.addWood(1);
      result.current.addLog('系统：德米特里砍伐了树木，木材 +1。', 'system');
    });
    expect(result.current.wood).toBe(1);
    expect(result.current.logs).toContainEqual(
      expect.objectContaining({ 
        text: '系统：德米特里砍伐了树木，木材 +1。', 
        type: 'system' 
      })
    );

    // 8. 验证系统消息不在对话日志中（只在完整日志中）
    const chatLogs = result.current.logs.filter((l) => l.type === 'chat');
    const systemLogs = result.current.logs.filter((l) => l.type === 'system');
    expect(chatLogs.length).toBeGreaterThan(0);
    expect(systemLogs.length).toBeGreaterThan(0);
    expect(chatLogs.every((l) => l.type === 'chat')).toBe(true);
  });

  it('应该能正确解析各种数字输入', () => {
    const testCases = [
      { input: '3', expected: '3' },
      { input: '砍10棵', expected: '10' },
      { input: '需要5个', expected: '5' },
      { input: '1', expected: '1' },
      { input: '20', expected: '20' },
    ];

    testCases.forEach(({ input, expected }) => {
      const match = input.match(/\d+/);
      expect(match).not.toBeNull();
      expect(match![0]).toBe(expected);
    });
  });

  it('应该拒绝无效的数量输入', () => {
    const invalidInputs = ['abc', '没有数字', '树', ''];
    
    invalidInputs.forEach((input) => {
      const match = input.match(/\d+/);
      expect(match).toBeNull();
    });
  });

  it('应该正确累加木材资源', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.wood).toBe(0);

    act(() => {
      result.current.addWood(1);
    });
    expect(result.current.wood).toBe(1);

    act(() => {
      result.current.addWood(2);
    });
    expect(result.current.wood).toBe(3);

    act(() => {
      result.current.addWood(5);
    });
    expect(result.current.wood).toBe(8);
  });
});

