'use client';

import { useMemo, useState } from 'react';
import { useGameState } from './GameState';

interface GameUIProps {
  leaderName: string;
}

export default function GameUI({ leaderName }: GameUIProps) {
  const {
    wood,
    logs,
    isNearAgent,
    agentState,
    inputFocused,
    addLog,
    setPendingCommand,
    setInputFocused,
  } = useGameState();
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');

  const recentSystem = useMemo(
    () => logs.filter((l) => l.type === 'system').slice(-3),
    [logs]
  );

  // 对话框：只显示 chat 类型消息
  const chatLogs = useMemo(
    () => logs.filter((l) => l.type === 'chat'),
    [logs]
  );

  // 根据聚焦状态决定显示数量
  const displayedChatLogs = useMemo(
    () => chatLogs.slice(-(inputFocused ? 5 : 3)),
    [chatLogs, inputFocused]
  );

  const placeholder =
    isNearAgent && agentState === 'LISTENING'
      ? '正在与德米特里交谈...'
      : '喊话（距离过远）...';

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    // 立即记录玩家消息到对话日志
    addLog(`${leaderName}: ${text}`, 'chat');
    // 触发游戏逻辑处理
    setPendingCommand(text);
    setMessage('');
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none">
      {/* 资源面板 - 左上 */}
      <div className="pointer-events-auto absolute top-4 left-4 px-4 py-3 rounded-2xl border border-white/20 bg-white/15 backdrop-blur-xl shadow-xl text-sm text-white/90">
        <div className="font-semibold tracking-wide">资源</div>
        <div className="mt-1 text-xs text-white/80">木材：{wood}</div>
      </div>

      {/* 日志窗口 - 右侧 */}
      <div
        className={`pointer-events-auto absolute top-4 right-4 w-80 rounded-2xl border border-white/15 backdrop-blur-xl overflow-hidden transition-all ${
          expanded ? 'bg-[#0f172a]/85 text-white shadow-2xl' : 'bg-[#0f172a]/30 text-white/80 shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-2 text-xs">
          <span className="font-semibold tracking-wide">日志</span>
          <button
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '收起' : '展开'}
          </button>
        </div>
        <div
          className={`px-4 pb-3 space-y-1 ${expanded ? 'max-h-72 overflow-y-auto' : 'max-h-20'} scrollbar-thin scrollbar-thumb-white/20`}
        >
          {(expanded ? logs : recentSystem).map((l, idx) => (
            <div
              key={`${l.id}-${idx}`}
              className={`text-xs ${
                l.type === 'system' ? 'text-white/70' : 'text-white'
              }`}
            >
              {l.text}
            </div>
          ))}
        </div>
      </div>

      {/* 对话面板 - 底部居中 */}
      <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 w-[720px] max-w-[92vw]">
        {/* 对话历史区：非聚焦显示3条，聚焦显示5条，支持滚动查看更多 */}
        <div className="mb-2 max-h-28 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/20">
          {displayedChatLogs.map((l, idx) => (
            <div
              key={`${l.id}-${idx}`}
              className="text-xs text-white"
            >
              {l.text}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-[#0f172a]/85 text-white rounded-2xl border border-white/15 px-4 py-2.5 shadow-2xl">
          <span className="text-lg">{isNearAgent && agentState === 'LISTENING' ? '👂' : '💬'}</span>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={placeholder}
            className={`flex-1 bg-transparent outline-none text-sm ${
              isNearAgent && agentState === 'LISTENING' ? 'text-white' : 'text-white/70'
            }`}
          />
          <button
            onClick={handleSend}
            className="px-4 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-sm"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

