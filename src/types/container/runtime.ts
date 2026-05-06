/**
 * NEMT Runtime - Container Runtime Types
 * Live operational state for container boundaries.
 */

import type { BaseEntity } from '@/types/shared';

export type ContainerRuntimeStatus =
  | 'created'
  | 'starting'
  | 'running'
  | 'paused'
  | 'degraded'
  | 'restarting'
  | 'stopped'
  | 'failed'
  | 'quarantined';

export type ContainerHealthState = 'healthy' | 'warning' | 'critical' | 'unknown';

export interface HostPlacement {
  hostId?: string;
  nodeId?: string;
  region?: string;
  zone?: string;
  provider?: string;
}

export interface ContainerRuntimeResourceSnapshot {
  used: number;
  limit?: number;
  reserved?: number;
  unit: 'count' | 'mb' | 'bytes' | 'percent' | 'mbps';
}

export interface ContainerRuntimeResources {
  cpuPercent?: number;
  memory?: ContainerRuntimeResourceSnapshot;
  networkRxBytes?: number;
  networkTxBytes?: number;
  storageUsedBytes?: number;
  processCount?: number;
}

export interface ContainerFailureState {
  code: string;
  message: string;
  category:
    | 'runtime'
    | 'resource'
    | 'network'
    | 'binding'
    | 'permission'
    | 'recovery'
    | 'unknown';
  firstOccurredAt: number;
  lastOccurredAt: number;
  count: number;
}

export interface ContainerRuntime extends BaseEntity {
  specId: string;
  envelopeId?: string;
  status: ContainerRuntimeStatus;
  health: ContainerHealthState;
  host: HostPlacement;
  resources: ContainerRuntimeResources;
  activeBindingIds: string[];
  ingressSessionIds: string[];
  executionSessionIds: string[];
  startedAt?: number;
  stoppedAt?: number;
  lastHeartbeatAt?: number;
  restartCount: number;
  failureState?: ContainerFailureState;
  metadata?: Record<string, unknown>;
}
