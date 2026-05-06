/**
 * NEMT Runtime - Container Binding Types
 * Formal relationships between container runtimes and runtime units.
 */

import type { BaseEntity } from '@/types/shared';

import type { RuntimeUnitKind } from './boundary';

export type BindingRole =
  | 'primary-host'
  | 'sidecar'
  | 'execution-gateway'
  | 'data-ingress-worker'
  | 'observation-worker';

export type BindingState = 'attaching' | 'active' | 'degraded' | 'detaching' | 'detached' | 'failed';

export interface ContainerBinding extends BaseEntity {
  containerRuntimeId: string;
  runtimeUnitKind: RuntimeUnitKind;
  runtimeUnitId: string;
  role: BindingRole;
  state: BindingState;
  attachedAt: number;
  detachedAt?: number;
  metadata?: Record<string, unknown>;
}
