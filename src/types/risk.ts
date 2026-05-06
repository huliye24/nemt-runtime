/**
 * NEMT Platform - Risk Types
 * 风险管理相关类型定义
 */

/**
 * 风险级别
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

/**
 * 风险类型
 */
export type RiskType = 
  | 'market'         // 市场风险
  | 'liquidity'     // 流动性风险
  | 'credit'        // 信用风险
  | 'operational'   // 操作风险
  | 'leverage'      // 杠杆风险
  | 'concentration' // 集中度风险
  | 'volatility'   // 波动性风险
  | 'correlation'; // 相关性风险

/**
 * 风险评估
 */
export interface RiskAssessment {
  // 综合评分
  overallScore: number;       // 0-100
  level: RiskLevel;
  
  // 各维度评分
  dimensionScores: {
    market: number;
    liquidity: number;
    leverage: number;
    concentration: number;
    volatility: number;
  };
  
  // 风险敞口
  exposure: RiskExposure;
  
  // 限额使用
  limits: RiskLimitUsage;
  
  // 建议
  recommendations: RiskRecommendation[];
  
  // 评估时间
  assessedAt: number;
}

/**
 * 风险敞口
 */
export interface RiskExposure {
  // 整体
  totalExposure: number;      // 总敞口
  netExposure: number;       // 净敞口
  grossExposure: number;     // 总敞口（含杠杆）
  
  // 按资产类型
  byAsset: {
    type: 'crypto' | 'stock' | 'forex' | 'commodity' | 'bond';
    exposure: number;
    exposurePercent: number;
  }[];
  
  // 按交易对
  bySymbol: {
    symbol: string;
    side: 'long' | 'short' | 'both';
    exposure: number;
    exposurePercent: number;
  }[];
  
  // 按方向
  longExposure: number;
  shortExposure: number;
  netLongShort: number;      // 多空净敞口
  
  // 杠杆
  portfolioLeverage: number;
  effectiveLeverage: number;
}

/**
 * 风险限额
 */
export interface RiskLimit {
  id: string;
  name: string;
  type: RiskType;
  
  // 限额值
  limit: number;
  warningThreshold: number;  // 警告阈值
  criticalThreshold: number; // 危险阈值
  
  // 当前使用
  current: number;
  currentPercent: number;    // 使用率 %
  
  // 状态
  status: 'normal' | 'warning' | 'critical' | 'exceeded';
  
  // 时间
  resetPeriod?: 'daily' | 'weekly' | 'monthly';
  lastResetAt?: number;
}

/**
 * 限额使用情况
 */
export interface RiskLimitUsage {
  // 预定义限额
  limits: RiskLimit[];
  
  // 汇总
  totalLimits: number;
  totalUsed: number;
  totalUsagePercent: number;
  
  // 状态
  breachedLimits: string[];  // 超过的限额ID列表
  warningLimits: string[];   // 警告的限额ID列表
}

/**
 * VaR 计算结果
 */
export interface ValueAtRisk {
  // 参数
  confidenceLevel: number;   // 置信水平 (如 0.95, 0.99)
  holdingPeriod: number;     // 持有期 (天)
  
  // 结果
  var: number;              // VaR 金额
  varPercent: number;       // VaR 百分比
  cvar: number;             // CVaR/ES 金额
  cvarPercent: number;      // CVaR 百分比
  
  // 方法
  method: 'historical' | 'parametric' | 'monte_carlo';
  
  // 时间
  calculatedAt: number;
}

/**
 * 压力测试情景
 */
export interface StressTestScenario {
  id: string;
  name: string;
  description: string;
  
  // 市场变化
  marketChanges: {
    symbol?: string;
    priceChangePercent: number;
    volatilityChange?: number;
  }[];
  
  // 流动性变化
  liquidityChange?: number; // 流动性下降 %
  
  // 结果
  estimatedLoss: number;
  estimatedLossPercent: number;
  estimatedDrawdown: number;
  
  // 概率
  probability?: number;    // 历史概率
  
  // 类型
  type: 'historical' | 'hypothetical';
}

/**
 * 风险指标
 */
export interface RiskMetrics {
  // VaR & CVaR
  valueAtRisk: ValueAtRisk;
  conditionalVaR: number;
  
  // 波动率
  volatility: number;
  downsideVolatility: number;
  volatilityPercent: number;
  
  // 回撤
  maxDrawdown: number;
  maxDrawdownPercent: number;
  maxDrawdownDuration: number;
  currentDrawdown: number;
  currentDrawdownPercent: number;
  
  // 相关性
  correlationToMarket: number;
  correlationToBTC: number;
  portfolioCorrelation: number;
  
  // 集中度
  concentrationIndex: number; // 赫芬达尔指数
  largestPositionPercent: number;
  top5PositionsPercent: number;
  
  // 杠杆
  leverageRatio: number;
  marginUsage: number;
  marginLevel: number;      // 保证金水平
  
  // 流动性
  liquidityScore: number;   // 0-100
  averageDailyVolume: number;
  
  // 尾部风险
  tailRatio: number;
  gainToPainRatio: number;
  
  // 综合
  riskScore: number;        // 0-100
  riskLevel: RiskLevel;
}

/**
 * 风险警告
 */
export interface RiskWarning {
  id: string;
  
  // 类型
  type: RiskType;
  severity: RiskLevel;
  
  // 内容
  title: string;
  message: string;
  details?: Record<string, unknown>;
  
  // 数值
  threshold: number;
  actualValue: number;
  
  // 建议
  recommendations: string[];
  
  // 时间
  triggeredAt: number;
  acknowledgedAt?: number;
  resolvedAt?: number;
  resolvedBy?: string;
  resolution?: string;
  
  // 关联
  entityId?: string;
  entityType?: 'strategy' | 'portfolio' | 'account';
}

/**
 * 风险规则
 */
export interface RiskRule {
  id: string;
  name: string;
  description?: string;
  
  // 类型
  type: RiskType;
  
  // 条件
  condition: {
    metric: string;
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
    value: number;
  };
  
  // 操作
  action: RiskAction;
  actionParams?: Record<string, unknown>;
  
  // 状态
  enabled: boolean;
  priority: number;         // 优先级
  
  // 设置
  cooldown: number;         // 冷却时间 (秒)
  notifyOnTrigger: boolean;
  
  // 时间
  createdAt: number;
  updatedAt: number;
  lastTriggeredAt?: number;
}

export type RiskAction = 
  | 'notify'                // 通知
  | 'pause_strategy'        // 暂停策略
  | 'close_positions'       // 平仓
  | 'reduce_leverage'      // 降低杠杆
  | 'block_new_orders'    // 阻止新订单
  | 'switch_to_paper'     // 切换到模拟
  | 'emergency_stop';     // 紧急停止

/**
 * 风险报告
 */
export interface RiskReport {
  id: string;
  
  // 时间范围
  startDate: string;
  endDate: string;
  
  // 实体
  entityId: string;
  entityName: string;
  entityType: 'strategy' | 'portfolio' | 'account';
  
  // 数据
  assessment: RiskAssessment;
  metrics: RiskMetrics;
  exposure: RiskExposure;
  limits: RiskLimitUsage;
  warnings: RiskWarning[];
  
  // 压力测试
  stressTests: StressTestScenario[];
  
  // 历史对比
  historyComparison?: {
    previousPeriod: Partial<RiskMetrics>;
    change: Partial<RiskMetrics>;
    trend: 'improving' | 'stable' | 'worsening';
  };
  
  // 建议
  recommendations: RiskRecommendation[];
  
  // 生成信息
  generatedAt: number;
  version: string;
}

export interface RiskRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high';
  category: RiskType;
  
  title: string;
  description: string;
  
  // 预期效果
  expectedImprovement?: number;
  
  // 操作建议
  actions: {
    action: string;
    params?: Record<string, unknown>;
  }[];
  
  // 实施
  implemented: boolean;
  implementedAt?: number;
}

/**
 * 风险管理配置
 */
export interface RiskManagementConfig {
  // 全局限额
  globalLimits: {
    maxDrawdown: number;     // 最大回撤 %
    maxDailyLoss: number;    // 最大日亏损 %
    maxPositionSize: number; // 最大持仓 %
    maxLeverage: number;     // 最大杠杆
    maxOpenOrders: number;   // 最大挂单数
  };
  
  // 风控规则
  rules: RiskRule[];
  
  // 自动操作
  autoActions: {
    enabled: boolean;
    actions: RiskAction[];
    triggers: {
      drawdownThreshold: number;
      dailyLossThreshold: number;
    };
  };
  
  // 通知设置
  notifications: {
    enabled: boolean;
    channels: string[];
    levels: RiskLevel[];
  };
}

/**
 * 默认风险管理配置
 */
export const DEFAULT_RISK_CONFIG: RiskManagementConfig = {
  globalLimits: {
    maxDrawdown: 20,
    maxDailyLoss: 5,
    maxPositionSize: 30,
    maxLeverage: 3,
    maxOpenOrders: 10,
  },
  rules: [],
  autoActions: {
    enabled: true,
    actions: ['notify', 'pause_strategy'],
    triggers: {
      drawdownThreshold: 15,
      dailyLossThreshold: 3,
    },
  },
  notifications: {
    enabled: true,
    channels: ['in_app', 'email'],
    levels: ['high', 'extreme'],
  },
};

/**
 * 风险级别标签
 */
export const RISK_LEVEL_LABELS: Record<RiskLevel, { label: string; color: string; description: string }> = {
  low: { 
    label: '低风险', 
    color: '#22c55e',
    description: '风险敞口小，收益稳定'
  },
  medium: { 
    label: '中等风险', 
    color: '#f59e0b',
    description: '风险可控，收益适中'
  },
  high: { 
    label: '高风险', 
    color: '#ef4444',
    description: '风险较大，需密切关注'
  },
  extreme: { 
    label: '极高风险', 
    color: '#dc2626',
    description: '风险极高，建议立即处理'
  },
};

/**
 * 风险类型标签
 */
export const RISK_TYPE_LABELS: Record<RiskType, string> = {
  market: '市场风险',
  liquidity: '流动性风险',
  credit: '信用风险',
  operational: '操作风险',
  leverage: '杠杆风险',
  concentration: '集中度风险',
  volatility: '波动性风险',
  correlation: '相关性风险',
};

/**
 * 风险操作标签
 */
export const RISK_ACTION_LABELS: Record<RiskAction, string> = {
  notify: '发送通知',
  pause_strategy: '暂停策略',
  close_positions: '平仓',
  reduce_leverage: '降低杠杆',
  block_new_orders: '阻止新订单',
  switch_to_paper: '切换模拟交易',
  emergency_stop: '紧急停止',
};
