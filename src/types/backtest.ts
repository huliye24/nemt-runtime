/**
 * NEMT Platform - Backtest Types
 * 回测相关类型定义
 */

/**
 * 回测状态
 */
export type BacktestStatus = 
  | 'pending'       // 等待中
  | 'running'       // 运行中
  | 'completed'     // 已完成
  | 'failed'        // 失败
  | 'cancelled';    // 已取消

/**
 * 回测模式
 */
export type BacktestMode = 'classic' | 'intervals' | 'continuous';

/**
 * 回测精度
 */
export type BacktestResolution = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

/**
 * 回测结果汇总
 */
export interface BacktestSummary {
  id: string;
  strategyId: string;
  strategyName: string;
  
  // 状态
  status: BacktestStatus;
  progress: number;           // 0-100
  
  // 配置
  config: BacktestConfig;
  
  // 时间
  startedAt: number;
  completedAt?: number;
  duration?: number;          // 毫秒
  
  // 性能指标
  metrics: BacktestMetrics;
  
  // 统计
  stats: BacktestStats;
  
  // 对比
  benchmarkSymbol?: string;
  benchmarkMetrics?: Partial<BacktestMetrics>;
}

/**
 * 回测配置
 */
export interface BacktestConfig {
  // 交易对
  symbol: string;
  symbols?: string[];         // 多交易对
  
  // 时间范围
  startDate: string;          // YYYY-MM-DD
  endDate: string;            // YYYY-MM-DD
  
  // 初始资金
  initialCapital: number;
  currency: string;           // USDT, USD, BTC
  
  // 费用
  commission: number;         // 手续费率 (如 0.001 = 0.1%)
  slippage: number;           // 滑点率
  fundingRate?: number;       // 资金费率 (合约)
  
  // 保证金 (合约)
  marginMode?: 'isolated' | 'cross';
  leverage?: number;
  
  // 模式
  mode: BacktestMode;
  resolution: BacktestResolution;
  
  // 模式特定配置
  intervals?: {
    start: string;           // HH:mm
    end: string;
    weekdays?: number[];      // 0-6
  };
  
  // 数据源
  dataSource?: string;
  
  // 高级选项
  advanced?: {
    maxPositions?: number;
    maxOrdersPerDay?: number;
    allowDuplicateSignals?: boolean;
    signalCooldown?: number;   // 信号冷却时间 (秒)
  };
}

/**
 * 回测性能指标
 */
export interface BacktestMetrics {
  // 收益率
  totalReturn: number;        // 总收益率 %
  annualizedReturn: number;   // 年化收益率 %
  
  // 风险调整收益
  sharpeRatio: number;        // 夏普比率
  sortinoRatio: number;       // 索提诺比率
  calmarRatio: number;        // 卡玛比率
  informationRatio: number;   // 信息比率
  
  // 回撤
  maxDrawdown: number;        // 最大回撤 %
  maxDrawdownDuration: number; // 最大回撤天数
  maxDrawdownStart?: string;
  maxDrawdownEnd?: string;
  currentDrawdown: number;    // 当前回撤 %
  
  // 交易统计
  totalTrades: number;        // 总交易次数
  completedTrades: number;    // 完成交易
  winRate: number;            // 胜率
  profitFactor: number;       // 盈亏比
  
  // 盈亏统计
  grossProfit: number;        // 总盈利
  grossLoss: number;         // 总亏损
  netProfit: number;         // 净利润
  averageProfit: number;      // 平均盈利
  averageLoss: number;        // 平均亏损
  largestWin: number;         // 最大单笔盈利
  largestLoss: number;        // 最大单笔亏损
  expectancy: number;        // 期望值
  
  // 持仓
  averageHoldingTime: number; // 平均持仓时间 (秒)
  averageTradesPerDay: number; // 日均交易次数
  
  // 波动率
  volatility: number;         // 收益率波动率
  downsideDeviation: number; // 下行偏差
  
  // 基准对比
  alpha: number;              // Alpha
  beta: number;               // Beta
  rSquared: number;           // R²
  trackingError: number;      // 跟踪误差
  
  // 基准收益
  benchmarkReturn?: number;
}

/**
 * 回测统计
 */
export interface BacktestStats {
  // 数据点
  dataPoints: number;        // K线数量
  tradingDays: number;       // 交易日
  
  // 订单统计
  totalOrders: number;       // 总订单数
  filledOrders: number;      // 成交订单
  cancelledOrders: number;   // 取消订单
  rejectedOrders: number;    // 拒绝订单
  
  // 平均值
  averageTradeDuration: number;
  averageSlippage: number;
  averageCommission: number;
  
  // 最大/最小
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  maxPositionHeld: number;
  
  // 时间
  backtestStartDate: string;
  backtestEndDate: string;
  backtestDuration: number;   // 天数
  
  // 剩余
  remainingData?: number;
}

/**
 * 回测交易记录
 */
export interface BacktestTrade {
  id: string;
  backtestId: string;
  
  // 交易信息
  entryTime: string;
  exitTime?: string;
  side: 'long' | 'short';
  status: 'open' | 'closed';
  
  // 持仓
  symbol: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryValue: number;
  exitValue?: number;
  
  // 盈亏
  pnl: number;
  pnlPercent: number;
  commission: number;
  slippage: number;
  
  // 原因
  entryReason?: string;
  exitReason?: string;
  
  // 信号
  entrySignalId?: string;
  exitSignalId?: string;
  
  // 持仓时间
  holdingTime?: number;       // 秒
}

/**
 * 回测订单记录
 */
export interface BacktestOrder {
  id: string;
  backtestId: string;
  
  // 订单信息
  timestamp: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  
  // 价格与数量
  requestedPrice: number;
  requestedQuantity: number;
  filledPrice?: number;
  filledQuantity?: number;
  
  // 状态
  status: 'filled' | 'cancelled' | 'rejected' | 'expired';
  
  // 费用
  commission: number;
  slippage: number;
  slippagePercent: number;
  
  // 原因
  reason?: string;
}

/**
 * 回测权益曲线
 */
export interface BacktestEquityCurve {
  backtestId: string;
  points: EquityCurvePoint[];
  benchmarkPoints?: EquityCurvePoint[];
  
  // 统计数据
  peakValue: number;
  troughValue: number;
  peakDate?: string;
  troughDate?: string;
}

export interface EquityCurvePoint {
  timestamp: number;
  date: string;
  equity: number;
  cash: number;
  positionValue: number;
  benchmark?: number;
  drawdown?: number;
}

/**
 * 回测分布
 */
export interface BacktestDistribution {
  // 月度收益
  monthlyReturns: MonthlyReturn[];
  
  // 年化收益
  yearlyReturns: YearlyReturn[];
  
  // 交易分布
  tradeDistribution: TradeDistribution;
  
  // 持仓分布
  holdingDistribution: HoldingDistribution;
  
  // 盈亏分布
  pnlDistribution: PnlDistribution;
}

export interface MonthlyReturn {
  year: number;
  month: number;
  startValue: number;
  endValue: number;
  return: number;
  returnPercent: number;
  trades: number;
  wins: number;
  losses: number;
}

export interface YearlyReturn {
  year: number;
  startValue: number;
  endValue: number;
  return: number;
  returnPercent: number;
  trades: number;
  wins: number;
  losses: number;
}

export interface TradeDistribution {
  ranges: { range: string; count: number; percent: number }[];
}

export interface HoldingDistribution {
  ranges: { range: string; count: number; percent: number }[];
}

export interface PnlDistribution {
  ranges: { range: string; count: number; percent: number }[];
}

/**
 * 回测报告
 */
export interface BacktestReport {
  summary: BacktestSummary;
  equityCurve: BacktestEquityCurve;
  distribution: BacktestDistribution;
  
  // 详细数据
  trades: BacktestTrade[];
  orders: BacktestOrder[];
  
  // 日志
  logs: BacktestLog[];
  
  // 生成信息
  generatedAt: number;
  version: string;
}

export interface BacktestLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  context?: Record<string, unknown>;
}

/**
 * 回测对比
 */
export interface BacktestComparison {
  backtests: BacktestSummary[];
  metricsToCompare: (keyof BacktestMetrics)[];
  period: {
    start: string;
    end: string;
  };
  
  // 对比结果
  rankings: {
    backtestId: string;
    metrics: Record<string, number>;
    overallScore: number;
    rank: number;
  }[];
  
  // 统计
  statistics: {
    metric: string;
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
  }[];
}

/**
 * 回测状态标签
 */
export const BACKTEST_STATUS_LABELS: Record<BacktestStatus, { label: string; color: string }> = {
  pending: { label: '等待中', color: '#737373' },
  running: { label: '运行中', color: '#3b82f6' },
  completed: { label: '已完成', color: '#22c55e' },
  failed: { label: '失败', color: '#ef4444' },
  cancelled: { label: '已取消', color: '#f59e0b' },
};

/**
 * 回测模式标签
 */
export const BACKTEST_MODE_LABELS: Record<BacktestMode, string> = {
  classic: '经典模式',
  intervals: '分时段模式',
  continuous: '连续模式',
};

/**
 * 回测精度标签
 */
export const BACKTEST_RESOLUTION_LABELS: Record<BacktestResolution, string> = {
  '1m': '1 分钟',
  '5m': '5 分钟',
  '15m': '15 分钟',
  '1h': '1 小时',
  '4h': '4 小时',
  '1d': '1 日',
};

/**
 * 默认回测配置
 */
export const DEFAULT_BACKTEST_CONFIG: BacktestConfig = {
  symbol: 'BTCUSDT',
  startDate: '',
  endDate: '',
  initialCapital: 10000,
  currency: 'USDT',
  commission: 0.001,
  slippage: 0.0005,
  mode: 'continuous',
  resolution: '1h',
};
