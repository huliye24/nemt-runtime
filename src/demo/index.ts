/**
 * NEMT Platform - Demo Data Export
 * 统一导出所有 Demo 数据
 */

export * from './mockUsers';
export * from './mockMarketStrategies';
export * from './mockBacktestResults';
export * from './mockExecution';

// 导出总用户数统计
export const DEMO_STATS = {
  totalUsers: 25,
  totalStrategies: 12,
  totalSubscriptions: 23456,
  totalBacktests: 6,
  activePositions: 5,
  pendingOrders: 12,
};
