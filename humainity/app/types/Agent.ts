'use client';

/**
 * Agent Types - Genesis V0.2 多智能体系统
 * 
 * 核心理念：数值驱动肉体，AI 驱动灵魂
 * 架构：HISMA (Hierarchical Interaction-Survival-Mission Architecture)
 */

/**
 * AgentState - 智能体状态机 (三层优先级)
 * 
 * P1 (生存本能) > P2 (社会交互) > P3 (日常使命)
 * 高优先级状态会强制抢占低优先级状态
 */
export type AgentState = 
  // P3: Mission (日常使命) - 最低优先级
  | 'IDLE'        // 闲置
  | 'MOVING'      // 移动中
  | 'WORKING'     // 工作中
  | 'DELIVERING'  // 运送资源回库
  // P2: Social (社会交互) - 中优先级
  | 'LISTENING'   // 倾听玩家
  | 'THINKING'    // 思考中
  | 'ASKING'      // 询问玩家
  | 'CHATTING'    // 闲聊
  | 'PONDERING'   // 沉思
  // P1: Survival (生存本能) - 最高优先级
  | 'STARVING'    // 饥饿（饱食度 < 20）
  | 'SEEKING_FOOD'// 寻找食物
  | 'EATING'      // 进食中
  | 'SLEEPING'    // 睡觉（恢复精力）
  | 'EXHAUSTED';  // 力竭（精力 < 10）

/**
 * AgentProfile - 智能体档案 (双核模型)
 * 
 * 肉体 (The Vessel)：数值化的机械锚点
 * 灵魂 (The Soul)：叙事化的情感锚点
 */
export interface AgentProfile {
  // ========== 身份标识 (Identity) ==========
  id: string;      // 唯一标识符，e.g., "dmitri"
  name: string;    // 显示名称，e.g., "Dmitri"
  
  // ========== 动态分工系统 ==========
  /**
   * primaryRole: 长期身份/擅长领域 (Static)
   * 决定智能体的基础能力倾向和性格基调
   */
  primaryRole: 'worker' | 'hunter' | 'scholar';
  
  /**
   * currentAssignment: 当前具体职责 (Dynamic)
   * 由 AI 根据领袖愿景和环境需求自主切换
   * 例如："Lumberjack", "Builder", "Guard"
   */
  currentAssignment: string;
  
  // ========== 肉体 (The Vessel) - 机械锚点 ==========
  /**
   * stats: 生存数值 (0-100)
   * 由 useSurvivalSystem 每秒计算衰减/恢复
   */
  stats: {
    satiety: number;  // 饱食度 (影响健康，<20 触发饥饿)
    energy: number;   // 精力值 (影响效率，<10 触发力竭)
    health: number;   // 健康度 (归零死亡)
  };
  
  /**
   * capTraits: 能力特质 (Capability Traits)
   * 影响物理交互和工作效率
   * 例如：['Strong', 'QuickWalker', 'NightVision']
   */
  capTraits: string[];
  
  // ========== 灵魂 (The Soul) - 叙事锚点 ==========
  /**
   * psychTraits: 心理特质 (Psychological Traits)
   * 影响 AI 生成的对话风格和决策倾向
   * 例如：['Pessimistic', 'Loyal', 'Curious', 'Cautious']
   */
  psychTraits: string[];
  
  /**
   * state: 状态机当前状态
   * 由 HISMA 仲裁逻辑自动管理
   */
  state: AgentState;
  
  /**
   * thoughtHistory: 心路历程 (Thought Chronicle) - 核心叙事资产
   * 记录智能体的内心独白和重要情绪节点
   * 用于生成 LLM 上下文和玩家查看"灵魂透视镜"
   */
  thoughtHistory: Array<{
    tick: number;      // 发生的游戏时刻 (GameTick)
    content: string;   // 独白内容 (LLM Generated)
    trigger: string;   // 触发原因，e.g., 'Starvation_Enter', 'Task_Complete'
    mood?: string;     // 当时情绪，e.g., 'anxious', 'relieved', 'proud'
  }>;
  
  /**
   * shortTermMemory: 短期记忆 (Short-term Memory) - 事实日志
   * 记录最近的环境事件和交互历史
   * 用于智能体的决策上下文（保留最近 10-20 条）
   */
  shortTermMemory: string[];
}

/**
 * AgentAction - 智能体动作定义（未来扩展）
 * 用于定义智能体的具体行为动作
 */
export interface AgentAction {
  type: 'chop' | 'gather' | 'build' | 'eat' | 'sleep' | 'talk';
  target?: { x: number; z: number };
  duration?: number;
  result?: unknown;
}

