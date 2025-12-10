'use client';

import { useMemo, useState, useEffect } from 'react';
import { useGameState } from './GameState';
import { EarIcon } from '../Icons/EarIcon';

interface GameUIProps {
  leaderName: string;
}

function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue((v) => !v);
  return [value, toggle];
}

export default function GameUI({ leaderName }: GameUIProps) {
  const {
    wood,
    food,
    logs,
    isNearAgent,
    agentState,
    inputFocused,
    addLog,
    setPendingCommand,
    setInputFocused,
  } = useGameState();
  const [expanded, toggleExpanded] = useToggle(false);
  const [message, setMessage] = useState('');
  const [showChatHistory, setShowChatHistory] = useState(true);

  // 系统日志：用于文明记录窗口
  const systemLogs = useMemo(
    () => logs.filter((l) => l.type === 'system'),
    [logs]
  );

  // 对话框：只显示 chat 类型消息
  const chatLogs = useMemo(
    () => logs.filter((l) => l.type === 'chat'),
    [logs]
  );

  // 根据聚焦状态决定显示数量：聚焦时显示所有，失焦时显示最近3条
  const displayedChatLogs = useMemo(
    () => inputFocused ? chatLogs : chatLogs.slice(-3),
    [chatLogs, inputFocused]
  );

  // 自动隐藏机制：失焦5秒后隐藏对话历史，但有新消息时重新显示
  useEffect(() => {
    if (inputFocused) {
      // 聚焦时立即显示对话历史
      setShowChatHistory(true);
    } else {
      // 失焦时启动5秒倒计时
      const timer = setTimeout(() => {
        setShowChatHistory(false);
      }, 5000);

      // 清理函数：如果用户在5秒内再次聚焦，清除定时器
      return () => clearTimeout(timer);
    }
  }, [inputFocused]);

  // 关键修复：当有新的对话消息时，重新显示对话历史并重置5秒计时器
  const lastChatLog = useMemo(() => chatLogs[chatLogs.length - 1], [chatLogs]);
  
  useEffect(() => {
    if (lastChatLog && !inputFocused) {
      // 有新消息时，显示对话历史
      setShowChatHistory(true);
      
      // 启动新的5秒倒计时
      const timer = setTimeout(() => {
        setShowChatHistory(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [lastChatLog, inputFocused]);

  // 修复：ASKING状态也应该显示"正在交谈"，因为这是对话的一部分
  const placeholder =
    isNearAgent && (agentState === 'LISTENING' || agentState === 'ASKING')
      ? '正在与德米特里交谈...'
      : '喊话（距离过远）...';

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    
    // 验证 leaderName
    if (!leaderName || !leaderName.trim()) {
      console.error('[GameUI] leaderName is empty!');
      addLog('系统：领袖名称未设置，请重新启动游戏。', 'system');
      return;
    }
    
    console.log('[GameUI] Sending message:', text, 'Leader:', leaderName, 'isNearAgent:', isNearAgent, 'agentState:', agentState);
    
    // 立即记录玩家消息到对话日志
    addLog(`${leaderName}: ${text}`, 'chat');
    
    // 关键修复：立即清除焦点和状态，确保近场检测能立即恢复
    const inputElement = document.activeElement as HTMLInputElement;
    if (inputElement && inputElement.tagName === 'INPUT') {
      inputElement.blur();
    }
    setInputFocused(false);
    
    // 清空输入框
    setMessage('');
    
    // 最后触发游戏逻辑处理（此时焦点已清除，状态已稳定）
    setPendingCommand(text);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none">
      {/* 资源面板 - 左上 */}
      <div className="pointer-events-auto absolute top-4 left-4 px-4 py-3 bg-stone-300 border-2 border-stone-800 shadow-lg text-sm text-stone-900 font-serif">
        <div className="font-bold tracking-wide text-base mb-2">资源</div>
        <div className="mt-1 text-sm">🪵 木材：{wood}</div>
        <div className="mt-1 text-sm">🍎 食物：{food}</div>
      </div>

      {/* 日志窗口 - 右侧 */}
      <div
        className={`pointer-events-auto absolute top-4 right-4 w-80 border-2 border-stone-700 overflow-hidden transition-all shadow-lg font-serif ${
          expanded ? 'bg-stone-300' : 'bg-stone-200'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 text-sm border-b-2 border-stone-700">
          <span className="font-bold tracking-wide text-stone-900">文明记录 (Chronicles)</span>
          <button
            className="px-3 py-1 bg-[#8C6B3D] text-stone-100 hover:bg-[#B08D55] transition-colors font-semibold text-xs"
            onClick={toggleExpanded}
          >
            {expanded ? '收起' : '展开'}
          </button>
        </div>
        <div
          className={`px-4 pb-3 pt-2 space-y-1 ${expanded ? 'max-h-72 overflow-y-auto' : 'max-h-20'} scrollbar-classic`}
        >
          {(expanded ? systemLogs : systemLogs.slice(-3)).map((l, idx) => (
            <div
              key={`${l.id}-${idx}`}
              className="text-xs text-stone-700"
            >
              {l.text}
            </div>
          ))}
        </div>
      </div>

      {/* 对话面板 - 底部居中 */}
      <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 w-[720px] max-w-[92vw] font-serif">
        {/* 对话历史区：失焦5秒后自动隐藏，聚焦时显示所有对话并支持滚动 */}
        {showChatHistory && (
          <div className={`mb-2 ${inputFocused ? 'max-h-60' : 'max-h-28'} overflow-y-auto space-y-1 scrollbar-classic px-3 py-2 bg-[#D2B48C]/90 border-2 border-[#654321]`}>
            {displayedChatLogs.map((l, idx) => (
              <div
                key={`${l.id}-${idx}`}
                className="text-xs text-stone-900"
              >
                {l.text}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 bg-[#8C6B3D] border-2 border-[#654321] px-4 py-3 shadow-lg">
          <span className="text-lg text-[#F2EEE5]">
            {isNearAgent && agentState === 'LISTENING' ? (
              <EarIcon size={20} className="text-[#F2EEE5]" />
            ) : (
              '💬'
            )}
          </span>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            onFocus={() => {
              setInputFocused(true);
              setShowChatHistory(true); // 关键修复：立即显示对话历史
            }}
            onBlur={() => setInputFocused(false)}
            placeholder={placeholder}
            className={`flex-1 bg-[#E8DCC8] px-3 py-2 outline-none text-sm text-[#2B2B2B] placeholder:text-stone-700 font-medium`}
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-[#654321] hover:bg-[#B08D55] text-[#F2EEE5] text-sm font-semibold transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

