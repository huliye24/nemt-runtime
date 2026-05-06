import type { BaseEntity } from '@/types/shared';

export type ExecutionOrderSide = 'buy' | 'sell';

export type ExecutionOrderType = 'market' | 'limit' | 'stop' | 'stop_limit';

export type ExecutionOrderStatus =
  | 'draft'
  | 'accepted'
  | 'submitted'
  | 'working'
  | 'partially_filled'
  | 'filled'
  | 'cancelled'
  | 'rejected'
  | 'expired';

export type ExecutionOrderSource = 'manual' | 'strategy-runtime' | 'portfolio-runtime' | 'risk-engine';

export interface ExecutionOrderIntent extends BaseEntity {
  strategyRuntimeId?: string;
  containerRuntimeId?: string;
  adapterRuntimeId?: string;
  symbol: string;
  side: ExecutionOrderSide;
  orderType: ExecutionOrderType;
  requestedQuantity: number;
  limitPrice?: number;
  stopPrice?: number;
  source: ExecutionOrderSource;
  status: 'pending' | 'validated' | 'rejected' | 'routed';
  reason?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface ExecutionOrder extends BaseEntity {
  intentId?: string;
  adapterRuntimeId: string;
  externalOrderId?: string;
  symbol: string;
  side: ExecutionOrderSide;
  orderType: ExecutionOrderType;
  status: ExecutionOrderStatus;
  requestedQuantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  avgFillPrice?: number;
  limitPrice?: number;
  stopPrice?: number;
  submittedAt?: number;
  closedAt?: number;
  lastError?: string;
  metadata?: Record<string, unknown>;
}

export interface ExecutionOrderSnapshot {
  totalOrders: number;
  openOrders: number;
  closedOrders: number;
  rejectedOrders: number;
  totalFilledQuantity: number;
}
