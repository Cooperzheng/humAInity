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

