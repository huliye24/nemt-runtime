import type { BaseEntity } from '@/types/shared';

export type ComputeBacktestJobStatus = 'draft' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface BacktestDataUniverse {
  sourceId: string;
  symbols: string[];
  interval: string;
  startDate: string;
  endDate: string;
}

export interface BacktestParameterSweep {
  key: string;
  values: Array<string | number | boolean>;
}

export interface BacktestRankingMetric {
  key: 'totalReturn' | 'sharpeRatio' | 'maxDrawdown' | 'winRate' | 'stabilityScore';
  direction: 'asc' | 'desc';
  weight: number;
}

export interface BacktestComputeManifest extends BaseEntity {
  name: string;
  strategyIds: string[];
  providerId: string;
  dataUniverse: BacktestDataUniverse;
  parameterSweeps: BacktestParameterSweep[];
  rankingMetrics: BacktestRankingMetric[];
  estimatedRunCount: number;
  status: ComputeBacktestJobStatus;
  resultIds: string[];
}
