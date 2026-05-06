/**
 * NEMT Runtime - Container Orchestrator
 * Encapsulates container boundary creation, strategy binding, observation, and registry sync.
 */

import type { ContainerConfig } from '@/components/containers/CreateContainerModal';
import { createContainerBinding } from '@/services/container/containerPlacementService';
import {
  createContainerRuntimeRegistryEntry,
  createStrategyRuntimeRegistryEntry,
} from '@/runtime/registry/runtimeRegistry';
import { useContainerBindingStore } from '@/stores/container/containerBindingStore';
import { useContainerEnvelopeStore } from '@/stores/container/containerEnvelopeStore';
import { useContainerEventStore } from '@/stores/container/containerEventStore';
import { useContainerObservationStore } from '@/stores/container/containerObservationStore';
import { useContainerRuntimeStore } from '@/stores/container/containerRuntimeStore';
import { useContainerSpecStore } from '@/stores/container/containerSpecStore';
import { useRuntimeRegistryStore } from '@/stores/runtime/runtimeRegistryStore';
import { useStrategyRuntimeStore } from '@/stores/strategy/strategyRuntimeStore';
import type {
  ContainerEnvelope,
  ContainerEvent,
  ContainerObservation,
  ContainerRuntime,
  ContainerSpec,
  StrategyRuntime,
} from '@/types';
import type { StrategyData } from '@/components/strategies';

export interface CreateContainerBoundaryParams {
  config: ContainerConfig;
  strategies: StrategyData[];
}

export interface CreateContainerBoundaryResult {
  runtimeId: string;
  specId: string;
  envelopeId: string;
  boundStrategyRuntimeId?: string;
}

export function createContainerBoundary({
  config,
  strategies,
}: CreateContainerBoundaryParams): CreateContainerBoundaryResult {
  const now = Date.now();
  const specId = `container_spec_${now}`;
  const runtimeId = `container_runtime_${now}`;
  const envelopeId = `container_envelope_${now}`;
  const strategy = config.strategyId
    ? strategies.find((item) => item.id === config.strategyId) ?? null
    : null;
  const strategyRuntime = strategy
    ? useStrategyRuntimeStore
        .getState()
        .runtimes.find((runtimeItem) => runtimeItem.strategyDefinitionId === strategy.id) ?? null
    : null;

  const addContainerEnvelope = useContainerEnvelopeStore.getState().addEnvelope;
  const addContainerSpec = useContainerSpecStore.getState().addSpec;
  const addContainerRuntime = useContainerRuntimeStore.getState().addRuntime;
  const attachContainerBindingId = useContainerRuntimeStore.getState().attachBindingId;
  const addContainerObservation = useContainerObservationStore.getState().setObservation;
  const appendContainerObservationEventRef = useContainerObservationStore.getState().appendEventRef;
  const addContainerBinding = useContainerBindingStore.getState().addBinding;
  const addContainerEvent = useContainerEventStore.getState().addEvent;
  const upsertRuntimeRegistryEntry = useRuntimeRegistryStore.getState().upsertEntry;
  const appendRegistryEventId = useRuntimeRegistryStore.getState().appendEventId;
  const setRegistryRelatedEntityRefs = useRuntimeRegistryStore.getState().setRelatedEntityRefs;
  const updateStrategyRuntime = useStrategyRuntimeStore.getState().updateRuntime;

  const envelope: ContainerEnvelope = {
    id: envelopeId,
    name: `${config.name} 边界`,
    description: '从创建容器流程生成的边界配置',
    isolationLevel: 'shared',
    executionPermissions: ['read_market_data', 'emit_signal'],
    dataAccessPolicy: {
      allowedDataSourceIds: [],
      allowedDataTypes: ['kline', 'trade', 'ticker'],
      allowExternalResearchFeeds: false,
    },
    capitalAccessPolicy: {
      visibleAccountIds: [],
      writableAccountIds: [],
      canRequestRebalance: false,
      canMoveCapitalAutomatically: false,
    },
    riskConstraints: [],
    recoveryPolicy: {
      mode: 'auto-restart',
      maxAttempts: 3,
      cooldownMs: 10000,
      autoReconnectIngress: true,
    },
    observationPolicy: {
      retainLogs: true,
      retainMetrics: true,
      retainEvents: true,
    },
    auditLevel: 'basic',
    mutableBy: ['system', 'operator'],
    createdAt: now,
    updatedAt: now,
  };

  const spec: ContainerSpec = {
    id: specId,
    name: config.name,
    description: strategy ? `承载策略 ${strategy.name} 的运行边界` : '手动创建的运行边界',
    boundaryKind: strategy ? 'strategy-host' : 'mixed-runtime-host',
    runtimeTemplate: {
      provider: 'docker',
      templateId: config.image,
      image: config.image,
    },
    resources: {
      cpuLimit: config.cpuCores,
      memoryLimitMb: config.memoryMB,
    },
    network: {
      ports: config.ports
        .map((portValue) => {
          const [hostPort, containerPort] = portValue.split(':');
          const parsedHostPort = Number(hostPort);
          const parsedContainerPort = Number(containerPort);

          if (Number.isNaN(parsedHostPort) || Number.isNaN(parsedContainerPort)) {
            return null;
          }

          return {
            hostPort: parsedHostPort,
            containerPort: parsedContainerPort,
            protocol: 'tcp' as const,
          };
        })
        .filter(
          (
            port,
          ): port is {
            hostPort: number;
            containerPort: number;
            protocol: 'tcp';
          } => port !== null,
        ),
      networkMode: 'bridge',
    },
    storage: {
      mounts: [],
    },
    environment: {
      variables: config.envVars.map((envVar) => ({
        key: envVar.key,
        value: envVar.value,
      })),
    },
    allowedRuntimeKinds: strategyRuntime ? ['strategy-runtime'] : ['strategy-runtime', 'agent-runtime'],
    defaultEnvelopeId: envelopeId,
    labels: {
      source: 'user-created',
    },
    createdAt: now,
    updatedAt: now,
  };

  const runtime: ContainerRuntime = {
    id: runtimeId,
    specId,
    envelopeId,
    status: 'running',
    health: 'healthy',
    host: {
      provider: 'local',
    },
    resources: {
      cpuPercent: 0,
      memory: {
        used: 0,
        limit: config.memoryMB,
        unit: 'mb',
      },
    },
    activeBindingIds: [],
    ingressSessionIds: [],
    executionSessionIds: [],
    startedAt: now,
    lastHeartbeatAt: now,
    restartCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const observation: ContainerObservation = {
    containerRuntimeId: runtimeId,
    metrics: {
      cpuPercent: 0,
      memoryPercent: 0,
      restartCount: 0,
      activeRuntimeUnitCount: strategyRuntime ? 1 : 0,
      activeIngressCount: 0,
    },
    alertIds: [],
    logs: [],
    latestEventIds: [],
    dependencyHealth: [],
    updatedAt: now,
  };

  addContainerEnvelope(envelope);
  addContainerSpec(spec);
  addContainerRuntime(runtime);
  addContainerObservation(observation);
  upsertRuntimeRegistryEntry(createContainerRuntimeRegistryEntry(runtime));

  if (!strategyRuntime) {
    return {
      runtimeId,
      specId,
      envelopeId,
    };
  }

  const binding = createContainerBinding({
    containerRuntimeId: runtimeId,
    runtimeUnitKind: 'strategy-runtime',
    runtimeUnitId: strategyRuntime.id,
    now,
  });

  addContainerBinding(binding);
  attachContainerBindingId(runtimeId, binding.id);

  const updatedStrategyRuntime: StrategyRuntime = {
    ...strategyRuntime,
    containerRuntimeId: runtimeId,
    status: 'running',
    startedAt: strategyRuntime.startedAt ?? now,
    lastHeartbeatAt: now,
    updatedAt: now,
  };

  updateStrategyRuntime(strategyRuntime.id, updatedStrategyRuntime);
  upsertRuntimeRegistryEntry(createStrategyRuntimeRegistryEntry(updatedStrategyRuntime));
  setRegistryRelatedEntityRefs(runtimeId, [{ kind: 'strategy-runtime', id: strategyRuntime.id }]);
  setRegistryRelatedEntityRefs(strategyRuntime.id, [{ kind: 'container-runtime', id: runtimeId }]);

  const event: ContainerEvent = {
    id: `event_container_created_${runtimeId}`,
    type: 'container.binding.attached',
    containerRuntimeId: runtimeId,
    envelopeId,
    relatedEntityRefs: [{ kind: 'strategy-runtime', id: strategyRuntime.id }],
    severity: 'info',
    payload: {
      strategyName: strategyRuntime.name,
    },
    occurredAt: now,
    actor: { scope: 'operator', id: 'current-user', name: '当前用户' },
  };

  addContainerEvent(event);
  appendContainerObservationEventRef(runtimeId, event.id);
  appendRegistryEventId(runtimeId, event.id);
  appendRegistryEventId(strategyRuntime.id, event.id);

  return {
    runtimeId,
    specId,
    envelopeId,
    boundStrategyRuntimeId: strategyRuntime.id,
  };
}
