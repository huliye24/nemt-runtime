import { ensureExecutionAdapter, getExecutionAdapter } from '@/adapters/adapterRegistry';
import {
  createExecutionAdapterRegistryEntry,
  createStrategyRuntimeRegistryEntry,
} from '@/runtime/registry/runtimeRegistry';
import { routeOrderIntent } from '@/services/execution/orderRouter';
import {
  bindStrategyRuntimeToAdapter,
  resolveAdapterForStrategyRuntime,
} from '@/services/execution/adapterBindingService';
import { syncAllStrategyRuntimePositions, syncStrategyRuntimePositions } from '@/services/execution/runtimePositionSync';
import { useExecutionAdapterStore } from '@/stores/execution/adapterStore';
import { useExecutionBindingStore } from '@/stores/execution/bindingStore';
import { useExecutionOrderStore } from '@/stores/execution/orderStore';
import { useExecutionPositionStore } from '@/stores/execution/positionStore';
import { useExecutionSessionStore } from '@/stores/execution/sessionStore';
import { useRuntimeRegistryStore } from '@/stores/runtime/runtimeRegistryStore';
import { useSignalStore } from '@/stores/signalStore';
import { useStrategyRuntimeStore } from '@/stores/strategy/strategyRuntimeStore';
import type {
  ExecutionAdapterRuntime,
  ExecutionOrderIntent,
  ExecutionSessionMember,
  Signal,
  StrategyRuntime,
} from '@/types';

const DEFAULT_ADAPTER_RUNTIME_ID = 'execution_adapter_runtime_paper_default';
const DEFAULT_SIGNAL_SYMBOL = 'BTC/USDT';
const SIGNAL_EMIT_PROBABILITY = 0.28;
const EXECUTION_NOTIONAL = 1;

function createStrategyRuntimeSeed(member: ExecutionSessionMember, now: number): StrategyRuntime {
  return {
    id: `strategy_runtime_execution_${member.strategyId}`,
    strategyDefinitionId: member.strategyId,
    name: member.strategyName,
    status: member.status === 'paused' ? 'paused' : member.status === 'running' ? 'running' : 'ready',
    subscribedSymbols: [member.subscribedSymbol],
    activeSignalIds: [],
    activeOrderIntentIds: [],
    positions: [],
    metrics: {
      signalsGenerated: 0,
      ordersPlaced: 0,
      ordersFilled: 0,
      uptimeSeconds: 0,
      totalPnl: 0,
      todayPnl: 0,
      signalsPerMinute: 0,
      successRate: 0,
    },
    errors: [],
    startedAt: member.status === 'running' ? now : undefined,
    lastHeartbeatAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

function ensurePaperAdapterRuntime(): ExecutionAdapterRuntime {
  const adapterStore = useExecutionAdapterStore.getState();
  const registryStore = useRuntimeRegistryStore.getState();
  const now = Date.now();
  const existingRuntime = adapterStore.adapters.find((adapter) => adapter.id === DEFAULT_ADAPTER_RUNTIME_ID);

  if (existingRuntime) {
    ensureExecutionAdapter(existingRuntime);
    return existingRuntime;
  }

  const runtime: ExecutionAdapterRuntime = {
    id: DEFAULT_ADAPTER_RUNTIME_ID,
    name: 'Paper Execution Adapter',
    adapterKind: 'paper',
    status: 'ready',
    boundStrategyRuntimeIds: [],
    supportedSymbols: [DEFAULT_SIGNAL_SYMBOL],
    capabilities: {
      supportsMarketOrders: true,
      supportsLimitOrders: true,
      supportsStopOrders: true,
      supportsPartialFills: false,
      supportsCancelOrder: true,
      supportsPositionSync: true,
    },
    lastHeartbeatAt: now,
    createdAt: now,
    updatedAt: now,
  };

  adapterStore.upsertAdapter(runtime);
  registryStore.upsertEntry(createExecutionAdapterRegistryEntry(runtime));
  ensureExecutionAdapter(runtime);
  return runtime;
}

function ensureStrategyRuntime(member: ExecutionSessionMember): StrategyRuntime {
  const strategyRuntimeStore = useStrategyRuntimeStore.getState();
  const registryStore = useRuntimeRegistryStore.getState();
  const now = Date.now();
  const existingRuntime =
    strategyRuntimeStore.runtimes.find((runtime) => runtime.strategyDefinitionId === member.strategyId) ?? null;

  if (existingRuntime) {
    return existingRuntime;
  }

  const runtime = createStrategyRuntimeSeed(member, now);
  strategyRuntimeStore.addRuntime(runtime);
  registryStore.upsertEntry(createStrategyRuntimeRegistryEntry(runtime));
  return runtime;
}

function mapSessionStatusToStrategyStatus(status: ExecutionSessionMember['status']): StrategyRuntime['status'] {
  if (status === 'running') {
    return 'running';
  }

  if (status === 'paused') {
    return 'paused';
  }

  return 'ready';
}

function buildSignal(member: ExecutionSessionMember, price: number, now: number): Signal {
  const typeRoll = Math.random();
  const type: Signal['type'] = typeRoll > 0.5 ? 'entry' : 'exit';
  const direction: Signal['direction'] = type === 'entry' ? (Math.random() > 0.5 ? 'long' : 'short') : 'close';

  return {
    id: `signal_execution_${member.strategyId}_${now}`,
    strategyId: member.strategyId,
    strategyName: member.strategyName,
    symbol: member.subscribedSymbol,
    type,
    direction,
    status: 'generated',
    source: 'strategy',
    priority: 'normal',
    currentPrice: price,
    quantity: EXECUTION_NOTIONAL,
    confidence: {
      score: 65 + Math.round(Math.random() * 30),
      factors: [
        {
          name: 'execution-cycle',
          contribution: 1,
          description: 'Generated from the local execution orchestrator cycle.',
        },
      ],
    },
    generatedAt: now,
    reason: direction === 'long' ? '趋势突破确认' : direction === 'short' ? '空头动量增强' : '策略平仓触发',
    tags: ['execution-orchestrator'],
    metadata: {
      runtimeId: member.runtimeId,
    },
  };
}

function buildOrderIntent(
  member: ExecutionSessionMember,
  signal: Signal,
  adapterRuntimeId: string,
  now: number,
): ExecutionOrderIntent {
  return {
    id: `intent_execution_${member.strategyId}_${now}`,
    createdAt: now,
    updatedAt: now,
    strategyRuntimeId: member.runtimeId,
    adapterRuntimeId,
    symbol: signal.symbol,
    side: signal.direction === 'short' ? 'sell' : 'buy',
    orderType: 'market',
    requestedQuantity: signal.quantity ?? EXECUTION_NOTIONAL,
    source: 'strategy-runtime',
    status: 'validated',
    reason: signal.reason,
    tags: ['strategy-execution'],
    metadata: {
      strategyId: member.strategyId,
      strategyName: member.strategyName,
      markPrice: signal.currentPrice,
      signalId: signal.id,
    },
  };
}

function syncAdapterState(adapterRuntimeId: string): void {
  const adapter = getExecutionAdapter(adapterRuntimeId);
  if (!adapter) {
    return;
  }

  useExecutionOrderStore.getState().setOrders(adapter.listOpenOrders());
  useExecutionPositionStore.getState().setPositions(adapter.listPositions());
  useExecutionPositionStore.getState().upsertAccountSummary(adapter.getAccountSummary());
  syncAllStrategyRuntimePositions();
}

export function addStrategyToExecutionPool(
  member: Omit<ExecutionSessionMember, 'createdAt' | 'updatedAt' | 'subscribedSymbol' | 'status'> & {
    subscribedSymbol?: string;
  },
): void {
  const now = Date.now();
  const adapterRuntime = ensurePaperAdapterRuntime();
  const sessionStore = useExecutionSessionStore.getState();
  const nextMember: ExecutionSessionMember = {
    ...member,
    subscribedSymbol: member.subscribedSymbol ?? DEFAULT_SIGNAL_SYMBOL,
    status: 'idle',
    adapterRuntimeId: adapterRuntime.id,
    createdAt: now,
    updatedAt: now,
  };
  const runtime = ensureStrategyRuntime(nextMember);

  sessionStore.upsertMember({
    ...nextMember,
    runtimeId: runtime.id,
  });
  bindStrategyRuntimeToAdapter(runtime.id, adapterRuntime.id, [nextMember.subscribedSymbol]);
}

export function removeStrategyFromExecutionPool(strategyId: string): void {
  const member = useExecutionSessionStore.getState().members.find((item) => item.strategyId === strategyId);
  if (member?.runtimeId) {
    useExecutionBindingStore.getState().detachBindingsForRuntime(member.runtimeId);
  }
  useExecutionSessionStore.getState().removeMember(strategyId);
}

export function setExecutionMarketSymbol(symbol: string): void {
  const market = useExecutionSessionStore.getState().market;
  useExecutionSessionStore.getState().setMarket({
    ...market,
    symbol,
    updatedAt: Date.now(),
  });
}

export function startExecutionMember(strategyId: string): void {
  const sessionStore = useExecutionSessionStore.getState();
  const member = sessionStore.members.find((item) => item.strategyId === strategyId);
  if (!member) {
    return;
  }

  const runtime = ensureStrategyRuntime(member);
  const adapterRuntime = ensurePaperAdapterRuntime();

  sessionStore.setMemberRuntimeRefs(strategyId, runtime.id, adapterRuntime.id);
  bindStrategyRuntimeToAdapter(runtime.id, adapterRuntime.id, [member.subscribedSymbol]);
  sessionStore.updateMemberStatus(strategyId, 'running');
  useStrategyRuntimeStore.getState().updateRuntime(runtime.id, {
    status: 'running',
    lastHeartbeatAt: Date.now(),
    startedAt: runtime.startedAt ?? Date.now(),
  });
}

export function pauseExecutionMember(strategyId: string): void {
  const sessionStore = useExecutionSessionStore.getState();
  const member = sessionStore.members.find((item) => item.strategyId === strategyId);
  if (!member?.runtimeId) {
    return;
  }

  sessionStore.updateMemberStatus(strategyId, 'paused');
  useStrategyRuntimeStore.getState().updateRuntime(member.runtimeId, {
    status: 'paused',
    lastHeartbeatAt: Date.now(),
  });
}

export function stopExecutionMember(strategyId: string): void {
  const sessionStore = useExecutionSessionStore.getState();
  const member = sessionStore.members.find((item) => item.strategyId === strategyId);
  if (!member?.runtimeId) {
    sessionStore.updateMemberStatus(strategyId, 'idle');
    return;
  }

  sessionStore.updateMemberStatus(strategyId, 'idle');
  useStrategyRuntimeStore.getState().updateRuntime(member.runtimeId, {
    status: 'ready',
    lastHeartbeatAt: Date.now(),
  });
  useExecutionBindingStore.getState().detachBindingsForRuntime(member.runtimeId);
}

export function tickExecutionMarket(): void {
  const sessionStore = useExecutionSessionStore.getState();
  const change = (Math.random() - 0.5) * 100;
  const nextPrice = sessionStore.market.price + change;

  sessionStore.setMarket({
    ...sessionStore.market,
    price: nextPrice,
    change24h: change,
    updatedAt: Date.now(),
  });

  const positionStore = useExecutionPositionStore.getState();
  positionStore.setPositions(
    positionStore.positions.map((position) => {
      const unrealizedPnl =
        position.side === 'short'
          ? (position.avgEntryPrice - nextPrice) * position.quantity
          : (nextPrice - position.avgEntryPrice) * position.quantity;

      return {
        ...position,
        markPrice: nextPrice,
        marketValue: nextPrice * position.quantity,
        unrealizedPnl,
        updatedAt: Date.now(),
      };
    }),
  );
  syncAllStrategyRuntimePositions();
}

export function stepExecutionOrchestrator(): void {
  const sessionStore = useExecutionSessionStore.getState();
  const strategyRuntimeStore = useStrategyRuntimeStore.getState();
  const signalStore = useSignalStore.getState();
  const orderStore = useExecutionOrderStore.getState();
  const runningMembers = sessionStore.members.filter((member) => member.status === 'running');

  runningMembers.forEach((member) => {
    const adapterRuntime =
      (member.runtimeId ? resolveAdapterForStrategyRuntime(member.runtimeId) : null) ?? ensurePaperAdapterRuntime();
    const runtime = member.runtimeId ? strategyRuntimeStore.runtimes.find((item) => item.id === member.runtimeId) : null;

    if (!runtime || Math.random() >= SIGNAL_EMIT_PROBABILITY) {
      return;
    }

    const now = Date.now();
    const signal = buildSignal(member, sessionStore.market.price, now);
    signalStore.addSignal(signal);
    sessionStore.touchMemberSignal(member.strategyId, now);

    const intent = buildOrderIntent(member, signal, adapterRuntime.id, now);
    orderStore.addIntent(intent);

    const adapter = ensureExecutionAdapter(adapterRuntime);

    const result = routeOrderIntent(adapter, intent);

    if (result.order) {
      orderStore.addOrder(result.order);
    } else {
      orderStore.updateIntent(intent.id, {
        status: 'rejected',
      });
    }

    useStrategyRuntimeStore.getState().updateRuntime(runtime.id, {
      status: mapSessionStatusToStrategyStatus(member.status),
      activeSignalIds: [signal.id, ...runtime.activeSignalIds].slice(0, 50),
      activeOrderIntentIds: [intent.id, ...runtime.activeOrderIntentIds].slice(0, 50),
      metrics: {
        ...runtime.metrics,
        signalsGenerated: runtime.metrics.signalsGenerated + 1,
        ordersPlaced: runtime.metrics.ordersPlaced + (result.accepted ? 1 : 0),
        ordersFilled: runtime.metrics.ordersFilled + (result.order?.status === 'filled' ? 1 : 0),
      },
      lastHeartbeatAt: now,
    });

    syncAdapterState(adapterRuntime.id);
    syncStrategyRuntimePositions(runtime.id);
  });
}
