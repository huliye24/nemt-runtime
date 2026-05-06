/**
 * NEMT Platform - Performance Types
 * 绩效分析相关类型定义
 */

/**
 * 绩效报告类型
 */
export type PerformanceReportType = 
  | 'daily'      // 日报
  | 'weekly'    // 周报
  | 'monthly'    // 月报
  | 'yearly'     // 年报
  | 'custom';   // 自定义

/**
 * 绩效周期
 */
export type PerformancePeriod = 
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | '90d'
  | '1y'
  | 'all';

/**
 * 绩效数据点
 */
export interface PerformanceDataPoint {
  timestamp: number;
  date: string;
  
  // 价值
  equity: number;
  cash: number;
  positionValue: number;
  
  // 收益率
  return: number;
  returnPercent: number;
  
  // 基准对比
  benchmark?: number;
  benchmarkReturn?: number;
  
  // 回撤
  drawdown: number;
  drawdownPercent: number;
  
  // 交易
  dailyTrades: number;
  dailyPnl: number;
  
  // 风险
  volatility?: number;
  var?: number; // Value at Risk
}

/**
 * 绩效汇总
 */
export interface PerformanceSummary {
  // 收益率
  totalReturn: number;        // 总收益率 %
  annualizedReturn: number;    // 年化收益率 %
  dayReturn: number;          // 日收益率 %
  weekReturn: number;         // 周收益率 %
  monthReturn: number;        // 月收益率 %
  yearReturn: number;         // 年收益率 %
  
  // 风险调整收益
  sharpeRatio: number;       // 夏普比率
  sortinoRatio: number;       // 索提诺比率
  calmarRatio: number;         // 卡玛比率
  informationRatio: number;   // 信息比率
  
  // 回撤
  maxDrawdown: number;        // 最大回撤 %
  maxDrawdownPercent: number;
  maxDrawdownDuration: number; // 最大回撤持续天数
  currentDrawdown: number;    // 当前回撤 %
  currentDrawdownDuration: number;
  
  // 交易统计
  totalTrades: number;        // 总交易次数
  winRate: number;           // 胜率
  profitFactor: number;       // 盈亏比
  averageWin: number;         // 平均盈利
  averageLoss: number;        // 平均亏损
  expectancy: number;         // 期望值
  
  // 波动率
  volatility: number;         // 波动率
  downsideDeviation: number; // 下行偏差
  
  // 基准对比
  alpha: number;              // Alpha
  beta: number;              // Beta
  correlation: number;       // 相关系数
  rSquared: number;         // R²
  trackingError: number;     // 跟踪误差
  
  // 其他
  bestDay: { date: string; return: number };
  worstDay: { date: string; return: number };
  bestMonth: { date: string; return: number };
  worstMonth: { date: string; return: number };
  
  // 统计
  tradingDays: number;
  winDays: number;
  lossDays: number;
  breakEvenDays: number;
  
  // 资金
  initialCapital: number;
  finalCapital: number;
}

/**
 * 月度绩效
 */
export interface MonthlyPerformance {
  year: number;
  month: number;
  monthLabel: string; // "2024-01"
  
  // 收益
  startValue: number;
  endValue: number;
  return: number;
  returnPercent: number;
  
  // 统计
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  
  // 风险
  maxDrawdown: number;
  volatility: number;
  
  // 对比
  benchmarkReturn?: number;
  alpha?: number;
  
  // 标记
  isBest?: boolean;
  isWorst?: boolean;
}

/**
 * 年度绩效
 */
export interface YearlyPerformance {
  year: number;
  
  // 收益
  startValue: number;
  endValue: number;
  return: number;
  returnPercent: number;
  
  // 统计
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  
  // 风险
  maxDrawdown: number;
  volatility: number;
  
  // 基准
  benchmarkReturn?: number;
  
  // 月度明细
  monthlyPerformance: MonthlyPerformance[];
}

/**
 * 绩效分解
 */
export interface PerformanceAttribution {
  // 总收益分解
  totalReturn: number;
  components: {
    // 交易收益
    tradingReturn: number;
    
    // 资金成本
    fundingCost: number;
    
    // 手续费
    commissionCost: number;
    
    // 其他
    otherReturn: number;
  };
  
  // 按交易对分解
  bySymbol: {
    symbol: string;
    return: number;
    returnPercent: number;
    trades: number;
    pnl: number;
  }[];
  
  // 按策略分解
  byStrategy: {
    strategyId: string;
    strategyName: string;
    return: number;
    returnPercent: number;
    trades: number;
    pnl: number;
  }[];
  
  // 按方向分解
  byDirection: {
    long: { return: number; pnl: number; trades: number };
    short: { return: number; pnl: number; trades: number };
  };
}

/**
 * 绩效统计
 */
export interface PerformanceStatistics {
  // 收益率统计
  returns: {
    mean: number;
    median: number;
    stdDev: number;
    skewness: number;   // 偏度
    kurtosis: number;   // 峰度
    min: number;
    max: number;
  };
  
  // 交易统计
  trades: {
    meanHoldingTime: number;
    medianHoldingTime: number;
    maxHoldingTime: number;
    minHoldingTime: number;
    
    averageWinPercent: number;
    averageLossPercent: number;
    largestWinPercent: number;
    largestLossPercent: number;
    
    maxConsecutiveWins: number;
    maxConsecutiveLosses: number;
  };
  
  // 风险统计
  risk: {
    volatility: number;
    downsideDeviation: number;
    valueAtRisk: number;      // VaR (95%)
    conditionalVaR: number;   // CVaR (95%)
    maxDrawdown: number;
    maxDrawdownDuration: number;
  };
  
  // 滚动统计
  rolling: {
    rollingSharpe: number[];
    rollingDrawdown: number[];
  };
}

/**
 * 绩效报告
 */
export interface PerformanceReport {
  id: string;
  
  // 基本信息
  reportType: PerformanceReportType;
  period: PerformancePeriod;
  startDate: string;
  endDate: string;
  
  // 对象信息
  entityType: 'strategy' | 'portfolio' | 'account';
  entityId: string;
  entityName: string;
  
  // 数据
  summary: PerformanceSummary;
  dataPoints: PerformanceDataPoint[];
  monthlyPerformance: MonthlyPerformance[];
  yearlyPerformance: YearlyPerformance[];
  attribution?: PerformanceAttribution;
  statistics?: PerformanceStatistics;
  
  // 对比基准
  benchmark?: {
    symbol: string;
    name: string;
    returns: number;
  };
  
  // 生成信息
  generatedAt: number;
  generatedBy: string;
  version: string;
}

/**
 * 绩效比较
 */
export interface PerformanceComparison {
  entities: {
    id: string;
    name: string;
    type: 'strategy' | 'portfolio';
  }[];
  
  period: {
    start: string;
    end: string;
  };
  
  metrics: {
    name: string;
    label: string;
    values: Record<string, number>;
    rankings: Record<string, number>;
  }[];
  
  rankings: {
    entityId: string;
    overallRank: number;
    scores: Record<string, number>;
  }[];
  
  // 可视化数据
  equityCurves: Record<string, PerformanceDataPoint[]>;
}

/**
 * 绩效告警
 */
export interface PerformanceAlert {
  id: string;
  entityId: string;
  entityName: string;
  
  alertType: 'drawdown_exceeded' | 'return_negative' | 'loss_exceeded' | 'volatility_high' | 'winrate_low';
  
  threshold: number;
  actual: number;
  
  triggeredAt: number;
  acknowledgedAt?: number;
  resolvedAt?: number;
}

/**
 * 绩效周期标签
 */
export const PERFORMANCE_PERIOD_LABELS: Record<PerformancePeriod, string> = {
  today: '今日',
  yesterday: '昨日',
  '7d': '最近 7 天',
  '30d': '最近 30 天',
  '90d': '最近 90 天',
  '1y': '最近 1 年',
  all: '全部时间',
};

/**
 * 绩效报告类型标签
 */
export const PERFORMANCE_REPORT_TYPE_LABELS: Record<PerformanceReportType, string> = {
  daily: '日报',
  weekly: '周报',
  monthly: '月报',
  yearly: '年报',
  custom: '自定义',
};

/**
 * 绩效告警类型标签
 */
export const PERFORMANCE_ALERT_LABELS: Record<PerformanceAlert['alertType'], string> = {
  drawdown_exceeded: '回撤超限',
  return_negative: '收益为负',
  loss_exceeded: '亏损超限',
  volatility_high: '波动率过高',
  winrate_low: '胜率过低',
};
