import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameUI from '../app/components/Game/GameUI';
import { useGameState } from '../app/components/Game/GameState';

const resetStore = () =>
  act(() =>
    useGameState.setState({
      wood: 0,
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
});

