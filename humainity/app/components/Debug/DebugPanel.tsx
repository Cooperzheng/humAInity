'use client';

import { useState, useEffect } from 'react';
import { useGameState } from '../Game/GameState';
import { AgentProfile } from '../../types/Agent';

/**
 * DebugPanel - GM 调试面板 (Genesis V0.2)
 * 
 * 功能：
 * - 按 P 键切换显示/隐藏（仅当 !inputFocused 时）
 * - 提供资源管理工具
 * - 提供智能体状态修改工具
 */
export default function DebugPanel() {
  const [visible, setVisible] = useState(false);
  const { inputFocused, inventory, addResource, modifyAllAgents, agents } = useGameState();
  
  // 监听 P 键切换显示
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'p' && !inputFocused) {
        setVisible(v => !v);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [inputFocused]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-24 right-4 bg-black/90 text-white p-4 rounded-lg shadow-2xl z-50 font-mono text-xs border-2 border-cyan-500">
      <div className="font-bold text-sm mb-3 text-cyan-400 border-b border-cyan-600 pb-2">
        🛠️ GM Mode [P to toggle]
      </div>
      
      {/* 当前库存状态 */}
      <div className="mb-3 p-2 bg-white/10 rounded">
        <div className="text-cyan-300 font-semibold mb-1">📦 Inventory:</div>
        <div className="text-white">🪵 Wood: {inventory.wood}</div>
        <div className="text-white">🫐 Berry: {inventory.berry}</div>
        <div className="text-white">🥩 Meat: {inventory.meat}</div>
      </div>
      
      {/* 智能体状态 */}
      <div className="mb-3 p-2 bg-white/10 rounded">
        <div className="text-cyan-300 font-semibold mb-1">🤖 Agents:</div>
        {Object.values(agents).map(agent => (
          <div key={agent.id} className="text-white mb-1">
            <div className="font-bold">{agent.name}</div>
            <div className="text-xs">
              State: <span className="text-yellow-300">{agent.state}</span>
            </div>
            <div className="text-xs">
              Satiety: <span className="text-green-300">{agent.stats.satiety.toFixed(1)}</span> | 
              Energy: <span className="text-blue-300">{agent.stats.energy.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* 资源操作按钮 */}
      <div className="space-y-1 mb-3">
        <div className="text-cyan-300 font-semibold mb-1">📦 Add Resources:</div>
        <button
          onClick={() => addResource('berry', 10)}
          className="w-full px-3 py-1.5 bg-green-700 hover:bg-green-600 transition-colors rounded text-white font-semibold"
        >
          + 10 Berry 🫐
        </button>
        <button
          onClick={() => addResource('meat', 5)}
          className="w-full px-3 py-1.5 bg-red-700 hover:bg-red-600 transition-colors rounded text-white font-semibold"
        >
          + 5 Meat 🥩
        </button>
        <button
          onClick={() => addResource('wood', 10)}
          className="w-full px-3 py-1.5 bg-amber-700 hover:bg-amber-600 transition-colors rounded text-white font-semibold"
        >
          + 10 Wood 🪵
        </button>
      </div>
      
      {/* 智能体操作按钮 */}
      <div className="space-y-1">
        <div className="text-cyan-300 font-semibold mb-1">🤖 Modify Agents:</div>
        <button
          onClick={() => modifyAllAgents((a: AgentProfile) => ({
            ...a,
            stats: { ...a.stats, satiety: Math.max(0, a.stats.satiety - 10) }
          }))}
          className="w-full px-3 py-1.5 bg-orange-700 hover:bg-orange-600 transition-colors rounded text-white font-semibold"
        >
          Starve All -10 🍽️
        </button>
        <button
          onClick={() => modifyAllAgents((a: AgentProfile) => ({
            ...a,
            stats: { ...a.stats, energy: Math.max(0, a.stats.energy - 10) }
          }))}
          className="w-full px-3 py-1.5 bg-purple-700 hover:bg-purple-600 transition-colors rounded text-white font-semibold"
        >
          Exhaust All -10 😴
        </button>
        <button
          onClick={() => modifyAllAgents((a: AgentProfile) => ({
            ...a,
            stats: { 
              satiety: 100,
              energy: 100,
              health: 100
            }
          }))}
          className="w-full px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 transition-colors rounded text-white font-semibold"
        >
          Restore All 💚
        </button>
      </div>
    </div>
  );
}

