/**
 * NEMT Platform - Subscription Types
 * 用户订阅相关类型定义
 */

/**
 * 订阅计划类型
 */
export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';

/**
 * 订阅状态
 */
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due';

/**
 * 订阅周期
 */
export type SubscriptionPeriod = 'monthly' | 'yearly';

/**
 * 订阅限制
 */
export interface SubscriptionLimits {
  maxStrategies: number;
  maxStrategiesRunning: number;
  maxBacktestsPerDay: number;
  maxDataStorage: number; // MB
  maxApiCallsPerDay: number;
  maxPortfolios: number;
  maxContainers: number;
  maxTeamMembers: number;
  historicalDataDays: number;
  allowCloudSync: boolean;
  allowApiAccess: boolean;
  allowCustomDataSources: boolean;
}

/**
 * 订阅计划详情
 */
export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  description: string;
  price: number;
  period: SubscriptionPeriod;
  features: string[];
  limits: SubscriptionLimits;
  color: string;
}

/**
 * 用户订阅信息
 */
export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: number;
  expiryDate: number;
  trialEndDate?: number;
  cancelledAt?: number;
  autoRenew: boolean;
  paymentMethod?: string;
  lastPaymentDate?: number;
  nextPaymentDate?: number;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  usage: SubscriptionUsage;
  limits: SubscriptionLimits;
}

/**
 * 订阅使用量
 */
export interface SubscriptionUsage {
  strategies: number;
  runningStrategies: number;
  backtestsToday: number;
  dataStorage: number;
  apiCallsToday: number;
  portfolios: number;
  containers: number;
  teamMembers: number;
}

/**
 * 订阅变更记录
 */
export interface SubscriptionChange {
  id: string;
  subscriptionId: string;
  fromPlan: SubscriptionPlan;
  toPlan: SubscriptionPlan;
  effectiveDate: number;
  reason: string;
  processedAt?: number;
}

/**
 * 续订信息
 */
export interface RenewalInfo {
  willRenew: boolean;
  nextBillingDate: number;
  amount: number;
  paymentMethod: string;
}

/**
 * 退款记录
 */
export interface RefundRecord {
  id: string;
  subscriptionId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  processedAt?: number;
}

/**
 * 订阅计划常量
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanDetails> = {
  free: {
    id: 'free',
    name: '免费版',
    description: '适合个人学习和测试',
    price: 0,
    period: 'monthly',
    features: [
      '最多 3 个策略',
      '1 个运行中策略',
      '每日 10 次回测',
      '100MB 数据存储',
      '7 天历史数据',
      '社区支持',
    ],
    limits: {
      maxStrategies: 3,
      maxStrategiesRunning: 1,
      maxBacktestsPerDay: 10,
      maxDataStorage: 100,
      maxApiCallsPerDay: 100,
      maxPortfolios: 1,
      maxContainers: 1,
      maxTeamMembers: 1,
      historicalDataDays: 7,
      allowCloudSync: false,
      allowApiAccess: false,
      allowCustomDataSources: false,
    },
    color: '#737373',
  },
  basic: {
    id: 'basic',
    name: '基础版',
    description: '适合个人交易者',
    price: 99,
    period: 'monthly',
    features: [
      '最多 20 个策略',
      '5 个运行中策略',
      '每日 100 次回测',
      '1GB 数据存储',
      '90 天历史数据',
      '基础 API 访问',
      '邮件支持',
    ],
    limits: {
      maxStrategies: 20,
      maxStrategiesRunning: 5,
      maxBacktestsPerDay: 100,
      maxDataStorage: 1024,
      maxApiCallsPerDay: 10000,
      maxPortfolios: 5,
      maxContainers: 5,
      maxTeamMembers: 1,
      historicalDataDays: 90,
      allowCloudSync: true,
      allowApiAccess: true,
      allowCustomDataSources: false,
    },
    color: '#22c55e',
  },
  pro: {
    id: 'pro',
    name: '专业版',
    description: '适合专业交易者和小型团队',
    price: 299,
    period: 'monthly',
    features: [
      '无限策略数量',
      '20 个运行中策略',
      '每日 500 次回测',
      '10GB 数据存储',
      '1 年历史数据',
      '完整 API 访问',
      '自定义数据源',
      '云端同步',
      '优先邮件支持',
    ],
    limits: {
      maxStrategies: -1,
      maxStrategiesRunning: 20,
      maxBacktestsPerDay: 500,
      maxDataStorage: 10240,
      maxApiCallsPerDay: 100000,
      maxPortfolios: 20,
      maxContainers: 20,
      maxTeamMembers: 5,
      historicalDataDays: 365,
      allowCloudSync: true,
      allowApiAccess: true,
      allowCustomDataSources: true,
    },
    color: '#c084fc',
  },
  enterprise: {
    id: 'enterprise',
    name: '企业版',
    description: '适合机构和企业用户',
    price: 999,
    period: 'monthly',
    features: [
      '无限策略数量',
      '无限运行中策略',
      '无限回测次数',
      '无限数据存储',
      '完整历史数据',
      '完整 API 访问',
      '自定义数据源',
      '云端同步',
      '多团队协作',
      '专属客户经理',
      '24/7 优先支持',
      '自定义集成',
    ],
    limits: {
      maxStrategies: -1,
      maxStrategiesRunning: -1,
      maxBacktestsPerDay: -1,
      maxDataStorage: -1,
      maxApiCallsPerDay: -1,
      maxPortfolios: -1,
      maxContainers: -1,
      maxTeamMembers: -1,
      historicalDataDays: -1,
      allowCloudSync: true,
      allowApiAccess: true,
      allowCustomDataSources: true,
    },
    color: '#f59e0b',
  },
};

/**
 * 订阅状态标签
 */
export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: '有效',
  cancelled: '已取消',
  expired: '已过期',
  trial: '试用中',
  past_due: '逾期未付',
};

/**
 * 订阅计划标签
 */
export const SUBSCRIPTION_PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: '免费版',
  basic: '基础版',
  pro: '专业版',
  enterprise: '企业版',
};
