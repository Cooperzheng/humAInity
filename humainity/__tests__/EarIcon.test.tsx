import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { EarIcon } from '../app/components/Icons/EarIcon';

describe('EarIcon', () => {
  it('正常渲染 SVG 元素', () => {
    const { container } = render(<EarIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('使用默认尺寸 24', () => {
    const { container } = render(<EarIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('自定义尺寸生效', () => {
    const { container } = render(<EarIcon size={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('自定义 className 生效', () => {
    const { container } = render(<EarIcon className="test-class" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('test-class');
  });

  it('包含耳朵轮廓路径', () => {
    const { container } = render(<EarIcon />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });
});

