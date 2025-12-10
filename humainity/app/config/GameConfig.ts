'use client';

// 1. World/Map Configuration - 世界与地图配置
export const WORLD_CONFIG = {
  mapSize: 80,                    // 地图大小 (米)
  mapBoundary: 38,                // 地图边界 (米, ±38)
  groundThickness: 1,             // 地面厚度 (米)
  groundDepth: -0.5,              // 地面Y位置 (米)
  coreArea: 20,                   // 核心区大小 (米, 资源生成范围)
} as const;

// 2. Resource Configuration - 资源配置
export const RESOURCE_CONFIG = {
  initialResourceCount: 60,       // 初始资源数量
  treeSpawnProbability: 0.7,      // 树的生成概率 (0-1)
  treeRemovalDelay: 2000,         // 树木移除延迟 (毫秒)
  treeFallRotationSpeed: 0.05,    // 树木倒地旋转速度 (弧度/帧)
  treeFallCompleteDelay: 500,     // 倒地完成延迟 (毫秒)
  woodPerTree: 1,                 // 每棵树产出木材
} as const;

// 3. Character Movement - 角色移动配置
export const MOVEMENT_CONFIG = {
  playerSpeed: 0.05,              // 玩家移动速度 (米/帧)
  npcSpeed: 0.01,                 // NPC移动速度 (米/帧)
  movementThreshold: 0.0001,      // 移动判定阈值
  walkSwingSpeed: 4,              // 行走摆动速度
  walkSwingAmplitude: 0.24,       // 行走摆动幅度 (弧度)
} as const;

// 4. Interaction Configuration - 交互配置
export const INTERACTION_CONFIG = {
  interactionRange: 3,            // 近场交互距离 (米)
  arrivalThreshold: 0.15,         // 到达目标的距离阈值 (米)
  idleArrivalThreshold: 0.1,      // 闲逛到达阈值 (米)
  stateCheckDelay: 100,           // 状态检查延迟 (毫秒)
} as const;

// 5. Action Configuration - 动作配置
export const ACTION_CONFIG = {
  chopSwingSpeed: 6,              // 砍树挥动速度
  chopSwingAmplitude: 0.5,        // 砍树挥动幅度 (弧度)
  chopDuration: Math.PI * 8,      // 砍树持续时间 (约4秒)
  minChopQuantity: 1,             // 最小砍树数量
  maxChopQuantity: 20,            // 最大砍树数量
} as const;

// 6. NPC Behavior - NPC 行为配置
export const NPC_CONFIG = {
  initialPosition: [2, 0, 2] as const,  // NPC初始位置 [x, y, z]
  wanderIntervalMin: 3,           // 漫步间隔最小值 (秒)
  wanderIntervalMax: 5,           // 漫步间隔最大值 (秒，实际为 random*2+3)
  wanderRangeHalf: 8,             // 漫步范围的一半 (米, ±8)
} as const;

// 7. Response Delay - NPC 响应延迟配置（模拟真实对话）
export const RESPONSE_DELAY_CONFIG = {
  default: { min: 800, max: 1500 },           // 默认延迟 (毫秒)
  tooFar: { min: 800, max: 1400 },            // 距离过远提示延迟
  unsupportedCommand: { min: 1000, max: 1800 }, // 不支持指令延迟
  askQuantity: { min: 800, max: 1400 },       // 询问数量延迟
  clarify: { min: 1000, max: 2000 },          // 要求澄清延迟
  confirm: { min: 800, max: 1400 },           // 确认延迟
  actionStart: { min: 500, max: 800 },        // 开始行动延迟
} as const;

// 8. Camera Configuration - 相机配置
export const CAMERA_CONFIG = {
  position: [18, 22, 18] as const,  // 相机位置 [x, y, z]
  zoom: 14,                         // 缩放级别
  near: 0.1,                        // 近裁剪面 (米)
  far: 200,                         // 远裁剪面 (米)
} as const;

// 9. Environment Configuration - 环境配置
export const ENVIRONMENT_CONFIG = {
  mountain: {
    peakCountMin: 3,                // 山峰数量最小值
    peakCountMax: 6,                // 山峰数量最大值 (random*3+3)
    peakOffsetRange: 6,             // 山峰位置偏移范围 (米)
    heightMin: 3,                   // 山峰高度最小值 (米)
    heightMax: 7,                   // 山峰高度最大值 (米, random*4+3)
    radiusMin: 1.5,                 // 山峰半径最小值 (米)
    radiusMax: 3.5,                 // 山峰半径最大值 (米, random*2+1.5)
    grayscaleMin: 100,              // 灰度最小值
    grayscaleMax: 140,              // 灰度最大值
  },
  water: {
    defaultSize: [8, 6] as const,   // 默认水体尺寸 [宽, 长] (米)
  },
} as const;

// 辅助函数：生成随机延迟
export function getRandomDelay(config: { min: number; max: number }): number {
  return Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
}

// 辅助函数：生成随机漫步间隔
export function getWanderInterval(): number {
  return Math.random() * (NPC_CONFIG.wanderIntervalMax - NPC_CONFIG.wanderIntervalMin) + NPC_CONFIG.wanderIntervalMin;
}

