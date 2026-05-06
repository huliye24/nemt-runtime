import type { BaseEntity } from '@/types/shared';

export type ExecutionPositionSide = 'long' | 'short' | 'flat';

export interface ExecutionPosition extends BaseEntity {
  strategyRuntimeId?: string;
  adapterRuntimeId: string;
  symbol: string;
  side: ExecutionPositionSide;
  quantity: number;
  avgEntryPrice: number;
  markPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  realizedPnl: number;
  openedAt?: number;
  closedAt?: number;
}

export interface ExecutionAccountSummary {
  adapterRuntimeId: string;
  currency: string;
  equity: number;
  availableCash: number;
  lockedMargin: number;
  buyingPower?: number;
  updatedAt: number;
}
