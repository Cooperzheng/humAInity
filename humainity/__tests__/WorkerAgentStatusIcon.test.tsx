import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock R3F hooks so we don't execute the animation loop
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

// Mock Html to render children into DOM
vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div data-testid="html">{children}</div>,
}));

// Minimal three mock (types only; we never run useFrame callbacks here)
vi.mock('three', () => ({
  Group: class Group {},
  Mesh: class Mesh {},
}));

import WorkerAgent from '../app/components/Character/WorkerAgent';

const noop = () => {};

describe('WorkerAgent - 头顶状态图标', () => {
  it('新状态应渲染对应 emoji', () => {
    const playerRef = { current: null } as any;

    const cases: Array<{ state: any; icon: string }> = [
      { state: 'DELIVERING', icon: '📦' },
      { state: 'SEEKING_FOOD', icon: '🏃‍♀️' },
      { state: 'EATING', icon: '🍖' },
      { state: 'EXHAUSTED', icon: '😩' },
      { state: 'SLEEPING', icon: '💤' },
    ];

    cases.forEach(({ state, icon }) => {
      const { unmount } = render(
        <WorkerAgent
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={null as any}
          playerRef={playerRef}
          agentState={state}
          isNearAgent={false}
          actionTarget={null}
          onActionDone={noop}
        />
      );

      const html = screen.getByTestId('html');
      expect(html).toHaveTextContent(icon);
      expect(html).toHaveTextContent('德米特里');
      unmount();
    });
  });

  it('旧状态图标保持可用：LISTENING(近场)/THINKING/ACTING', () => {
    const playerRef = { current: null } as any;

    const { rerender } = render(
      <WorkerAgent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={null as any}
        playerRef={playerRef}
        agentState={'LISTENING' as any}
        isNearAgent={true}
        actionTarget={null}
        onActionDone={noop}
      />
    );
    expect(screen.getByTestId('html')).toHaveTextContent('👂');
    expect(screen.getByTestId('html')).toHaveTextContent('德米特里');

    rerender(
      <WorkerAgent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={null as any}
        playerRef={playerRef}
        agentState={'THINKING' as any}
        isNearAgent={false}
        actionTarget={null}
        onActionDone={noop}
      />
    );
    expect(screen.getByTestId('html')).toHaveTextContent('⚙️');
    expect(screen.getByTestId('html')).toHaveTextContent('德米特里');

    rerender(
      <WorkerAgent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={null as any}
        playerRef={playerRef}
        agentState={'ACTING' as any}
        isNearAgent={false}
        actionTarget={null}
        onActionDone={noop}
      />
    );
    expect(screen.getByTestId('html')).toHaveTextContent('🪓');
    expect(screen.getByTestId('html')).toHaveTextContent('德米特里');
  });
});
