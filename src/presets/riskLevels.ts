/**
 * NEMT Platform - Risk Level Presets
 * 风险等级预设
 */

// ============================================
// 风险等级定义
// ============================================

export type RiskLevel = 'conservative' | 'moderate' | 'aggressive' | 'speculative';

export interface RiskLevelConfig {
  level: RiskLevel;
  name: string;
  nameEn: string;
  description: string;
  
  // 风险参数
  params: {
    // 仓位
    maxPositionSize: number;       // 单个仓位最大占比 (%)
    maxTotalExposure: number;     // 总仓位上限 (%)
    maxLeverage: number;          // 最大杠杆
    
    // 回撤
    maxDrawdown: number;          // 最大回撤限制 (%)
    dailyLossLimit: number;        // 日亏损限制 (%)
    monthlyLossLimit: number;      // 月亏损限制 (%)
    
    // 交易
    maxDailyTrades: number;       // 日交易次数上限
    maxOpenOrders: number;         // 最大挂单数
    minTradeSize: number;         // 最小交易量
    maxTradeSize: number;         // 最大交易量
    
    // 止损
    defaultStopLoss: number;       // 默认止损 (%)
    defaultTakeProfit: number;     // 默认止盈 (%)
    trailingStop: boolean;         // 是否启用追踪止损
    
    // 合约
    allowShort: boolean;           // 允许做空
    allowCrossMargin: boolean;     // 允许全仓模式
    
    // 信号
    minSignalConfidence: number;   // 最小信号置信度 (%)
    signalCooldown: number;        // 信号冷却时间 (秒)
  };
  
  // 样式
  color: string;
  bgColor: string;
  borderColor: string;
}

// ============================================
// 风险等级配置
// ============================================

export const RiskLevelConfigs: Record<RiskLevel, RiskLevelConfig> = {
  conservative: {
    level: 'conservative',
    name: '保守型',
    nameEn: 'Conservative',
    description: '低风险、低收益、稳定优先',
    
    params: {
      maxPositionSize: 10,
      maxTotalExposure: 30,
      maxLeverage: 1,
      maxDrawdown: 5,
      dailyLossLimit: 2,
      monthlyLossLimit: 5,
      maxDailyTrades: 5,
      maxOpenOrders: 3,
      minTradeSize: 0.001,
      maxTradeSize: 0.1,
      defaultStopLoss: 1,
      defaultTakeProfit: 2,
      trailingStop: true,
      allowShort: false,
      allowCrossMargin: false,
      minSignalConfidence: 80,
      signalCooldown: 300,
    },
    
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  
  moderate: {
    level: 'moderate',
    name: '稳健型',
    nameEn: 'Moderate',
    description: '中等风险、平衡收益与风险',
    
    params: {
      maxPositionSize: 20,
      maxTotalExposure: 50,
      maxLeverage: 2,
      maxDrawdown: 10,
      dailyLossLimit: 5,
      monthlyLossLimit: 10,
      maxDailyTrades: 15,
      maxOpenOrders: 5,
      minTradeSize: 0.001,
      maxTradeSize: 0.2,
      defaultStopLoss: 2,
      defaultTakeProfit: 4,
      trailingStop: true,
      allowShort: true,
      allowCrossMargin: true,
      minSignalConfidence: 60,
      signalCooldown: 120,
    },
    
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  
  aggressive: {
    level: 'aggressive',
    name: '激进型',
    nameEn: 'Aggressive',
    description: '高风险、高收益、追求最大化回报',
    
    params: {
      maxPositionSize: 30,
      maxTotalExposure: 80,
      maxLeverage: 3,
      maxDrawdown: 20,
      dailyLossLimit: 10,
      monthlyLossLimit: 20,
      maxDailyTrades: 30,
      maxOpenOrders: 10,
      minTradeSize: 0.001,
      maxTradeSize: 0.5,
      defaultStopLoss: 3,
      defaultTakeProfit: 6,
      trailingStop: true,
      allowShort: true,
      allowCrossMargin: true,
      minSignalConfidence: 40,
      signalCooldown: 60,
    },
    
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  
  speculative: {
    level: 'speculative',
    name: '冒险型',
    nameEn: 'Speculative',
    description: '极高风险、追求超额收益',
    
    params: {
      maxPositionSize: 50,
      maxTotalExposure: 100,
      maxLeverage: 5,
      maxDrawdown: 30,
      dailyLossLimit: 15,
      monthlyLossLimit: 30,
      maxDailyTrades: 50,
      maxOpenOrders: 20,
      minTradeSize: 0.001,
      maxTradeSize: 1,
      defaultStopLoss: 5,
      defaultTakeProfit: 10,
      trailingStop: true,
      allowShort: true,
      allowCrossMargin: true,
      minSignalConfidence: 20,
      signalCooldown: 30,
    },
    
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
};

// ============================================
// 风险评估维度
// ============================================

export interface RiskDimension {
  name: string;
  nameEn: string;
  score: number;        // 0-100
  weight: number;       // 权重
  description: string;
}

export const RiskDimensions: RiskDimension[] = [
  {
    name: '波动率',
    nameEn: 'Volatility',
    score: 50,
    weight: 0.2,
    description: '资产价格的波动程度',
  },
  {
    name: '流动性',
    nameEn: 'Liquidity',
    score: 50,
    weight: 0.15,
    description: '资产变现的难易程度',
  },
  {
    name: '杠杆',
    nameEn: 'Leverage',
    score: 50,
    weight: 0.2,
    description: '使用的杠杆倍数',
  },
  {
    name: '相关性',
    nameEn: 'Correlation',
    score: 50,
    weight: 0.15,
    description: '与其他资产的相关性',
  },
  {
    name: '集中度',
    nameEn: 'Concentration',
    score: 50,
    weight: 0.15,
    description: '仓位集中的程度',
  },
  {
    name: '时间风险',
    nameEn: 'Time Risk',
    score: 50,
    weight: 0.15,
    description: '持仓时间带来的风险',
  },
];

// ============================================
// 风险评分
// ============================================

export interface RiskScore {
  total: number;           // 0-100
  level: RiskLevel;
  dimensions: {
    name: string;
    score: number;
    status: 'low' | 'medium' | 'high';
  }[];
  factors: {
    positive: string[];    // 降低风险的因素
    negative: string[];    // 增加风险的因素
  };
}

export const RiskScoreThresholds = {
  low: { min: 0, max: 25 },
  medium: { min: 25, max: 50 },
  high: { min: 50, max: 75 },
  extreme: { min: 75, max: 100 },
} as const;

// ============================================
// 止损止盈预设
// ============================================

export interface StopLossTakeProfitPreset {
  name: string;
  nameEn: string;
  stopLoss: number;       // 止损 %
  takeProfit: number;      // 止盈 %
  riskRewardRatio: number; // 风险回报比
  description: string;
}

export const StopLossTakeProfitPresets: StopLossTakeProfitPreset[] = [
  {
    name: '保守',
    nameEn: 'Conservative',
    stopLoss: 1,
    takeProfit: 2,
    riskRewardRatio: 2,
    description: '小止损、小止盈，胜率优先',
  },
  {
    name: '标准',
    nameEn: 'Standard',
    stopLoss: 2,
    takeProfit: 4,
    riskRewardRatio: 2,
    description: '平衡风险与收益',
  },
  {
    name: '趋势',
    nameEn: 'Trend Following',
    stopLoss: 3,
    takeProfit: 9,
    riskRewardRatio: 3,
    description: '宽止损、大止盈，趋势跟踪',
  },
  {
    name: '突破',
    nameEn: 'Breakout',
    stopLoss: 2,
    takeProfit: 6,
    riskRewardRatio: 3,
    description: '突破策略专用',
  },
  {
    name: '激进',
    nameEn: 'Aggressive',
    stopLoss: 5,
    takeProfit: 15,
    riskRewardRatio: 3,
    description: '宽止损、大止盈，高波动市场',
  },
  {
    name: '日内',
    nameEn: 'Day Trading',
    stopLoss: 0.5,
    takeProfit: 1,
    riskRewardRatio: 2,
    description: '日内交易专用，紧止损',
  },
];

// ============================================
// 资金管理预设
// ============================================

export interface PositionSizingPreset {
  name: string;
  nameEn: string;
  method: 'fixed' | 'percent' | 'kelly' | 'volatility';
  
  // 参数
  params: {
    fixedAmount?: number;         // 固定金额
    percentOfEquity?: number;     // 资金百分比
    kellyPercent?: number;        // 凯利百分比
    volatilityTarget?: number;     // 目标波动率 %
    maxPosition?: number;          // 最大仓位 %
  };
  
  description: string;
}

export const PositionSizingPresets: PositionSizingPreset[] = [
  {
    name: '固定金额',
    nameEn: 'Fixed Amount',
    method: 'fixed',
    params: {
      fixedAmount: 100,
    },
    description: '每次交易固定金额',
  },
  {
    name: '固定百分比',
    nameEn: 'Fixed Percent',
    method: 'percent',
    params: {
      percentOfEquity: 10,
    },
    description: '每次交易资金固定百分比',
  },
  {
    name: '凯利公式',
    nameEn: 'Kelly Criterion',
    method: 'kelly',
    params: {
      kellyPercent: 25,  // 使用 1/4 凯利
      maxPosition: 20,
    },
    description: '基于凯利公式计算仓位',
  },
  {
    name: '波动率调整',
    nameEn: 'Volatility Adjusted',
    method: 'volatility',
    params: {
      volatilityTarget: 2,  // 日波动目标 2%
      maxPosition: 30,
    },
    description: '根据波动率调整仓位',
  },
];

// ============================================
// 工具函数
// ============================================

/**
 * 获取风险等级配置
 */
export function getRiskLevelConfig(level: RiskLevel): RiskLevelConfig {
  return RiskLevelConfigs[level];
}

/**
 * 计算风险评分
 */
export function calculateRiskScore(
  volatility: number,
  liquidity: number,
  leverage: number,
  concentration: number,
  timeRisk: number
): RiskScore {
  // 加权计算
  const score = 
    volatility * 0.2 +
    liquidity * 0.15 +
    leverage * 0.2 +
    concentration * 0.15 +
    timeRisk * 0.15 +
    (100 - liquidity) * 0.15; // 流动性差增加风险
  
  // 确定等级
  let level: RiskLevel;
  if (score < 25) level = 'conservative';
  else if (score < 50) level = 'moderate';
  else if (score < 75) level = 'aggressive';
  else level = 'speculative';
  
  return {
    total: Math.round(score),
    level,
    dimensions: [
      { name: '波动率', score: volatility, status: getRiskStatus(volatility) },
      { name: '流动性', score: 100 - liquidity, status: getRiskStatus(100 - liquidity) },
      { name: '杠杆', score: leverage, status: getRiskStatus(leverage) },
      { name: '集中度', score: concentration, status: getRiskStatus(concentration) },
      { name: '时间风险', score: timeRisk, status: getRiskStatus(timeRisk) },
    ],
    factors: {
      positive: [],
      negative: [],
    },
  };
}

function getRiskStatus(score: number): 'low' | 'medium' | 'high' {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  return 'high';
}

/**
 * 获取风险等级颜色
 */
export function getRiskLevelColor(level: RiskLevel): string {
  return RiskLevelConfigs[level].color;
}

/**
 * 获取风险等级标签
 */
export function getRiskLevelLabel(level: RiskLevel): string {
  return RiskLevelConfigs[level].name;
}
