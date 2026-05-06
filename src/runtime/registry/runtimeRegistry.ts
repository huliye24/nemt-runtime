/**
 * NEMT Runtime - Runtime Registry Helpers
 * Pure helpers for creating and updating registry entries.
 */

import type { ContainerRuntime } from '@/types/container';
import type { ExecutionAdapterRuntime } from '@/types/execution';
import type { StrategyRuntime } from '@/types/strategy';

import type { RuntimeRegistryEntry } from './runtimeRegistryTypes';

export function createContainerRuntimeRegistryEntry(runtime: ContainerRuntime): RuntimeRegistryEntry {
  return {
    runtimeId: runtime.id,
    runtimeKind: 'container-runtime',
    definitionId: runtime.specId,
    containerRuntimeId: runtime.id,
    envelopeId: runtime.envelopeId,
    status: runtime.status,
    health: runtime.health,
    relatedEntityRefs: runtime.activeBindingIds.map((bindingId) => ({ kind: 'container-binding', id: bindingId })),
    latestEventIds: [],
    observationRef: runtime.id,
    updatedAt: runtime.updatedAt,
  };
}

export function createStrategyRuntimeRegistryEntry(runtime: StrategyRuntime): RuntimeRegistryEntry {
  return {
    runtimeId: runtime.id,
    runtimeKind: 'strategy-runtime',
    definitionId: runtime.strategyDefinitionId,
    containerRuntimeId: runtime.containerRuntimeId,
    status: runtime.status,
    health: runtime.errors.length > 0 ? 'warning' : 'healthy',
    relatedEntityRefs: runtime.containerRuntimeId
      ? [{ kind: 'container-runtime', id: runtime.containerRuntimeId }]
      : [],
    latestEventIds: [],
    updatedAt: runtime.updatedAt,
  };
}

export function createExecutionAdapterRegistryEntry(runtime: ExecutionAdapterRuntime): RuntimeRegistryEntry {
  return {
    runtimeId: runtime.id,
    runtimeKind: 'execution-adapter-runtime',
    containerRuntimeId: runtime.containerRuntimeId,
    status: runtime.status,
    health: runtime.status === 'degraded' ? 'warning' : runtime.status === 'offline' ? 'critical' : 'healthy',
    relatedEntityRefs: runtime.boundStrategyRuntimeIds.map((strategyRuntimeId) => ({
      kind: 'strategy-runtime',
      id: strategyRuntimeId,
    })),
    latestEventIds: [],
    updatedAt: runtime.updatedAt,
  };
}
