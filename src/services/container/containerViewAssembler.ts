/**
 * NEMT Runtime - Container View Assembler
 * Builds compatibility view models from layered container entities.
 */

import type {
  ContainerBinding,
  ContainerEnvelope,
  ContainerObservation,
  ContainerRuntime,
  ContainerSpec,
  ContainerListItemViewModel,
  LegacyContainerViewModel,
} from '@/types/container';

function mapRuntimeStatusToLegacyStatus(
  status: ContainerRuntime['status'],
): LegacyContainerViewModel['status'] {
  switch (status) {
    case 'running':
      return 'running';
    case 'starting':
    case 'created':
    case 'restarting':
      return 'starting';
    case 'failed':
    case 'degraded':
    case 'quarantined':
      return 'error';
    case 'paused':
    case 'stopped':
      return 'stopped';
    default:
      return 'stopped';
  }
}

export function assembleLegacyContainerViewModel(
  spec: ContainerSpec,
  runtime: ContainerRuntime,
  observation?: ContainerObservation | null,
  bindings: ContainerBinding[] = [],
): LegacyContainerViewModel {
  const strategyBinding = bindings.find((binding) => binding.runtimeUnitKind === 'strategy-runtime');

  return {
    id: runtime.id,
    name: spec.name,
    image: spec.runtimeTemplate.image ?? spec.runtimeTemplate.templateId,
    status: mapRuntimeStatusToLegacyStatus(runtime.status),
    ports: spec.network.ports.map((port) => ({
      host: port.hostPort,
      container: port.containerPort,
      protocol: port.protocol,
    })),
    envVars: Object.fromEntries(
      spec.environment.variables
        .filter((variable) => typeof variable.value === 'string')
        .map((variable) => [variable.key, variable.value ?? '']),
    ),
    createdAt: runtime.createdAt,
    updatedAt: runtime.updatedAt,
    cpu: runtime.resources.cpuPercent,
    memoryUsed: runtime.resources.memory?.used,
    memoryTotal: runtime.resources.memory?.limit,
    memory:
      runtime.resources.memory?.used !== undefined && runtime.resources.memory?.limit !== undefined
        ? `${runtime.resources.memory.used}/${runtime.resources.memory.limit} ${runtime.resources.memory.unit}`
        : undefined,
    uptime:
      runtime.startedAt !== undefined ? `${Math.max(0, Math.floor((Date.now() - runtime.startedAt) / 1000))}s` : undefined,
    strategy: strategyBinding?.runtimeUnitId,
  };
}

export function assembleContainerListItemViewModel(
  spec: ContainerSpec,
  runtime: ContainerRuntime,
  envelope?: ContainerEnvelope | null,
  observation?: ContainerObservation | null,
  bindings: ContainerBinding[] = [],
): ContainerListItemViewModel {
  return {
    id: runtime.id,
    name: spec.name,
    boundaryKind: spec.boundaryKind,
    runtimeStatus: runtime.status,
    health: runtime.health,
    activeRuntimeUnitCount: bindings.length,
    cpuPercent: observation?.metrics.cpuPercent ?? runtime.resources.cpuPercent,
    memoryPercent: observation?.metrics.memoryPercent,
    isolationLevel: envelope?.isolationLevel,
  };
}
