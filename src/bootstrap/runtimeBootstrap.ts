/**
 * NEMT Runtime - Runtime Bootstrap
 * Initializes seed strategy/container runtime state for the local app shell.
 */

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
import { useStrategyDefinitionStore } from '@/stores/strategy/strategyDefinitionStore';
import { useStrategyRuntimeStore } from '@/stores/strategy/strategyRuntimeStore';
import type {
  ContainerEnvelope,
  ContainerEvent,
  ContainerObservation,
  ContainerRuntime,
  ContainerSpec,
  StrategyDefinition,
  StrategyRuntime,
} from '@/types';
import type { StrategyData } from '@/components/strategies';

export interface BootstrapRuntimeParams {
  initialStrategies: StrategyData[];
}

export function bootstrapRuntime({ initialStrategies }: BootstrapRuntimeParams): void {
  if (useContainerRuntimeStore.getState().runtimes.length > 0) {
    return;
  }

  const now = Date.now();
  const addContainerEnvelope = useContainerEnvelopeStore.getState().addEnvelope;
  const addContainerSpec = useContainerSpecStore.getState().addSpec;
  const addContainerRuntime = useContainerRuntimeStore.getState().addRuntime;
  const addContainerObservation = useContainerObservationStore.getState().setObservation;
  const appendObservationEventRef = useContainerObservationStore.getState().appendEventRef;
  const addContainerBinding = useContainerBindingStore.getState().addBinding;
  const addContainerEvent = useContainerEventStore.getState().addEvent;
  const addStrategyDefinition = useStrategyDefinitionStore.getState().addDefinition;
  const addStrategyRuntime = useStrategyRuntimeStore.getState().addRuntime;
  const upsertRuntimeRegistryEntry = useRuntimeRegistryStore.getState().upsertEntry;
  const appendRegistryEventId = useRuntimeRegistryStore.getState().appendEventId;
  const setRegistryRelatedEntityRefs = useRuntimeRegistryStore.getState().setRelatedEntityRefs;

  const defaultEnvelope: ContainerEnvelope = {
    id: 'envelope_default_strategy_host',
    name: '默认策略宿主边界',
    description: '用于承载策略运行单元的默认容器边界',
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

  addContainerEnvelope(defaultEnvelope);

  initialStrategies.forEach((strategy) => {
    const createdAt = strategy.createdAt.getTime();
    const definition: StrategyDefinition = {
      id: strategy.id,
      name: strategy.name,
      description: `${strategy.name} 的默认策略定义`,
      author: 'system',
      version: '1.0.0',
      code: strategy.code,
      language: 'python',
      type: 'custom',
      tags: [],
      tradingMode: 'both',
      timeFrames: ['1h'],
      config: {
        symbols: ['BTC/USDT'],
        signalSettings: {
          indicators: [],
        },
        riskRules: [],
        executionSettings: {
          executionMode: 'paper',
          defaultOrderType: 'market',
          positionSizing: 'fixed_quantity',
        },
        notificationSettings: {
          enabled: false,
          channels: [],
          notifyOn: {
            trade: false,
            signal: false,
            error: true,
            milestone: false,
            dailyReport: false,
          },
        },
      },
      riskLevel: 'moderate',
      maxPositionSize: 20,
      maxDrawdownLimit: 15,
      preferredContainerBoundaryKinds: ['strategy-host'],
      isPublic: false,
      isTemplate: false,
      allowCopy: true,
      createdAt,
      updatedAt: createdAt,
    };

    addStrategyDefinition(definition);
  });

  const seeds = [
    {
      id: 'container_runtime_seed_dual_ma',
      name: 'dual-ma-strategy',
      image: 'python:3.11',
      runtimeStatus: 'running' as const,
      health: 'healthy' as const,
      cpuPercent: 23,
      memoryUsed: 512,
      memoryLimit: 1024,
      uptimeSeconds: 9240,
      strategyId: 'strategy_demo_1',
    },
    {
      id: 'container_runtime_seed_rsi',
      name: 'rsi-strategy-v2',
      image: 'python:3.11',
      runtimeStatus: 'running' as const,
      health: 'healthy' as const,
      cpuPercent: 45,
      memoryUsed: 1200,
      memoryLimit: 2048,
      uptimeSeconds: 18720,
      strategyId: 'strategy_demo_2',
    },
    {
      id: 'container_runtime_seed_grid',
      name: 'grid-arbitrage',
      image: 'golang:1.21',
      runtimeStatus: 'running' as const,
      health: 'healthy' as const,
      cpuPercent: 12,
      memoryUsed: 384,
      memoryLimit: 512,
      uptimeSeconds: 97200,
      strategyId: 'strategy_demo_3',
    },
    {
      id: 'container_runtime_seed_scalping',
      name: 'scalping-bot',
      image: 'python:3.11',
      runtimeStatus: 'stopped' as const,
      health: 'warning' as const,
      cpuPercent: 0,
      memoryUsed: 0,
      memoryLimit: 512,
      uptimeSeconds: 0,
    },
    {
      id: 'container_runtime_seed_martingale',
      name: 'martingale-alpha',
      image: 'python:3.11',
      runtimeStatus: 'failed' as const,
      health: 'critical' as const,
      cpuPercent: 0,
      memoryUsed: 0,
      memoryLimit: 1024,
      uptimeSeconds: 0,
    },
  ];

  seeds.forEach((seed, index) => {
    const specId = `container_spec_seed_${index + 1}`;
    const spec: ContainerSpec = {
      id: specId,
      name: seed.name,
      description: '系统初始化的容器边界实例',
      boundaryKind: 'strategy-host',
      runtimeTemplate: {
        provider: 'docker',
        templateId: seed.image,
        image: seed.image,
      },
      resources: {
        cpuLimit: 2,
        memoryLimitMb: seed.memoryLimit,
      },
      network: {
        ports: [],
        networkMode: 'bridge',
      },
      storage: {
        mounts: [],
      },
      environment: {
        variables: [],
      },
      allowedRuntimeKinds: ['strategy-runtime'],
      defaultEnvelopeId: defaultEnvelope.id,
      labels: {
        source: 'seed',
      },
      createdAt: now,
      updatedAt: now,
    };

    const runtime: ContainerRuntime = {
      id: seed.id,
      specId,
      envelopeId: defaultEnvelope.id,
      status: seed.runtimeStatus,
      health: seed.health,
      host: {
        provider: 'local',
      },
      resources: {
        cpuPercent: seed.cpuPercent,
        memory: {
          used: seed.memoryUsed,
          limit: seed.memoryLimit,
          unit: 'mb',
        },
      },
      activeBindingIds: [],
      ingressSessionIds: [],
      executionSessionIds: [],
      startedAt: seed.uptimeSeconds > 0 ? now - seed.uptimeSeconds * 1000 : undefined,
      lastHeartbeatAt: now,
      restartCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const observation: ContainerObservation = {
      containerRuntimeId: seed.id,
      metrics: {
        cpuPercent: seed.cpuPercent,
        memoryPercent: seed.memoryLimit > 0 ? (seed.memoryUsed / seed.memoryLimit) * 100 : 0,
        restartCount: 0,
        activeRuntimeUnitCount: seed.strategyId ? 1 : 0,
        activeIngressCount: 0,
      },
      alertIds: [],
      logs: [],
      latestEventIds: [],
      dependencyHealth: [],
      updatedAt: now,
    };

    addContainerSpec(spec);
    addContainerRuntime(runtime);
    addContainerObservation(observation);
    upsertRuntimeRegistryEntry(createContainerRuntimeRegistryEntry(runtime));

    if (seed.strategyId) {
      const strategyDefinition = useStrategyDefinitionStore
        .getState()
        .definitions.find((definition) => definition.id === seed.strategyId);
      const strategyRuntimeId = `strategy_runtime_seed_${seed.strategyId}`;
      const strategyRuntime: StrategyRuntime = {
        id: strategyRuntimeId,
        strategyDefinitionId: seed.strategyId,
        name: strategyDefinition?.name ?? seed.strategyId,
        status: 'running',
        containerRuntimeId: runtime.id,
        subscribedSymbols: ['BTC/USDT'],
        activeSignalIds: [],
        activeOrderIntentIds: [],
        positions: [],
        metrics: {
          signalsGenerated: 0,
          ordersPlaced: 0,
          ordersFilled: 0,
          uptimeSeconds: seed.uptimeSeconds,
          totalPnl: 0,
          todayPnl: 0,
          signalsPerMinute: 0,
          successRate: 0,
        },
        errors: [],
        startedAt: seed.uptimeSeconds > 0 ? now - seed.uptimeSeconds * 1000 : undefined,
        lastHeartbeatAt: now,
        createdAt: now,
        updatedAt: now,
      };

      addStrategyRuntime(strategyRuntime);
      upsertRuntimeRegistryEntry(createStrategyRuntimeRegistryEntry(strategyRuntime));

      const binding = createContainerBinding({
        containerRuntimeId: runtime.id,
        runtimeUnitKind: 'strategy-runtime',
        runtimeUnitId: strategyRuntime.id,
        now,
      });

      addContainerBinding(binding);
      useContainerRuntimeStore.getState().attachBindingId(runtime.id, binding.id);
      setRegistryRelatedEntityRefs(runtime.id, [{ kind: 'strategy-runtime', id: strategyRuntime.id }]);
      setRegistryRelatedEntityRefs(strategyRuntime.id, [{ kind: 'container-runtime', id: runtime.id }]);

      const event: ContainerEvent = {
        id: `event_seed_binding_${binding.id}`,
        type: 'container.binding.attached',
        containerRuntimeId: runtime.id,
        envelopeId: defaultEnvelope.id,
        relatedEntityRefs: [{ kind: 'strategy-runtime', id: strategyRuntime.id }],
        severity: 'info',
        payload: {
          runtimeUnitId: strategyRuntime.id,
        },
        occurredAt: now,
        actor: { scope: 'system', id: 'seed' },
      };

      addContainerEvent(event);
      appendObservationEventRef(runtime.id, event.id);
      appendRegistryEventId(runtime.id, event.id);
      appendRegistryEventId(strategyRuntime.id, event.id);
    }
  });
}
