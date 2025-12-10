import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameScene from '../app/components/Game/GameScene';
import { useGameState } from '../app/components/Game/GameState';

// Mock Canvas 和 Three.js 组件
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-canvas">{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: () => ({
    camera: {
      getWorldDirection: vi.fn(() => ({ x: 0, y: 0, z: -1, normalize: vi.fn() })),
    },
    clock: { getDelta: () => 0.016 },
  }),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  OrthographicCamera: () => null,
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('three', () => ({
  Vector3: class Vector3 {
    x = 0;
    y = 0;
    z = 0;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    normalize() {
      return this;
    }
    crossVectors() {
      return this;
    }
    addScaledVector() {
      return this;
    }
    add() {
      return this;
    }
    length() {
      return 0;
    }
  },
  Group: class Group {},
  Mesh: class Mesh {},
}));

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

describe('InputFocusRecovery - 输入焦点恢复测试', () => {
  beforeEach(() => {
    resetStore();
  });

  it('点击游戏区域后，inputFocused应重置为false', async () => {
    const user = userEvent.setup();
    render(<GameScene leaderName="测试领袖" />);

    // 找到输入框并聚焦
    const input = screen.getByPlaceholderText(/输入消息|交谈/);
    await user.click(input);

    // 手动设置状态，模拟输入框已聚焦
    act(() => {
      useGameState.setState({ inputFocused: true });
    });
    expect(useGameState.getState().inputFocused).toBe(true);

    // 点击游戏区域（Canvas wrapper）
    const gameWrapper = screen.getByTestId('mock-canvas').parentElement;
    expect(gameWrapper).toBeTruthy();
    
    if (gameWrapper) {
      await user.click(gameWrapper);
    }

    // 验证焦点状态被清除
    await waitFor(() => {
      expect(useGameState.getState().inputFocused).toBe(false);
    });
  });

  it('输入框聚焦后，直接点击Canvas wrapper应清除焦点', async () => {
    const user = userEvent.setup();
    render(<GameScene leaderName="测试领袖" />);

    const input = screen.getByPlaceholderText(/输入消息|交谈/) as HTMLInputElement;

    // 聚焦输入框
    await user.click(input);
    expect(document.activeElement).toBe(input);
    
    // 手动设置状态，模拟输入框已聚焦
    act(() => {
      useGameState.setState({ inputFocused: true });
    });
    expect(useGameState.getState().inputFocused).toBe(true);

    // 找到Canvas wrapper（带有tabIndex的div）
    const wrapperDiv = input.closest('[style*="width: 100%"]')?.parentElement?.querySelector('[tabindex="0"]');
    expect(wrapperDiv).toBeTruthy();

    if (wrapperDiv) {
      // 模拟点击游戏区域
      await user.click(wrapperDiv as HTMLElement);

      // 验证焦点被清除
      await waitFor(() => {
        expect(useGameState.getState().inputFocused).toBe(false);
      });
    }
  });

  it('输入框打字后点击游戏区域，焦点应正确释放', async () => {
    const user = userEvent.setup();
    render(<GameScene leaderName="测试领袖" />);

    const input = screen.getByPlaceholderText(/输入消息|交谈/);

    // 模拟真实场景：在输入框打字
    await user.click(input);
    await user.type(input, '砍树');
    
    // 手动设置状态，模拟输入框已聚焦（在测试环境中直接设置状态更可靠）
    act(() => {
      useGameState.setState({ inputFocused: true });
    });

    // 验证输入框已聚焦
    expect(useGameState.getState().inputFocused).toBe(true);
    expect((input as HTMLInputElement).value).toBe('砍树');

    // 点击游戏区域
    const gameWrapper = screen.getByTestId('mock-canvas').parentElement;
    if (gameWrapper) {
      await user.click(gameWrapper);
    }

    // 验证焦点状态被清除（这样WASD就能工作了）
    await waitFor(() => {
      expect(useGameState.getState().inputFocused).toBe(false);
    });
  });

  it('Canvas获得焦点时，应重置inputFocused状态', async () => {
    render(<GameScene leaderName="测试领袖" />);

    // 手动设置inputFocused为true（模拟输入框聚焦）
    act(() => {
      useGameState.setState({ inputFocused: true });
    });

    expect(useGameState.getState().inputFocused).toBe(true);

    // 找到Canvas wrapper并触发focus事件
    const wrapperDiv = screen.getByTestId('mock-canvas').parentElement;
    expect(wrapperDiv).toBeTruthy();

    if (wrapperDiv) {
      act(() => {
        wrapperDiv.focus();
      });

      // 验证onFocus处理器重置了状态
      await waitFor(() => {
        expect(useGameState.getState().inputFocused).toBe(false);
      });
    }
  });

  it('完整流程：聚焦输入 → 打字 → 点击Canvas → 验证状态恢复', async () => {
    const user = userEvent.setup();
    render(<GameScene leaderName="测试领袖" />);

    // 1. 初始状态
    expect(useGameState.getState().inputFocused).toBe(false);

    // 2. 聚焦输入框并打字
    const input = screen.getByPlaceholderText(/输入消息|交谈/);
    await user.click(input);
    await user.type(input, '砍树5棵');
    
    // 手动设置状态，模拟输入框已聚焦
    act(() => {
      useGameState.setState({ inputFocused: true });
    });
    expect(useGameState.getState().inputFocused).toBe(true);

    // 3. 验证输入内容
    expect((input as HTMLInputElement).value).toBe('砍树5棵');

    // 4. 点击游戏画面（用户想要移动角色）
    const gameWrapper = screen.getByTestId('mock-canvas').parentElement;
    if (gameWrapper) {
      await user.click(gameWrapper);
    }

    // 5. 验证焦点完全恢复，WASD控制应该可用
    await waitFor(() => {
      expect(useGameState.getState().inputFocused).toBe(false);
    });

    // 6. 验证输入框内容仍然保留（只是失去焦点）
    expect((input as HTMLInputElement).value).toBe('砍树5棵');
  });

  it('发送消息后，inputFocused应立即重置（已有测试的补充验证）', async () => {
    const user = userEvent.setup();
    render(<GameScene leaderName="测试领袖" />);

    const input = screen.getByPlaceholderText(/输入消息|交谈/);

    // 聚焦并输入
    await user.click(input);
    
    // 手动设置状态，模拟输入框已聚焦
    act(() => {
      useGameState.setState({ inputFocused: true });
    });
    expect(useGameState.getState().inputFocused).toBe(true);

    await user.type(input, '测试消息{enter}');

    // 验证发送后焦点被清除（这是本测试的核心目标）
    await waitFor(() => {
      expect(useGameState.getState().inputFocused).toBe(false);
    });

    // 注意：不验证 pendingCommand，因为它会被游戏逻辑立即处理并清空
    // 焦点重置才是这个测试用例要验证的功能
  });
});

