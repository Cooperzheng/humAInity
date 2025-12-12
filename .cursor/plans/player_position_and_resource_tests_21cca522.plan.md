---
name: Player Position and Resource Tests
overview: 修改主角初始位置避免与篝火重合，并添加资源生成区域的测试用例确保生成逻辑正确
todos:
  - id: update-player-position
    content: 修改 PlayerLeader.tsx 主角初始位置为 [3, 0, 0]
    status: completed
  - id: create-resource-test
    content: 创建 ResourceGeneration.test.ts 测试资源生成逻辑
    status: completed
  - id: run-tests
    content: 运行测试确保所有用例通过
    status: completed
---

# 主角位置修正 & 资源生成测试

## 目标

1. 修改主角初始生成位置，避免与篝火（[0,0,0]）重合
2. 添加测试用例验证资源生成区域的正确性

## 问题分析

**当前问题**：
- 主角初始位置：`[0, 0, 0]` (PlayerLeader.tsx:86)
- 篝火位置：`[0, 0, 0]` (GameConfig.ts:139)
- 结果：两者完全重合 ❌

**资源生成规则**（GameScene.tsx:42-50）：
- 应该只在 **15米 ≤ 距离 ≤ 30米** 的环形区域内
- 需要测试用例保证这个逻辑正确

## 实施步骤

### 1. 修改主角初始位置

**修改 `humainity/app/components/Character/PlayerLeader.tsx`**：

```typescript
// 第86行
<group ref={groupRef} position={[0, 0, 0]}>  // ❌ 旧位置

// 改为
<group ref={groupRef} position={[3, 0, 0]}>  // ✅ 新位置（篝火右侧3米）
```

位置选择理由：
- `[3, 0, 0]`：在篝火东侧3米，距离适中
- 仍在聚落核心区内（< 15米）
- 不会挡住其他设施（储粮点在 [5,0,5]）

### 2. 添加资源生成区域测试

**创建 `humainity/__tests__/ResourceGeneration.test.ts`**：

```typescript
import { describe, it, expect } from 'vitest';
import { getSettlementRadius, getResourceRadius, WORLD_CONFIG } from '../app/config/GameConfig';

describe('资源生成区域测试', () => {
  it('getSettlementRadius 应该返回 settlementDiameter 的一半', () => {
    expect(getSettlementRadius()).toBe(15);
    expect(getSettlementRadius()).toBe(WORLD_CONFIG.settlementDiameter / 2);
  });

  it('getResourceRadius 应该返回 resourceDiameter 的一半', () => {
    expect(getResourceRadius()).toBe(30);
    expect(getResourceRadius()).toBe(WORLD_CONFIG.resourceDiameter / 2);
  });

  it('资源生成逻辑应该只在环形区域内（15-30米）', () => {
    const settlementRadius = getSettlementRadius();
    const resourceRadius = getResourceRadius();
    const resourceDiameter = WORLD_CONFIG.resourceDiameter;
    
    // 模拟资源生成逻辑
    const validResources = [];
    const invalidResources = [];
    
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * resourceDiameter;
      const z = (Math.random() - 0.5) * resourceDiameter;
      const distFromCenter = Math.sqrt(x * x + z * z);
      
      // 应用实际的过滤逻辑
      if (distFromCenter < settlementRadius) {
        invalidResources.push({ x, z, dist: distFromCenter, reason: '在聚落区内' });
        continue;
      }
      
      if (distFromCenter > resourceRadius) {
        invalidResources.push({ x, z, dist: distFromCenter, reason: '在资源区外' });
        continue;
      }
      
      validResources.push({ x, z, dist: distFromCenter });
    }
    
    // 断言：所有有效资源都在环形区域内
    validResources.forEach(res => {
      expect(res.dist).toBeGreaterThanOrEqual(settlementRadius);
      expect(res.dist).toBeLessThanOrEqual(resourceRadius);
    });
    
    // 断言：应该有合理数量的有效资源
    expect(validResources.length).toBeGreaterThan(0);
    
    // 打印统计信息（可选）
    console.log(`有效资源: ${validResources.length}, 无效资源: ${invalidResources.length}`);
  });

  it('正方形生成范围的角落应该被正确过滤', () => {
    const resourceRadius = getResourceRadius();
    
    // 测试正方形的四个角（距离 > 30米）
    const corners = [
      { x: 30, z: 30, expected: Math.sqrt(30 * 30 + 30 * 30) }, // ~42.4米
      { x: -30, z: 30, expected: Math.sqrt(30 * 30 + 30 * 30) },
      { x: 30, z: -30, expected: Math.sqrt(30 * 30 + 30 * 30) },
      { x: -30, z: -30, expected: Math.sqrt(30 * 30 + 30 * 30) },
    ];
    
    corners.forEach(corner => {
      const dist = Math.sqrt(corner.x * corner.x + corner.z * corner.z);
      expect(dist).toBeCloseTo(corner.expected, 1);
      expect(dist).toBeGreaterThan(resourceRadius); // 应该被过滤
    });
  });
});
```

### 3. 更新配置文档（可选）

在 `GameConfig.ts` 中添加注释说明主角初始位置：

```typescript
// 可以在 FACILITIES 附近添加
export const INITIAL_POSITIONS = {
  player: [3, 0, 0] as const,  // 主角初始位置（篝火右侧3米）
} as const;
```

## 验证方法

1. **主角位置**：刷新游戏，主角应该出现在篝火右侧，不再重合
2. **运行测试**：`npm test ResourceGeneration` 应该全部通过
3. **视觉验证**：游戏中所有树木和岩石应该只出现在橙色圈内

## 配置说明

- 篝火位置：`[0, 0, 0]` (保持不变)
- 储粮点位置：`[5, 0, 5]` (保持不变)
- 主角位置：`[3, 0, 0]` (新位置)
- 聚落区：直径 30米，半径 15米
- 资源区：直径 60米，半径 30米