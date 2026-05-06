/**
 * NEMT Platform - Signal Types
 * 交易信号相关类型定义
 */

/**
 * 信号类型
 */
export type SignalType = 'entry' | 'exit' | 'adjust' | 'alert';

/**
 * 信号方向
 */
export type SignalDirection = 'long' | 'short' | 'close' | 'neutral';

/**
 * 信号状态
 */
export type SignalStatus = 'pending' | 'generated' | 'validated' | 'sent' | 'executed' | 'rejected' | 'expired' | 'cancelled';

/**
 * 信号来源
 */
export type SignalSource = 'strategy' | 'indicator' | 'manual' | 'ai' | 'copytrading';

/**
 * 信号优先级
 */
export type SignalPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * 信号置信度
 */
export interface SignalConfidence {
  score: number; // 0-100
  factors: ConfidenceFactor[];
  model?: string;
}

export interface ConfidenceFactor {
  name: string;
  contribution: number;
  description?: string;
}

/**
 * 信号基础信息
 */
export interface Signal {
  id: string;
  strategyId: string;
  strategyName: string;
  symbol: string;
  type: SignalType;
  direction: SignalDirection;
  status: SignalStatus;
  source: SignalSource;
  priority: SignalPriority;
  
  // 价格信息
  targetPrice?: number;
  stopPrice?: number;
  limitPrice?: number;
  currentPrice: number;
  
  // 数量信息
  quantity?: number;
  quantityPercent?: number; // 资金百分比
  
  // 置信度
  confidence: SignalConfidence;
  
  // 时间戳
  generatedAt: number;
  validatedAt?: number;
  sentAt?: number;
  executedAt?: number;
  expiredAt?: number;
  
  // 元数据
  reason?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  
  // 关联
  relatedSignals?: string[];
  parentSignalId?: string;
}

/**
 * 信号生成参数
 */
export interface SignalGenerationParams {
  strategyId: string;
  symbol: string;
  currentPrice: number;
  indicators: Record<string, number>;
  marketContext?: MarketContext;
}

export interface MarketContext {
  trend: 'bullish' | 'bearish' | 'sideways';
  volatility: 'low' | 'medium' | 'high';
  volume: 'low' | 'normal' | 'high';
  momentum?: number;
}

/**
 * 信号验证结果
 */
export interface SignalValidation {
  signalId: string;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  riskCheck: RiskCheckResult;
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  suggestion?: string;
}

export interface RiskCheckResult {
  passed: boolean;
  checks: RiskCheck[];
}

export interface RiskCheck {
  name: string;
  passed: boolean;
  value?: number;
  limit?: number;
  message?: string;
}

/**
 * 信号过滤器配置
 */
export interface SignalFilterConfig {
  minConfidence: number;
  allowedDirections: SignalDirection[];
  allowedTypes: SignalType[];
  excludeSymbols?: string[];
  onlySymbols?: string[];
  timeRange?: {
    start: number;
    end: number;
  };
}

/**
 * 信号统计
 */
export interface SignalStats {
  totalSignals: number;
  signalsByType: Record<SignalType, number>;
  signalsByDirection: Record<SignalDirection, number>;
  signalsByStatus: Record<SignalStatus, number>;
  averageConfidence: number;
  signalsPerDay: number;
  executionRate: number;
  averageExecutionTime: number;
}

/**
 * 信号历史记录
 */
export interface SignalHistory {
  signals: Signal[];
  stats: SignalStats;
  page: number;
  pageSize: number;
  total: number;
}

/**
 * 信号通知配置
 */
export interface SignalNotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  filters: SignalFilterConfig;
  grouping: 'none' | 'by_symbol' | 'by_strategy';
}

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push' | 'webhook' | 'discord' | 'telegram';

/**
 * 信号方向标签
 */
export const SIGNAL_DIRECTION_LABELS: Record<SignalDirection, string> = {
  long: '做多',
  short: '做空',
  close: '平仓',
  neutral: '中性',
};

/**
 * 信号类型标签
 */
export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  entry: '入场',
  exit: '出场',
  adjust: '调整',
  alert: '警报',
};

/**
 * 信号状态标签
 */
export const SIGNAL_STATUS_LABELS: Record<SignalStatus, string> = {
  pending: '等待中',
  generated: '已生成',
  validated: '已验证',
  sent: '已发送',
  executed: '已执行',
  rejected: '已拒绝',
  expired: '已过期',
  cancelled: '已取消',
};

/**
 * 信号来源标签
 */
export const SIGNAL_SOURCE_LABELS: Record<SignalSource, string> = {
  strategy: '策略',
  indicator: '指标',
  manual: '手动',
  ai: 'AI',
  copytrading: '跟单',
};

/**
 * 信号优先级标签
 */
export const SIGNAL_PRIORITY_LABELS: Record<SignalPriority, { label: string; color: string }> = {
  low: { label: '低', color: '#737373' },
  normal: { label: '普通', color: '#22c55e' },
  high: { label: '高', color: '#f59e0b' },
  urgent: { label: '紧急', color: '#ef4444' },
};
