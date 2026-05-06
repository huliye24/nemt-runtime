import type { BaseEntity } from '@/types/shared';

export interface ExecutionFillRecord extends BaseEntity {
  orderId: string;
  adapterRuntimeId: string;
  symbol: string;
  quantity: number;
  price: number;
  commission?: number;
  commissionAsset?: string;
  executedAt: number;
  liquidityRole?: 'maker' | 'taker';
}

export interface ExecutionRejectRecord extends BaseEntity {
  intentId?: string;
  orderId?: string;
  adapterRuntimeId?: string;
  code: string;
  message: string;
  occurredAt: number;
  metadata?: Record<string, unknown>;
}
