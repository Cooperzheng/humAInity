interface MouseWheelIconProps {
  size?: number;
  className?: string;
}

export const MouseWheelIcon = ({ size = 20, className = '' }: MouseWheelIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 鼠标外框 */}
    <rect x="7" y="3" width="10" height="18" rx="5" ry="5" />
    {/* 滚轮 */}
    <line x1="12" y1="7" x2="12" y2="10" />
  </svg>
);

