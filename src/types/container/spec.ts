/**
 * NEMT Runtime - Container Spec Types
 * Definition-layer types for container boundary configuration.
 */

import type { BaseEntity } from '@/types/shared';

import type { ContainerBoundaryKind, RuntimeUnitKind } from './boundary';

export interface RuntimeTemplateRef {
  provider: 'docker' | 'local-process' | 'k8s' | 'simulated';
  templateId: string;
  image?: string;
  tag?: string;
}

export interface ContainerResourceSpec {
  cpuLimit?: number;
  cpuReservation?: number;
  memoryLimitMb?: number;
  memoryReservationMb?: number;
  gpuLimit?: number;
  networkBandwidthMbps?: number;
  storageLimitMb?: number;
}

export interface ContainerNetworkPortSpec {
  hostPort: number;
  containerPort: number;
  protocol: 'tcp' | 'udp';
  description?: string;
}

export interface ContainerNetworkSpec {
  ports: ContainerNetworkPortSpec[];
  networkMode?: 'bridge' | 'host' | 'overlay' | 'none';
  aliases?: string[];
}

export interface ContainerStorageMountSpec {
  source: string;
  target: string;
  mode: 'rw' | 'ro';
  description?: string;
}

export interface ContainerStorageSpec {
  mounts: ContainerStorageMountSpec[];
  ephemeral?: boolean;
}

export interface ContainerEnvironmentVarSpec {
  key: string;
  value?: string;
  valueFromSecret?: string;
}

export interface ContainerEnvironmentSpec {
  workingDir?: string;
  user?: string;
  command?: string[];
  entrypoint?: string[];
  variables: ContainerEnvironmentVarSpec[];
}

export interface ContainerSpec extends BaseEntity {
  name: string;
  description?: string;
  boundaryKind: ContainerBoundaryKind;
  runtimeTemplate: RuntimeTemplateRef;
  resources: ContainerResourceSpec;
  network: ContainerNetworkSpec;
  storage: ContainerStorageSpec;
  environment: ContainerEnvironmentSpec;
  allowedRuntimeKinds: RuntimeUnitKind[];
  defaultEnvelopeId?: string;
  defaultRecoveryPolicyId?: string;
  labels: Record<string, string>;
  metadata?: Record<string, unknown>;
}
