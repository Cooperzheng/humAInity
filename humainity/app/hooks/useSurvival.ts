'use client';

import { useEffect } from 'react';
import { useGameState } from '../components/Game/GameState';
import { SURVIVAL_RATES } from '../config/GameConfig';
import { AgentState } from '../types/Agent';

// 状态进入模板 (Genesis V0.2 Step 3)
const THOUGHT_TEMPLATES: Partial<Record<AgentState, { content: string; trigger: string; mood: string }>> = {
  STARVING: {
    content: '肚子好饿...储粮点还有吃的吗？我得去看看。',
    trigger: '饥饿触发',
    mood: 'anxious'
  },
  EXHAUSTED: {
    content: '身体实在撑不住了，需要休息一下。篝火那边应该能让我恢复精力。',
    trigger: '力竭触发',
    mood: 'fatigued'
  },
  EATING: {
    content: '终于有吃的了...这种饱腹感真好。',
    trigger: '进食开始',
    mood: 'relieved'
  },
  SLEEPING: {
    content: '火光很温暖...让我睡一会儿。',
    trigger: '睡眠开始',
    mood: 'peaceful'
  },
  IDLE: {
    content: '现在感觉还不错，等待领袖的下一个指示。',
    trigger: '恢复正常',
    mood: 'calm'
  },
  SEEKING_FOOD: {
    content: '必须赶快找到食物，不然真的要撑不住了。',
    trigger: '寻找食物',
    mood: 'urgent'
  },
  DELIVERING: {
    content: '把这些木材送回储粮点，这样大家都能用上。',
    trigger: '运送资源',
    mood: 'dutiful'
  },
};

/**
 * useSurvival - 生存系统心跳 (Genesis V0.2)
 * 
 * 核心职责：
 * 1. 每秒遍历所有智能体
 * 2. 根据状态计算 satiety/energy 衰减
 * 3. 检测阈值触发 P1 生存状态（STARVING/EXHAUSTED）
 * 
 * HISMA 优先级系统：
 * - P1 (Survival): 生存本能 - 最高优先级
 * - P2 (Social): 社会交互
 * - P3 (Mission): 日常使命
 */
export function useSurvival() {
  const { agents, updateAgent } = useGameState();
  
  useEffect(() => {
    const timer = setInterval(() => {
      Object.values(agents).forEach(agent => {
        const { id, state, stats } = agent;
        
        // 跳过已经在 P1 状态处理中的智能体
        if (['SEEKING_FOOD', 'EATING'].includes(state)) {
          return;
        }
        
        // 计算消耗率
        const isWorking = ['WORKING', 'DELIVERING', 'MOVING', 'ACTING'].includes(state);
        const hungerRate = isWorking ? SURVIVAL_RATES.hungerWork : SURVIVAL_RATES.hungerIdle;
        
        // 睡眠状态下恢复精力，否则消耗
        let energyChange: number;
        if (state === 'SLEEPING') {
          energyChange = -SURVIVAL_RATES.recoverySleep; // 负数表示恢复
        } else {
          energyChange = isWorking ? SURVIVAL_RATES.energyWork : SURVIVAL_RATES.energyIdle;
        }
        
        // 更新数值
        let newSatiety = Math.max(0, stats.satiety - hungerRate);
        let newEnergy = Math.max(0, Math.min(100, stats.energy - energyChange));
        
        // P1 优先级检测 - 生存本能强制抢占
        let newState = state;
        
        // 饥饿检测
        if (newSatiety < SURVIVAL_RATES.starveThreshold && !['STARVING', 'SEEKING_FOOD', 'EATING'].includes(state)) {
          newState = 'STARVING';
          console.log(`[useSurvival] Agent ${id} triggered STARVING (satiety: ${newSatiety.toFixed(1)})`);
        }
        
        // 力竭检测
        if (newEnergy < SURVIVAL_RATES.exhaustThreshold && !['EXHAUSTED', 'SLEEPING'].includes(state)) {
          newState = 'EXHAUSTED';
          console.log(`[useSurvival] Agent ${id} triggered EXHAUSTED (energy: ${newEnergy.toFixed(1)})`);
        }
        
        // 睡眠恢复检测 - 当精力超过 50 时自动退出睡眠
        if (state === 'SLEEPING' && newEnergy >= 50) {
          newState = 'IDLE';
          console.log(`[useSurvival] Agent ${id} woke up (energy: ${newEnergy.toFixed(1)})`);
        }
        
        // 仅当数值或状态发生变化时才更新
        const hasChanges = 
          Math.abs(newSatiety - stats.satiety) > 0.01 || 
          Math.abs(newEnergy - stats.energy) > 0.01 || 
          newState !== state;
        
        if (hasChanges) {
          // Genesis V0.2 Step 3: 状态进入时写入 thoughtHistory
          let newThoughtHistory = agent.thoughtHistory;
          if (newState !== state && THOUGHT_TEMPLATES[newState]) {
            const template = THOUGHT_TEMPLATES[newState]!;
            const newThought = {
              tick: Date.now(),
              content: template.content,
              trigger: template.trigger,
              mood: template.mood,
            };
            // 将新想法放在数组开头（最新在 index 0）
            newThoughtHistory = [newThought, ...agent.thoughtHistory].slice(0, 20); // 保留最近 20 条
          }

          updateAgent(id, {
            stats: { ...stats, satiety: newSatiety, energy: newEnergy },
            state: newState,
            thoughtHistory: newThoughtHistory,
          });
        }
      });
    }, 1000); // 每秒执行一次
    
    return () => clearInterval(timer);
  }, [agents, updateAgent]);
}

