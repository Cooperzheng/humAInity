'use client';

import { useGameState } from '../Game/GameState';
import { AgentProfile } from '../../types/Agent';

// 根据 primaryRole 返回头像 emoji
function getRoleAvatar(role: AgentProfile['primaryRole']): string {
  switch (role) {
    case 'worker': return '👷';
    case 'hunter': return '🏹';
    case 'scholar': return '📚';
    default: return '👤';
  }
}

// 根据数值计算颜色（>50 绿色，20-50 橙色，<20 红色）
function getVitalColor(value: number): string {
  if (value > 50) return 'bg-green-600';
  if (value >= 20) return 'bg-orange-500';
  return 'bg-red-600';
}

// 根据数值计算文本颜色
function getVitalTextColor(value: number): string {
  if (value > 50) return 'text-green-700';
  if (value >= 20) return 'text-orange-600';
  return 'text-red-600';
}

export default function SoulInspector() {
  const { selectedAgentId, agents, deselectAgent } = useGameState();

  // 不显示：未选中或选中的 agent 不存在
  if (!selectedAgentId || !agents[selectedAgentId]) {
    return null;
  }

  const agent = agents[selectedAgentId];

  return (
    <div className="pointer-events-auto fixed inset-0 z-30 flex items-center justify-end">
      {/* 半透明遮罩层 */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={deselectAgent}
      />

      {/* 羊皮纸面板 - 右侧滑入 */}
      <div className="relative w-[600px] max-w-[90vw] h-full bg-[#F5E6D3] shadow-2xl animate-slide-in-right overflow-y-auto">
        {/* 关闭按钮 */}
        <button
          onClick={deselectAgent}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-stone-700 hover:bg-stone-600 text-stone-100 rounded transition-colors z-10"
          title="关闭"
        >
          ✕
        </button>

        {/* 标题区域 */}
        <div className="px-6 py-5 border-b-2 border-stone-400">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getRoleAvatar(agent.primaryRole)}</span>
            <div>
              <h2 className="text-2xl font-bold text-stone-900 font-serif">{agent.name}</h2>
              <div className="text-sm text-stone-600 mt-1">
                <span className="font-semibold text-stone-800">{agent.currentAssignment}</span>
                <span className="mx-2">·</span>
                <span className="text-xs">{agent.primaryRole}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 两栏布局 */}
        <div className="grid grid-cols-2 gap-4 p-6">
          {/* 左栏：The Vessel（肉体） */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-800 font-serif border-b border-stone-400 pb-2">
              肉体 (The Vessel)
            </h3>

            {/* 生存数值 */}
            <div className="space-y-3">
              {/* 饱食度 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-stone-700">饱食度 (Satiety)</span>
                  <span className={`font-bold ${getVitalTextColor(agent.stats.satiety)}`}>
                    {Math.round(agent.stats.satiety)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-300 rounded-full overflow-hidden border border-stone-400">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${getVitalColor(agent.stats.satiety)}`}
                    style={{ width: `${agent.stats.satiety}%` }}
                  />
                </div>
              </div>

              {/* 精力值 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-stone-700">精力值 (Energy)</span>
                  <span className={`font-bold ${getVitalTextColor(agent.stats.energy)}`}>
                    {Math.round(agent.stats.energy)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-300 rounded-full overflow-hidden border border-stone-400">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${getVitalColor(agent.stats.energy)}`}
                    style={{ width: `${agent.stats.energy}%` }}
                  />
                </div>
              </div>

              {/* 健康度 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-stone-700">健康度 (Health)</span>
                  <span className={`font-bold ${getVitalTextColor(agent.stats.health)}`}>
                    {Math.round(agent.stats.health)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-300 rounded-full overflow-hidden border border-stone-400">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${getVitalColor(agent.stats.health)}`}
                    style={{ width: `${agent.stats.health}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 特质 */}
            <div>
              <h4 className="text-sm font-semibold text-stone-700 mb-2">心理特质 (Psych)</h4>
              <div className="flex flex-wrap gap-1.5">
                {agent.psychTraits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs rounded border border-purple-300"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-stone-700 mb-2">能力特质 (Cap)</h4>
              <div className="flex flex-wrap gap-1.5">
                {agent.capTraits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-blue-200 text-blue-800 text-xs rounded border border-blue-300"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 右栏：The Soul（灵魂） */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-800 font-serif border-b border-stone-400 pb-2">
              灵魂 (The Soul)
            </h3>

            {/* 当前想法 */}
            <div>
              <h4 className="text-sm font-semibold text-stone-700 mb-2">当前想法</h4>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-stone-800 leading-relaxed min-h-[80px]">
                {agent.thoughtHistory[0]?.content || '（此刻内心平静...）'}
              </div>
            </div>

            {/* 历史想法 */}
            <div>
              <h4 className="text-sm font-semibold text-stone-700 mb-2">心路历程</h4>
              <div className="max-h-[400px] overflow-y-auto scrollbar-classic space-y-2">
                {agent.thoughtHistory.slice(1).length > 0 ? (
                  agent.thoughtHistory.slice(1).map((thought, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-stone-100 border border-stone-300 rounded text-xs text-stone-600"
                    >
                      <div className="font-medium text-stone-700 mb-1">
                        {thought.trigger}
                        {thought.mood && <span className="ml-2 text-stone-500">· {thought.mood}</span>}
                      </div>
                      <div className="leading-relaxed">{thought.content}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-stone-500 italic">
                    （还没有历史记录）
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
