'use client';

import { useMemo, useState, useEffect } from 'react';
import { useGameState } from './GameState';
import { EarIcon } from '../Icons/EarIcon';
import { MouseWheelIcon } from '../Icons/MouseWheelIcon';
import SoulInspector from '../Inspector/SoulInspector';

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
    inventory, // Genesis V0.2: 使用 inventory 系统
    logs,
    isNearAgent,
    inputFocused,
    addLog,
    setPendingCommand,
    setInputFocused,
    agents, // Genesis V0.2: 使用 agents 字典
  } = useGameState();
  
  // 获取 dmitri 的状态（兼容现有逻辑）
  const agentState = agents['dmitri']?.state || 'IDLE';
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

  // 动态占位符：简洁明了
  const placeholder = isNearAgent ? '与德米特里交谈...' : '输入消息...';

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
      {/* 资源面板 - 左上（HUD）：紧凑设计 (Genesis V0.2) */}
      <div className="pointer-events-auto absolute top-4 left-4 px-3 py-2 bg-stone-300 border-2 border-stone-800 shadow-lg text-sm text-stone-900 font-serif">
        <div className="font-bold tracking-wide text-base mb-1">资源</div>
        <div className="mt-1 text-sm">
          🪵 木材：<span className={inventory.wood === 0 ? 'text-red-600 font-bold' : ''}>{inventory.wood}</span>
        </div>
        <div className="mt-1 text-sm" title="基础食物 +10 饱食度">
          🫐 浆果：<span className={inventory.berry === 0 ? 'text-red-600 font-bold' : ''}>{inventory.berry}</span>
        </div>
        <div className="mt-1 text-sm" title="高级食物 +30 饱食度">
          🥩 生肉：<span className={inventory.meat === 0 ? 'text-red-600 font-bold' : ''}>{inventory.meat}</span>
        </div>
      </div>

      {/* 操作指引 - 左侧中间（智能隐藏：输入聚焦时隐藏，淡化存在感）*/}
      {!inputFocused && (
        <div className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 bg-black/20 px-3 py-2 rounded transition-opacity duration-300 font-serif">
          <div className="space-y-2 text-stone-300 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <kbd className="px-1.5 py-0.5 bg-stone-800/40 text-stone-200 border border-stone-600/30 rounded font-mono text-xs">W</kbd>
                <kbd className="px-1.5 py-0.5 bg-stone-800/40 text-stone-200 border border-stone-600/30 rounded font-mono text-xs">A</kbd>
                <kbd className="px-1.5 py-0.5 bg-stone-800/40 text-stone-200 border border-stone-600/30 rounded font-mono text-xs">S</kbd>
                <kbd className="px-1.5 py-0.5 bg-stone-800/40 text-stone-200 border border-stone-600/30 rounded font-mono text-xs">D</kbd>
              </div>
              <span>移动</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-stone-800/40 text-stone-200 border border-stone-600/30 rounded font-mono text-xs">Enter</kbd>
              <span>交谈</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-1.5 py-0.5 bg-stone-800/40 text-stone-200 border border-stone-600/30 rounded flex items-center justify-center">
                <MouseWheelIcon size={14} className="text-stone-200" />
              </div>
              <span>缩放视角</span>
            </div>
          </div>
        </div>
      )}

      {/* 日志窗口 - 右上（位置下移，为未来系统菜单预留空间）*/}
      <div
        className={`pointer-events-auto absolute top-12 right-4 w-80 border-2 border-stone-700 overflow-hidden transition-all shadow-lg font-serif ${
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

      {/* 对话面板 - 底部居中（灵动岛设计，紧凑版）*/}
      <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 w-80 max-w-[92vw] font-serif">
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
        
        {/* 灵动岛输入框：[状态指示器] [输入框] [发送按钮] */}
        <div className="flex items-stretch bg-[#8C6B3D] border-2 border-[#654321] shadow-lg overflow-hidden">
          {/* 状态指示器：灰色气泡 💬 / 金色耳朵 👂 + 呼吸动画 */}
          <div
            className={`w-12 h-12 flex items-center justify-center transition-all duration-300 ${
              isNearAgent && (agentState === 'LISTENING' || agentState === 'ASKING')
                ? 'bg-amber-500/30'
                : 'bg-stone-600/50'
            }`}
          >
            {isNearAgent && (agentState === 'LISTENING' || agentState === 'ASKING') ? (
              <EarIcon size={24} className="text-amber-400 animate-pulse" />
            ) : (
              <span className="text-xl">💬</span>
            )}
          </div>

          {/* 输入框 */}
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            onFocus={() => {
              setInputFocused(true);
              setShowChatHistory(true);
            }}
            onBlur={() => setInputFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-[#E8DCC8] px-3 py-2 outline-none text-sm text-[#2B2B2B] placeholder:text-stone-700 font-medium"
          />

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-[#654321] hover:bg-[#B08D55] text-[#F2EEE5] text-sm font-semibold transition-colors"
          >
            发送
          </button>
        </div>
      </div>

      {/* 灵魂透视镜 - 右侧滑出面板 (Genesis V0.2 Step 3) */}
      <SoulInspector />
    </div>
  );
}

