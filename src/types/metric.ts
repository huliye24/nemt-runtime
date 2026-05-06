/**
 * NEMT Platform - Metric Types
 * 指标数据相关类型定义
 */

/**
 * 指标类型
 */
export type MetricType = 
  | 'performance'    // 绩效指标
  | 'risk'           // 风险指标
  | 'trading'         // 交易指标
  | 'portfolio'       // 组合指标
  | 'market'          // 市场指标
  | 'custom';         // 自定义指标

/**
 * 指标数据类型
 */
export type MetricValueType = 'number' | 'percent' | 'currency' | 'ratio' | 'duration' | 'count' | 'boolean';

/**
 * 指标聚合类型
 */
export type MetricAggregation = 'sum' | 'avg' | 'min' | 'max' | 'last' | 'count' | 'first';

/**
 * 指标数据点
 */
export interface MetricPoint {
  timestamp: number;
  value: number;
  metadata?: Record<string, unknown>;
}

/**
 * 时间序列指标
 */
export interface TimeSeriesMetric {
  id: string;
  name: string;
  type: MetricType;
  valueType: MetricValueType;
  unit?: string;
  points: MetricPoint[];
  startTime: number;
  endTime: number;
  granularity: number; // 毫秒
}

/**
 * 单值指标
 */
export interface ScalarMetric {
  id: string;
  name: string;
  type: MetricType;
  valueType: MetricValueType;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  timestamp: number;
  unit?: string;
  tags?: Record<string, string>;
}

/**
 * 聚合指标
 */
export interface AggregatedMetric {
  id: string;
  name: string;
  type: MetricType;
  valueType: MetricValueType;
  aggregation: MetricAggregation;
  value: number;
  count: number;
  min?: number;
  max?: number;
  avg?: number;
  sum?: number;
  startTime: number;
  endTime: number;
}

/**
 * 指标维度
 */
export interface MetricDimension {
  name: string;
  values: string[];
}

/**
 * 指标过滤器
 */
export interface MetricFilter {
  name: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
  value: string | number | string[] | number[];
}

/**
 * 指标查询参数
 */
export interface MetricQueryParams {
  names: string[];
  startTime: number;
  endTime: number;
  granularity?: number;
  aggregations?: MetricAggregation[];
  dimensions?: MetricDimension[];
  filters?: MetricFilter[];
  limit?: number;
  orderBy?: 'timestamp' | 'value';
  order?: 'asc' | 'desc';
}

/**
 * 指标查询结果
 */
export interface MetricQueryResult {
  metrics: (TimeSeriesMetric | ScalarMetric | AggregatedMetric)[];
  query: MetricQueryParams;
  executionTime: number;
  cached: boolean;
}

/**
 * 性能指标集
 */
export interface PerformanceMetrics {
  // 收益率
  totalReturn: number;
  annualizedReturn: number;
  dayReturn: number;
  weekReturn: number;
  monthReturn: number;
  yearReturn: number;
  
  // 风险调整收益
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  informationRatio: number;
  
  // 回撤
  maxDrawdown: number;
  maxDrawdownDuration: number; // 回撤持续时间
  currentDrawdown: number;
  
  // 胜率
  winRate: number;
  lossRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  
  // 盈亏
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  expectancy: number;
  
  // 持仓
  averageHoldingTime: number;
  averageTradesPerDay: number;
  
  // 波动率
  volatility: number;
  downsideDeviation: number;
  
  // 基准对比
  alpha: number;
  beta: number;
  rSquared: number;
  correlation: number;
  trackingError: number;
}

/**
 * 风险指标集
 */
export interface RiskMetrics {
  // VaR & CVaR
  valueAtRisk: number; // 日 VaR
  valueAtRiskPercent: number;
  conditionalVaR: number; // CVaR / ES
  conditionalVaRPercent: number;
  
  // 风险度量
  volatility: number;
  downsideVolatility: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  
  // 相关性
  correlationToMarket: number;
  correlationToBTC: number;
  
  // 集中度
  concentration: number; // 单一资产最大占比
  herfindahlIndex: number; // 赫芬达尔指数
  
  // 杠杆
  leverage: number;
  marginUsage: number;
  
  // 流动性
  liquidityScore: number; // 0-100
  
  // 压力测试
  stressScenarios: StressScenario[];
  
  // 综合评分
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
}

export interface StressScenario {
  name: string;
  change: number;
  estimatedLoss: number;
  probability: number;
}

/**
 * 交易指标集
 */
export interface TradingMetrics {
  // 订单统计
  totalOrders: number;
  filledOrders: number;
  cancelledOrders: number;
  rejectionRate: number;
  
  // 成交量
  totalVolume: number;
  buyVolume: number;
  sellVolume: number;
  averageOrderSize: number;
  
  // 执行质量
  averageSlippage: number;
  averageExecutionTime: number;
  bestExecutionPrice: number;
  worstExecutionPrice: number;
  
  // 费用
  totalCommission: number;
  makerCommission: number;
  takerCommission: number;
  estimatedCommission: number;
  
  // 延迟
  averageLatency: number;
  p99Latency: number;
  latencyBreakdown: LatencyBreakdown;
}

export interface LatencyBreakdown {
  signalGeneration: number;
  validation: number;
  routing: number;
  exchange: number;
  confirmation: number;
}

/**
 * 市场指标集
 */
export interface MarketMetrics {
  // 价格
  currentPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  priceChange: number;
  priceChangePercent: number;
  
  // 成交量
  volume24h: number;
  quoteVolume24h: number;
  volumeChange24h: number;
  
  // 订单簿
  bidDepth: number;
  askDepth: number;
  spread: number;
  spreadPercent: number;
  
  // 市场深度
  orderBookImbalance: number;
  largeOrderRatio: number;
  
  // 波动率
  historicalVolatility: number;
  impliedVolatility?: number;
  
  // 资金
  fundingRate?: number;
  openInterest?: number;
  longShortRatio?: number;
}

/**
 * 指标仪表盘配置
 */
export interface MetricDashboardConfig {
  id: string;
  name: string;
  metrics: string[];
  refreshInterval: number; // 秒
  layout: MetricDashboardLayout;
  filters?: MetricFilter[];
  comparison?: MetricComparison;
}

export interface MetricDashboardLayout {
  columns: number;
  rows: number;
  items: DashboardMetricItem[];
}

export interface DashboardMetricItem {
  metricId: string;
  gridArea: {
    row: number;
    column: number;
    rowSpan: number;
    columnSpan: number;
  };
  chartType?: 'line' | 'bar' | 'gauge' | 'number' | 'table';
}

export interface MetricComparison {
  enabled: boolean;
  type: 'period' | 'benchmark' | 'strategy';
  referenceId?: string;
}

/**
 * 指标告警配置
 */
export interface MetricAlertConfig {
  id: string;
  metricName: string;
  condition: 'above' | 'below' | 'crosses' | 'changes';
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  cooldown: number; // 秒
  lastTriggered?: number;
}

/**
 * 指标类型标签
 */
export const METRIC_TYPE_LABELS: Record<MetricType, string> = {
  performance: '绩效指标',
  risk: '风险指标',
  trading: '交易指标',
  portfolio: '组合指标',
  market: '市场指标',
  custom: '自定义指标',
};

/**
 * 指标值类型标签
 */
export const METRIC_VALUE_TYPE_LABELS: Record<MetricValueType, string> = {
  number: '数值',
  percent: '百分比',
  currency: '货币',
  ratio: '比率',
  duration: '时长',
  count: '计数',
  boolean: '布尔',
};

/**
 * 聚合类型标签
 */
export const METRIC_AGGREGATION_LABELS: Record<MetricAggregation, string> = {
  sum: '求和',
  avg: '平均值',
  min: '最小值',
  max: '最大值',
  last: '最新值',
  count: '计数',
  first: '起始值',
};
