import type { BaseEntity } from '@/types/shared';

export interface ExecutionAdapterBinding extends BaseEntity {
  strategyRuntimeId: string;
  adapterRuntimeId: string;
  symbolScope: string[];
  mode: 'primary' | 'fallback';
  status: 'active' | 'paused' | 'detached';
  metadata?: Record<string, unknown>;
}
