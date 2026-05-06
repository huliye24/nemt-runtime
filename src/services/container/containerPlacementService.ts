/**
 * NEMT Runtime - Container Placement Service
 * Minimal placement helpers for attaching runtime units to a container boundary.
 */

import type { BindingRole, ContainerBinding, ContainerRuntime, RuntimeUnitKind } from '@/types/container';

interface AttachRuntimeUnitParams {
  containerRuntimeId: string;
  runtimeUnitKind: RuntimeUnitKind;
  runtimeUnitId: string;
  role?: BindingRole;
  now?: number;
}

export function canPlaceRuntimeUnit(runtime: ContainerRuntime, runtimeUnitKind: RuntimeUnitKind): boolean {
  const activeCount = runtime.activeBindingIds.length;
  if (runtime.status === 'failed' || runtime.status === 'quarantined') {
    return false;
  }

  if (runtimeUnitKind === 'strategy-runtime' && activeCount >= 8) {
    return false;
  }

  return true;
}

export function createContainerBinding(params: AttachRuntimeUnitParams): ContainerBinding {
  const now = params.now ?? Date.now();

  return {
    id: `binding_${params.runtimeUnitKind}_${params.runtimeUnitId}_${now}`,
    containerRuntimeId: params.containerRuntimeId,
    runtimeUnitKind: params.runtimeUnitKind,
    runtimeUnitId: params.runtimeUnitId,
    role: params.role ?? 'primary-host',
    state: 'active',
    attachedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}
