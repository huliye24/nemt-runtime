import type { BaseEntity } from '@/types/shared';

export type ExecutionSessionStatus = 'idle' | 'running' | 'paused';

export type ExecutionSessionSource = 'mine' | 'purchased' | 'subscribed';

export interface ExecutionSessionMember extends BaseEntity {
  strategyId: string;
  strategyName: string;
  source: ExecutionSessionSource;
  status: ExecutionSessionStatus;
  runtimeId?: string;
  adapterRuntimeId?: string;
  subscribedSymbol: string;
  lastSignalAt?: number;
}

export interface ExecutionMarketSnapshot {
  symbol: string;
  price: number;
  change24h: number;
  updatedAt: number;
}
