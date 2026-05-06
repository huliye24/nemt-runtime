/**
 * NEMT Platform - Alert Types
 * 报警和通知相关类型定义
 */

/**
 * 告警级别
 */
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * 告警类型
 */
export type AlertType = 
  | 'system'        // 系统告警
  | 'trading'       // 交易告警
  | 'risk'          // 风险告警
  | 'performance'   // 绩效告警
  | 'strategy'      // 策略告警
  | 'container'     // 容器告警
  | 'data'          // 数据告警
  | 'execution'     // 执行告警
  | 'security';     // 安全告警

/**
 * 告警状态
 */
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'escalated' | 'snoozed';

/**
 * 告警通道
 */
export type AlertChannel = 'in_app' | 'email' | 'sms' | 'push' | 'webhook' | 'discord' | 'telegram';

/**
 * 告警条件操作符
 */
export type AlertOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'crosses_above' | 'crosses_below';

/**
 * 告警基础信息
 */
export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  
  // 内容
  title: string;
  message: string;
  details?: Record<string, unknown>;
  
  // 来源
  source: string;
  sourceId?: string;
  
  // 触发条件
  condition?: AlertCondition;
  triggeredValue?: number;
  threshold?: number;
  
  // 时间
  createdAt: number;
  triggeredAt: number;
  acknowledgedAt?: number;
  resolvedAt?: number;
  snoozedUntil?: number;
  
  // 处理信息
  acknowledgedBy?: string;
  resolvedBy?: string;
  resolution?: string;
  
  // 通知
  notifiedChannels: AlertChannel[];
  notificationSentAt?: Record<AlertChannel, number>;
  
  // 关联
  relatedAlerts?: string[];
  linkedEntity?: {
    type: 'strategy' | 'portfolio' | 'container' | 'order' | 'position';
    id: string;
  };
  
  // 元数据
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * 告警条件
 */
export interface AlertCondition {
  metric: string;
  operator: AlertOperator;
  value: number;
  duration?: number; // 持续时间（秒），条件需要满足多长时间才触发
}

/**
 * 告警规则
 */
export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  type: AlertType;
  severity: AlertSeverity;
  
  // 条件
  conditions: AlertCondition[];
  conditionLogic: 'and' | 'or';
  
  // 通知
  channels: AlertChannel[];
  recipients?: string[];
  webhookUrl?: string;
  
  // 控制
  enabled: boolean;
  cooldown: number; // 告警间隔（秒）
  autoResolve: boolean;
  autoResolveAfter?: number; // 自动关闭时间（秒）
  
  // 权限
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 告警统计
 */
export interface AlertStats {
  total: number;
  bySeverity: Record<AlertSeverity, number>;
  byStatus: Record<AlertStatus, number>;
  byType: Record<AlertType, number>;
  unacknowledged: number;
  averageResolutionTime: number;
  resolutionRate: number;
  topTriggers: AlertTriggerCount[];
}

export interface AlertTriggerCount {
  ruleId: string;
  ruleName: string;
  count: number;
}

/**
 * 告警历史记录
 */
export interface AlertHistory {
  alerts: Alert[];
  stats: AlertStats;
  page: number;
  pageSize: number;
  total: number;
}

/**
 * 告警过滤条件
 */
export interface AlertFilter {
  types?: AlertType[];
  severities?: AlertSeverity[];
  statuses?: AlertStatus[];
  channels?: AlertChannel[];
  startDate?: number;
  endDate?: number;
  search?: string;
  sourceIds?: string[];
}

/**
 * 告警批量操作
 */
export interface AlertBatchOperation {
  action: 'acknowledge' | 'resolve' | 'snooze' | 'delete';
  alertIds: string[];
  reason?: string;
  snoozeDuration?: number;
}

/**
 * 告警模板
 */
export interface AlertTemplate {
  id: string;
  name: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  channels: AlertChannel[];
  defaultThreshold: number;
}

/**
 * 预定义告警模板
 */
export const ALERT_TEMPLATES: AlertTemplate[] = [
  {
    id: 'strategy_loss',
    name: '策略亏损告警',
    type: 'strategy',
    severity: 'warning',
    title: '策略亏损超过阈值',
    message: '策略 {strategyName} 当前亏损 {lossPercent}%，已超过设置阈值 {threshold}%。',
    channels: ['in_app', 'email'],
    defaultThreshold: -10,
  },
  {
    id: 'strategy_error',
    name: '策略运行错误',
    type: 'strategy',
    severity: 'critical',
    title: '策略执行出错',
    message: '策略 {strategyName} 执行时发生错误：{errorMessage}',
    channels: ['in_app', 'email', 'push'],
    defaultThreshold: 1,
  },
  {
    id: 'risk_exceeded',
    name: '风险超限告警',
    type: 'risk',
    severity: 'critical',
    title: '风险敞口超过限制',
    message: '账户风险敞口 {riskValue} 超过限制 {threshold}，请及时处理。',
    channels: ['in_app', 'email', 'sms'],
    defaultThreshold: 100,
  },
  {
    id: 'drawdown_alert',
    name: '回撤超限告警',
    type: 'performance',
    severity: 'warning',
    title: '回撤超过阈值',
    message: '当前回撤 {drawdownPercent}% 超过设置阈值 {threshold}%，请关注。',
    channels: ['in_app', 'email'],
    defaultThreshold: 20,
  },
  {
    id: 'container_down',
    name: '容器宕机告警',
    type: 'container',
    severity: 'critical',
    title: '容器运行异常',
    message: '容器 {containerName} 状态异常，当前状态：{status}',
    channels: ['in_app', 'email', 'push'],
    defaultThreshold: 1,
  },
  {
    id: 'data_stale',
    name: '数据延迟告警',
    type: 'data',
    severity: 'warning',
    title: '市场数据延迟',
    message: '数据源 {sourceName} 数据延迟超过 {delay} 秒',
    channels: ['in_app'],
    defaultThreshold: 60,
  },
  {
    id: 'execution_failed',
    name: '订单执行失败',
    type: 'execution',
    severity: 'error',
    title: '订单执行失败',
    message: '订单 {orderId} 执行失败，原因：{reason}',
    channels: ['in_app', 'email'],
    defaultThreshold: 1,
  },
  {
    id: 'sharpe_low',
    name: '夏普比率过低',
    type: 'performance',
    severity: 'warning',
    title: '夏普比率低于阈值',
    message: '策略 {strategyName} 夏普比率 {sharpe} 低于阈值 {threshold}',
    channels: ['in_app', 'email'],
    defaultThreshold: 1,
  },
];

/**
 * 告警严重级别标签
 */
export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, { label: string; color: string; icon: string }> = {
  info: { label: '信息', color: '#3b82f6', icon: 'info' },
  warning: { label: '警告', color: '#f59e0b', icon: 'alert-triangle' },
  error: { label: '错误', color: '#ef4444', icon: 'alert-circle' },
  critical: { label: '严重', color: '#dc2626', icon: 'zap' },
};

/**
 * 告警类型标签
 */
export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  system: '系统告警',
  trading: '交易告警',
  risk: '风险告警',
  performance: '绩效告警',
  strategy: '策略告警',
  container: '容器告警',
  data: '数据告警',
  execution: '执行告警',
  security: '安全告警',
};

/**
 * 告警状态标签
 */
export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  active: '活跃',
  acknowledged: '已确认',
  resolved: '已解决',
  escalated: '已升级',
  snoozed: '已暂定',
};

/**
 * 告警通道标签
 */
export const ALERT_CHANNEL_LABELS: Record<AlertChannel, string> = {
  in_app: '应用内通知',
  email: '邮件',
  sms: '短信',
  push: '推送通知',
  webhook: 'Webhook',
  discord: 'Discord',
  telegram: 'Telegram',
};

/**
 * 操作符标签
 */
export const ALERT_OPERATOR_LABELS: Record<AlertOperator, string> = {
  gt: '大于',
  gte: '大于等于',
  lt: '小于',
  lte: '小于等于',
  eq: '等于',
  neq: '不等于',
  crosses_above: '上穿',
  crosses_below: '下穿',
};
