import type { BacktestSummary } from './backtest';
import type { NotificationChannel } from './signal';
export * from './strategy/index';
/**
 * NEMT Runtime - Strategy Types
 * 策略相关类型定义
 */

/**
 * 策略状态
 */
export type StrategyStatus = 
  | 'draft'         // 草稿
  | 'ready'         // 就绪
  | 'running'       // 运行中
  | 'paused'        // 暂停
  | 'stopped'       // 已停止
  | 'archived'      // 已归档
  | 'error';        // 错误

/**
 * 策略类型
 */
export type StrategyType = 
  | 'trend_following'   // 趋势跟踪
  | 'mean_reversion'   // 均值回归
  | 'arbitrage'        // 套利
  | 'market_making'    // 做市
  | 'momentum'         // 动量
  | 'grid'            // 网格
  | 'dca'             // 定投
  | 'ai'              // AI 策略
  | 'custom';         // 自定义

/**
 * 策略交易模式
 */
export type TradingMode = 'spot' | 'futures' | 'both';

/**
 * 策略时间框架
 */
export type TimeFrame = 
  | '1m' | '5m' | '15m' | '30m'   // 分钟级
  | '1h' | '4h' | '6h' | '12h'     // 小时级
  | '1d' | '1w' | '1M';             // 日以上

/**
 * 策略风险管理级别
 */
export type RiskLevel = 'conservative' | 'moderate' | 'aggressive';

/**
 * 策略性能指标
 */
export interface StrategyMetrics {
  // 收益率
  totalReturn: number;          // 总收益率 %
  annualizedReturn: number;     // 年化收益率 %
  dayReturn: number;           // 日收益率 %
  weekReturn: number;          // 周收益率 %
  monthReturn: number;         // 月收益率 %
  
  // 风险调整收益
  sharpeRatio: number;         // 夏普比率
  sortinoRatio: number;        // 索提诺比率
  calmarRatio: number;         // 卡玛比率
  
  // 回撤
  maxDrawdown: number;        // 最大回撤 %
  maxDrawdownDuration: number; // 最大回撤持续时间
  currentDrawdown: number;     // 当前回撤 %
  
  // 交易统计
  totalTrades: number;        // 总交易次数
  winRate: number;            // 胜率
  profitFactor: number;        // 盈亏比
  averageWin: number;          // 平均盈利
  averageLoss: number;         // 平均亏损
  largestWin: number;         // 最大单笔盈利
  largestLoss: number;         // 最大单笔亏损
  expectancy: number;          // 期望值
  
  // 持仓
  averageHoldingTime: number;  // 平均持仓时间 (秒)
  averageTradesPerDay: number; // 日均交易次数
  
  // 波动率
  volatility: number;         // 波动率
  
  // 其他
  updatedAt: number;          // 最后更新时间
}

/**
 * 策略基础信息
 */
export interface Strategy {
  id: string;
  name: string;
  description: string;
  
  // 作者信息
  author: string;
  authorName?: string;
  authorAvatar?: string;
  
  // 版本
  version: string;
  versionHistory?: StrategyVersion[];
  
  // 状态
  status: StrategyStatus;
  statusMessage?: string;
  
  // 类型与分类
  type: StrategyType;
  tags: string[];
  tradingMode: TradingMode;
  timeFrames: TimeFrame[];
  
  // 代码与配置
  code?: string;              // 策略代码
  language: 'python' | 'javascript' | 'typescript' | 'go' | 'rust';
  config: StrategyConfig;
  
  // 性能
  metrics?: StrategyMetrics;
  backtestResults?: BacktestSummary[];
  
  // 设置
  riskLevel: RiskLevel;
  maxPositionSize: number;    // 最大持仓 %
  maxDrawdownLimit: number;   // 最大回撤限制 %
  
  // 权限
  isPublic: boolean;          // 是否公开
  isTemplate: boolean;        // 是否为模板
  allowCopy: boolean;         // 是否允许复制
  
  // 市场信息
  price?: number;             // 售价
  rating?: number;            // 评分
  subscribers?: number;       // 订阅数
  views?: number;             // 浏览数
  
  // 关联
  containerId?: string;
  portfolioId?: string;
  
  // 时间
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

/**
 * 策略版本历史
 */
export interface StrategyVersion {
  version: string;
  changelog: string;
  code: string;
  createdAt: number;
  createdBy: string;
}

/**
 * 策略配置
 */
export interface StrategyConfig {
  // 交易对
  symbols: string[];          // 交易对列表
  excludeSymbols?: string[];  // 排除的交易对
  
  // 信号
  signalSettings: SignalSettings;
  
  // 风控
  riskRules: RiskRule[];
  
  // 执行
  executionSettings: ExecutionSettings;
  
  // 通知
  notificationSettings: NotificationSettings;
  
  // 高级
  advancedSettings?: Record<string, unknown>;
}

export interface SignalSettings {
  // 指标参数
  indicators: IndicatorParam[];
  
  // 信号条件
  entryConditions?: string;
  exitConditions?: string;
  
  // 信号过滤
  minConfidence?: number;     // 最小置信度
  signalAggregation?: 'first' | 'majority' | 'all';
  
  // 信号限流
  maxSignalsPerMinute?: number;
  maxSignalsPerDay?: number;
}

export interface IndicatorParam {
  type: string;               // 指标类型
  params: Record<string, number>; // 指标参数
  source?: string;            // 数据源
}

export interface RiskRule {
  id: string;
  name: string;
  type: 'stop_loss' | 'take_profit' | 'position_limit' | 'daily_loss' | 'custom';
  enabled: boolean;
  params: Record<string, unknown>;
  action: 'close' | 'pause' | 'notify';
}

export interface ExecutionSettings {
  // 执行模式
  executionMode: 'live' | 'paper' | 'backtest';
  
  // 订单类型
  defaultOrderType: 'market' | 'limit';
  limitOrderOffset?: number;  // 限价单偏移 %
  
  // 滑点
  maxSlippage?: number;      // 最大滑点 %
  
  // 仓位
  positionSizing: PositionSizingMethod;
  
  // 执行时间
  tradingHours?: {
    enabled: boolean;
    startTime?: string;       // HH:mm
    endTime?: string;
    timezone?: string;
  };
  
  // 节假日
  excludeHolidays?: boolean;
}

export type PositionSizingMethod = 
  | 'fixed_quantity'    // 固定数量
  | 'fixed_value'       // 固定金额
  | 'percent_of_equity'  // 资金百分比
  | 'kelly_criterion'   // 凯利公式
  | 'volatility_based'; // 波动率调整

export interface NotificationSettings {
  enabled: boolean;
  channels: NotificationChannel[];
  
  // 通知类型
  notifyOn: {
    trade: boolean;
    signal: boolean;
    error: boolean;
    milestone: boolean;
    dailyReport: boolean;
  };
  
  // 阈值
  tradeThreshold?: number;
  pnlThreshold?: number;      // 盈亏阈值
}

/**
 * 旧版策略运行状态（兼容保留）
 */
export interface LegacyStrategyRuntime {
  strategyId: string;
  
  // 状态
  status: StrategyStatus;
  startedAt?: number;
  lastHeartbeat?: number;
  
  // 性能
  signalsGenerated: number;
  ordersPlaced: number;
  ordersFilled: number;
  
  // 当前持仓
  positions: RuntimePosition[];
  
  // 统计
  stats: {
    uptime: number;          // 运行时间 (秒)
    totalPnl: number;       // 总盈亏
    todayPnl: number;       // 今日盈亏
    signalsPerMinute: number;
    successRate: number;
  };
  
  // 错误
  errors: StrategyError[];
  
  // 容器信息
  containerId?: string;
  containerStats?: {
    cpu: number;
    memory: number;
    uptime: number;
  };
}

/**
 * 运行时持仓
 */
export interface RuntimePosition {
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  openedAt: number;
}

/**
 * 策略错误
 */
export interface StrategyError {
  id: string;
  timestamp: number;
  type: 'runtime' | 'signal' | 'execution' | 'data' | 'system';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  resolved: boolean;
  resolvedAt?: number;
}

/**
 * 策略草稿
 */
export interface StrategyDraft {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  code?: string;
  language: Strategy['language'];
  config?: Partial<StrategyConfig>;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
}

/**
 * 策略比较
 */
export interface StrategyComparison {
  strategies: Strategy[];
  metricsToCompare: (keyof StrategyMetrics)[];
  period: {
    start: number;
    end: number;
  };
  results: ComparisonResult[];
}

export interface ComparisonResult {
  strategyId: string;
  metrics: Partial<StrategyMetrics>;
  rankings: Record<string, number>; // 指标排名
  overallRank: number;
}

/**
 * 策略类型标签
 */
export const STRATEGY_TYPE_LABELS: Record<StrategyType, string> = {
  trend_following: '趋势跟踪',
  mean_reversion: '均值回归',
  arbitrage: '套利策略',
  market_making: '做市策略',
  momentum: '动量策略',
  grid: '网格策略',
  dca: '定投策略',
  ai: 'AI 策略',
  custom: '自定义策略',
};

/**
 * 策略状态标签
 */
export const STRATEGY_STATUS_LABELS: Record<StrategyStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: '#737373' },
  ready: { label: '就绪', color: '#22c55e' },
  running: { label: '运行中', color: '#3b82f6' },
  paused: { label: '已暂停', color: '#f59e0b' },
  stopped: { label: '已停止', color: '#6b7280' },
  archived: { label: '已归档', color: '#9ca3af' },
  error: { label: '错误', color: '#ef4444' },
};

/**
 * 风险等级标签
 */
export const RISK_LEVEL_LABELS: Record<RiskLevel, { label: string; color: string; description: string }> = {
  conservative: { 
    label: '保守', 
    color: '#22c55e',
    description: '低风险、低收益、严格风控'
  },
  moderate: { 
    label: '稳健', 
    color: '#3b82f6',
    description: '中等风险、平衡收益'
  },
  aggressive: { 
    label: '激进', 
    color: '#ef4444',
    description: '高风险、高收益、宽松风控'
  },
};

/**
 * 交易模式标签
 */
export const TRADING_MODE_LABELS: Record<TradingMode, string> = {
  spot: '现货交易',
  futures: '合约交易',
  both: '现货+合约',
};

/**
 * 仓位管理方法标签
 */
export const POSITION_SIZING_LABELS: Record<PositionSizingMethod, string> = {
  fixed_quantity: '固定数量',
  fixed_value: '固定金额',
  percent_of_equity: '资金百分比',
  kelly_criterion: '凯利公式',
  volatility_based: '波动率调整',
};

/**
 * 时间框架标签
 */
export const TIMEFRAME_LABELS: Record<TimeFrame, string> = {
  '1m': '1 分钟',
  '5m': '5 分钟',
  '15m': '15 分钟',
  '30m': '30 分钟',
  '1h': '1 小时',
  '4h': '4 小时',
  '6h': '6 小时',
  '12h': '12 小时',
  '1d': '1 日',
  '1w': '1 周',
  '1M': '1 月',
};
