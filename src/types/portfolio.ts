/**
 * NEMT Platform - Portfolio Types
 *
 * Types for the Portfolio Manager feature
 * Portfolio Manager automatically allocates capital to strategies based on their performance
 */

export type ScoringPeriod = '1d' | '7d' | '30d' | 'all';
export type AdjustmentFrequency = 'realtime' | 'hourly' | 'daily' | 'manual';
export type PortfolioStatus = 'draft' | 'active';

export interface ScoringWeights {
  return: number;        // 收益率权重
  sharpe: number;         // 夏普比率权重
  winRate: number;        // 胜率权重
  drawdown: number;       // 回撤控制权重
  stability: number;      // 稳定性权重
}

export interface ScoringConfig {
  period: ScoringPeriod;
  weights: ScoringWeights;
  decayFactor: number;   // 历史衰减因子 (新数据权重更高, 0-1)
}

export interface AllocationRules {
  minAllocation: number;  // 单策略最小比例 (%)
  maxAllocation: number; // 单策略最大比例 (%)
  stopLossPercent: number; // 亏损止损线 (%)
  minOnLoss: number;     // 亏损后最低保留比例 (%)
}

export interface PortfolioConfig {
  scoring: ScoringConfig;
  rules: AllocationRules;
  frequency: AdjustmentFrequency;
  scoringCode: string;   // 用户自定义的评分代码
}

export interface StrategyPerformance {
  strategyId: string;
  strategyName: string;
  returns: number;        // 收益率 %
  sharpeRatio: number;    // 夏普比率
  winRate: number;        // 胜率 0-1
  maxDrawdown: number;    // 最大回撤 %
  tradeCount: number;     // 交易次数
  volatility: number;     // 波动率
  consistency: number;   // 一致性 (收益曲线平滑度, 0-1)
  periodStart: Date;
  periodEnd: Date;
}

export interface AllocationResult {
  strategyId: string;
  strategyName: string;
  allocation: number;     // 分配金额
  percentage: number;     // 分配比例 %
  score: number;          // 本次评分
  previousAllocation: number;
  change: number;         // 与上次相比的变化
  reason: string;         // 调整原因
}

export interface PortfolioData {
  id: string;
  name: string;
  description: string;
  author: string;
  config: PortfolioConfig;
  status: PortfolioStatus;
  totalCapital: number;
  allocations: AllocationResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketPortfolio {
  id: string;
  name: string;
  author: string;
  description: string;
  price: number;
  rating: number;
  purchases: number;
  code: string;
  tags: string[];
  config: PortfolioConfig;
}

export interface PublishSettings {
  price: number;
  description: string;
  isPublicCode: boolean;
}

// 默认配置
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  return: 0.3,
  sharpe: 0.2,
  winRate: 0.2,
  drawdown: 0.2,
  stability: 0.1,
};

export const DEFAULT_ALLOCATION_RULES: AllocationRules = {
  minAllocation: 5,
  maxAllocation: 50,
  stopLossPercent: -20,
  minOnLoss: 0,
};

export const DEFAULT_PORTFOLIO_CONFIG: PortfolioConfig = {
  scoring: {
    period: '7d',
    weights: DEFAULT_SCORING_WEIGHTS,
    decayFactor: 0.8,
  },
  rules: DEFAULT_ALLOCATION_RULES,
  frequency: 'daily',
  scoringCode: `
// 自定义评分函数
// 输入: performance - 策略绩效数据
// 输出: score - 0-100 的评分
function calculateScore(performance) {
  // 基础评分 = 收益率 * 权重
  const returnScore = Math.max(0, performance.returns) * 0.3;
  
  // 风险调整评分 = 夏普比率 * 权重
  const riskScore = performance.sharpeRatio * 20 * 0.2;
  
  // 胜率评分
  const winRateScore = performance.winRate * 100 * 0.2;
  
  // 回撤评分 (回撤越小越好)
  const drawdownScore = Math.max(0, 50 - performance.maxDrawdown) * 0.2;
  
  // 一致性评分
  const stabilityScore = performance.consistency * 100 * 0.1;
  
  return returnScore + riskScore + winRateScore + drawdownScore + stabilityScore;
}
`,
};

export const SCORING_PERIOD_LABELS: Record<ScoringPeriod, string> = {
  '1d': '1 天',
  '7d': '7 天',
  '30d': '30 天',
  'all': '全部',
};

export const FREQUENCY_LABELS: Record<AdjustmentFrequency, string> = {
  'realtime': '实时调整',
  'hourly': '每小时调整',
  'daily': '每日调整',
  'manual': '手动触发',
};
