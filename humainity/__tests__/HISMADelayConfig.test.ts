import { describe, it, expect } from 'vitest';
import { HISMA_DELAY_CONFIG } from '../app/config/GameConfig';

describe('HISMA 延迟配置测试 (Genesis V0.2 Step 3)', () => {
  it('HISMA_DELAY_CONFIG 应包含所有必需的延迟参数', () => {
    expect(HISMA_DELAY_CONFIG).toBeDefined();
    expect(HISMA_DELAY_CONFIG.eatingMs).toBeDefined();
    expect(HISMA_DELAY_CONFIG.deliveryUnloadMs).toBeDefined();
  });

  it('eatingMs 应为 2000 毫秒（2秒）', () => {
    expect(HISMA_DELAY_CONFIG.eatingMs).toBe(2000);
  });

  it('deliveryUnloadMs 应为 1500 毫秒（1.5秒）', () => {
    expect(HISMA_DELAY_CONFIG.deliveryUnloadMs).toBe(1500);
  });

  it('延迟值应为正数', () => {
    expect(HISMA_DELAY_CONFIG.eatingMs).toBeGreaterThan(0);
    expect(HISMA_DELAY_CONFIG.deliveryUnloadMs).toBeGreaterThan(0);
  });

  it('延迟值应合理（不超过10秒）', () => {
    expect(HISMA_DELAY_CONFIG.eatingMs).toBeLessThanOrEqual(10000);
    expect(HISMA_DELAY_CONFIG.deliveryUnloadMs).toBeLessThanOrEqual(10000);
  });

  it('eatingMs 应大于 deliveryUnloadMs（进食比卸货慢）', () => {
    expect(HISMA_DELAY_CONFIG.eatingMs).toBeGreaterThan(HISMA_DELAY_CONFIG.deliveryUnloadMs);
  });
});

