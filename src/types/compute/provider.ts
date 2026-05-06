import type { BaseEntity } from '@/types/shared';

export type ComputeProviderKind = 'local' | 'remote' | 'gpu-cluster';

export type ComputeProviderStatus = 'ready' | 'busy' | 'offline' | 'degraded';

export interface ComputeProviderCapacity {
  cpuCores: number;
  memoryGb: number;
  gpuCount: number;
  maxParallelJobs: number;
}

export interface ComputeProvider extends BaseEntity {
  name: string;
  kind: ComputeProviderKind;
  status: ComputeProviderStatus;
  endpoint?: string;
  capacity: ComputeProviderCapacity;
  queueDepth: number;
  activeJobIds: string[];
  lastHeartbeatAt?: number;
  metadata?: Record<string, unknown>;
}

export interface ComputeProviderDescriptor {
  id: string;
  label: string;
  kind: ComputeProviderKind;
  description: string;
  defaultCapacity: ComputeProviderCapacity;
}
