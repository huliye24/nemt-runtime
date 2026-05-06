/**
 * NEMT Runtime - Strategy View Types
 * Compatibility view models used by legacy UI surfaces during migration.
 */

import type { StrategyStatus } from '@/types/strategy';

export interface StrategyViewModel {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  status: StrategyStatus;
  runtimeId?: string;
  containerRuntimeId?: string;
  lastHeartbeatAt?: number;
}
