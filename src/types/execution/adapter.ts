import type { BaseEntity } from '@/types/shared';

import type { ExecutionOrder, ExecutionOrderIntent } from './order';
import type { ExecutionFillRecord } from './record';
import type { ExecutionAccountSummary, ExecutionPosition } from './position';

export type ExecutionAdapterKind = 'paper' | 'exchange' | 'broker';

export type ExecutionAdapterStatus = 'idle' | 'ready' | 'degraded' | 'offline';

export interface ExecutionAdapterCapabilities {
  supportsMarketOrders: boolean;
  supportsLimitOrders: boolean;
  supportsStopOrders: boolean;
  supportsPartialFills: boolean;
  supportsCancelOrder: boolean;
  supportsPositionSync: boolean;
}

export interface ExecutionAdapterRuntime extends BaseEntity {
  name: string;
  adapterKind: ExecutionAdapterKind;
  status: ExecutionAdapterStatus;
  runtimeRegistryId?: string;
  containerRuntimeId?: string;
  boundStrategyRuntimeIds: string[];
  supportedSymbols: string[];
  capabilities: ExecutionAdapterCapabilities;
  lastHeartbeatAt?: number;
  metadata?: Record<string, unknown>;
}

export interface ExecutionSubmitOrderRequest {
  intent: ExecutionOrderIntent;
}

export interface ExecutionSubmitOrderResult {
  accepted: boolean;
  order?: ExecutionOrder;
  rejectionReason?: string;
}

export interface ExecutionCancelOrderRequest {
  orderId: string;
  reason?: string;
}

export interface ExecutionAdapter {
  runtime: ExecutionAdapterRuntime;
  getAccountSummary: () => ExecutionAccountSummary;
  listOpenOrders: () => ExecutionOrder[];
  listPositions: () => ExecutionPosition[];
  submitOrder: (request: ExecutionSubmitOrderRequest) => ExecutionSubmitOrderResult;
  cancelOrder: (request: ExecutionCancelOrderRequest) => boolean;
  getFillRecords: () => ExecutionFillRecord[];
}
