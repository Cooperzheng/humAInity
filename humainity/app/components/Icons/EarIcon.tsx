interface EarIconProps {
  size?: number;
  className?: string;
}

export const EarIcon = ({ size = 24, className = '' }: EarIconProps) => (
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
    {/* 外耳轮廓 */}
    <path d="M12 4C9.5 4 7.5 6 7.5 8.5C7.5 11 8 13 8 15C8 17 9 19 11 20" />
    {/* 内耳结构 */}
    <path d="M10 8.5C10 7.5 10.5 7 11.5 7C12.5 7 13 7.5 13 8.5C13 9.5 12.5 11 11.5 12" />
    {/* 耳垂 */}
    <path d="M11 20C11 20.5 11.5 21 12 21C12.5 21 13 20.5 13 20" />
  </svg>
);

