/**
 * NEMT Runtime - Strategy Runtime Types
 * Live execution state for strategy runtime units.
 */

import type { BaseEntity } from '@/types/shared';

import type { RuntimePosition, StrategyError, StrategyStatus } from '@/types/strategy';

export interface StrategyRuntimeMetrics {
  signalsGenerated: number;
  ordersPlaced: number;
  ordersFilled: number;
  uptimeSeconds: number;
  totalPnl: number;
  todayPnl: number;
  signalsPerMinute: number;
  successRate: number;
}

export interface StrategyRuntime extends BaseEntity {
  strategyDefinitionId: string;
  name: string;
  status: StrategyStatus;
  containerRuntimeId?: string;
  startedAt?: number;
  lastHeartbeatAt?: number;
  subscribedSymbols: string[];
  activeSignalIds: string[];
  activeOrderIntentIds: string[];
  positions: RuntimePosition[];
  metrics: StrategyRuntimeMetrics;
  errors: StrategyError[];
}
