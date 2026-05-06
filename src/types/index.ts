/**
 * NEMT Platform - Types Export
 * Curated type entrypoint for shared imports.
 */

export type { User, LoginCredentials, AuthResponse } from './auth';
export { DEMO_USER } from './auth';
export type { ViewId } from './navigation';

export type {
  StrategyDefinition,
  RuntimePosition,
  StrategyRuntime,
  StrategyRuntimeMetrics,
  StrategyViewModel,
} from './strategy';
export type {
  Alert,
  AlertType,
  AlertSeverity,
  AlertStatus,
  AlertChannel,
} from './alert';
export {
  ALERT_SEVERITY_LABELS,
  ALERT_TYPE_LABELS,
  ALERT_STATUS_LABELS,
  ALERT_CHANNEL_LABELS,
} from './alert';

export type { DataSource, DataSourceStatus, DataSourceStats } from './dataSource';
export { DATA_SOURCE_STATUS_LABELS, DATA_TYPE_LABELS, DATA_SOURCE_PROVIDERS } from './dataSource';

export type { Candlestick, OrderBook, Ticker24h, Trade } from './market';
export { SYMBOL_STATUS_LABELS, MARKET_TYPE_LABELS, CANDLE_INTERVAL_LABELS } from './market';

export type { Order, OrderStatus, QueryOrderParams } from './order';
export { ORDER_STATUS_LABELS, ORDER_TYPE_LABELS, ORDER_SIDE_LABELS } from './order';
export type {
  ExecutionAdapter,
  ExecutionAdapterCapabilities,
  ExecutionAdapterKind,
  ExecutionAdapterRuntime,
  ExecutionAdapterStatus,
  ExecutionAccountSummary,
  ExecutionCancelOrderRequest,
  ExecutionFillRecord,
  ExecutionMarketSnapshot,
  ExecutionOrder,
  ExecutionOrderIntent,
  ExecutionOrderSide,
  ExecutionOrderSnapshot,
  ExecutionOrderSource,
  ExecutionOrderStatus,
  ExecutionOrderType,
  ExecutionPosition,
  ExecutionPositionSide,
  ExecutionRejectRecord,
  ExecutionSessionMember,
  ExecutionSessionSource,
  ExecutionSessionStatus,
  ExecutionSubmitOrderRequest,
  ExecutionSubmitOrderResult,
} from './execution';

export type {
  Signal,
  SignalStatus,
  SignalFilterConfig,
  NotificationChannel,
  SignalType,
  SignalDirection,
} from './signal';
export {
  SIGNAL_STATUS_LABELS,
  SIGNAL_TYPE_LABELS,
  SIGNAL_DIRECTION_LABELS,
  SIGNAL_SOURCE_LABELS,
} from './signal';

export type {
  Subscription,
  SubscriptionPlan,
  SubscriptionUsage,
  SubscriptionLimits,
  SubscriptionStatus,
} from './subscription';
export {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_PLAN_LABELS,
} from './subscription';

export type {
  PerformanceSummary,
  PerformancePeriod,
  PerformanceReport,
  PerformanceAttribution,
} from './performance';
export { PERFORMANCE_PERIOD_LABELS, PERFORMANCE_REPORT_TYPE_LABELS } from './performance';

export type { RiskMetrics, RiskExposure, RiskLimit, RiskLevel, RiskWarning, RiskRule } from './risk';
export { RISK_LEVEL_LABELS, RISK_TYPE_LABELS, RISK_ACTION_LABELS } from './risk';

export type {
  PortfolioData,
  MarketPortfolio,
  PublishSettings,
  AllocationResult,
  StrategyPerformance,
  PortfolioConfig,
  PortfolioStatus,
} from './portfolio';
export {
  SCORING_PERIOD_LABELS,
  FREQUENCY_LABELS,
  DEFAULT_PORTFOLIO_CONFIG,
  DEFAULT_SCORING_WEIGHTS,
  DEFAULT_ALLOCATION_RULES,
} from './portfolio';

export type {
  BacktestConfig,
  BacktestSummary,
  BacktestStatus,
  BacktestMetrics,
  BacktestTrade,
} from './backtest';
export { BACKTEST_STATUS_LABELS, BACKTEST_MODE_LABELS, BACKTEST_RESOLUTION_LABELS } from './backtest';

export type { Strategy } from './strategy';
export type { BacktestResult, ApiResponse, PaginatedResponse, ApiError } from './shared';
export type { AppError, ValidationError, NotFoundError } from './shared';
export type { Container, ContainerState, ContainerStatus, ContainerStats, CreateContainerParams } from './container';
export type {
  CapitalAccessPolicy,
  ContainerBinding,
  ContainerBoundaryKind,
  ContainerEnvelope,
  ContainerEvent,
  ContainerHealthState,
  ContainerListItemViewModel,
  ContainerObservation,
  ContainerRuntime,
  ContainerRuntimeStatus,
  ContainerSpec,
  DataAccessPolicy,
  ExecutionPermission,
  LegacyContainerViewModel,
  RecoveryPolicy,
} from './container';
export type { RuntimeKind, RuntimeEntityRef, RuntimeRegistryEntry } from '@/runtime/registry/runtimeRegistryTypes';
export type {
  BacktestComputeManifest,
  BacktestDataUniverse,
  BacktestParameterSweep,
  BacktestRankingMetric,
  ComputeBacktestJobStatus,
  ComputeProvider,
  ComputeProviderCapacity,
  ComputeProviderDescriptor,
  ComputeProviderKind,
  ComputeProviderStatus,
} from './compute';
