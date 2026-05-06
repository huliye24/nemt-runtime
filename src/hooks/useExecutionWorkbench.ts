import { useDeferredValue, useEffect, useMemo } from 'react';

import {
  addStrategyToExecutionPool,
  pauseExecutionMember,
  removeStrategyFromExecutionPool,
  setExecutionMarketSymbol,
  startExecutionMember,
  stepExecutionOrchestrator,
  stopExecutionMember,
  tickExecutionMarket,
} from '@/orchestrators/executionOrchestrator';
import {
  useExecutionMarket,
  useExecutionOrderIntents,
  useExecutionOrders,
  useExecutionPositions,
  useExecutionSessionMembers,
  useSignals,
} from '@/stores';
import type { ExecutionSessionSource } from '@/types/execution';

export interface AvailableExecutionStrategy {
  id: string;
  name: string;
  source: ExecutionSessionSource;
  author?: string;
  description?: string;
}

export interface UseExecutionWorkbenchParams {
  availableStrategies: AvailableExecutionStrategy[];
}

export function useExecutionWorkbench({ availableStrategies }: UseExecutionWorkbenchParams) {
  const members = useExecutionSessionMembers();
  const market = useExecutionMarket();
  const signals = useSignals();
  const orders = useExecutionOrders();
  const intents = useExecutionOrderIntents();
  const positions = useExecutionPositions();
  const deferredMembers = useDeferredValue(members);

  useEffect(() => {
    if (deferredMembers.filter((member) => member.status === 'running').length === 0) {
      return;
    }

    const marketTimer = window.setInterval(() => {
      tickExecutionMarket();
    }, 1000);

    const orchestratorTimer = window.setInterval(() => {
      stepExecutionOrchestrator();
    }, 1500);

    return () => {
      window.clearInterval(marketTimer);
      window.clearInterval(orchestratorTimer);
    };
  }, [deferredMembers]);

  const poolStrategyIds = useMemo(() => new Set(members.map((member) => member.strategyId)), [members]);
  const runtimeIds = useMemo(
    () => new Set(members.map((member) => member.runtimeId).filter((runtimeId): runtimeId is string => Boolean(runtimeId))),
    [members],
  );

  const monitorSignals = useMemo(
    () =>
      signals
        .filter((signal) => poolStrategyIds.has(signal.strategyId))
        .sort((left, right) => right.generatedAt - left.generatedAt)
        .slice(0, 50)
        .map((signal) => ({
          id: signal.id,
          time: new Date(signal.generatedAt),
          type: signal.direction === 'short' ? ('sell' as const) : signal.direction === 'close' ? ('hold' as const) : ('buy' as const),
          price: signal.currentPrice,
          reason: signal.reason ?? '策略信号',
          strength: signal.confidence.score / 100,
          strategyName: signal.strategyName,
        })),
    [poolStrategyIds, signals],
  );

  const orderView = useMemo(
    () =>
      orders
        .filter((order) => {
          const strategyRuntimeId = order.intentId
            ? intents.find((intent) => intent.id === order.intentId)?.strategyRuntimeId
            : undefined;
          return strategyRuntimeId ? runtimeIds.has(strategyRuntimeId) : true;
        })
        .map((order) => ({
          id: order.id,
          time: new Date(order.submittedAt ?? order.createdAt),
          symbol: order.symbol,
          type: order.side,
          price: order.avgFillPrice ?? order.limitPrice ?? market.price,
          amount: order.requestedQuantity,
          status:
            order.status === 'filled'
              ? ('filled' as const)
              : order.status === 'cancelled'
                ? ('cancelled' as const)
                : ('pending' as const),
          strategyName:
            typeof order.metadata?.strategyName === 'string' ? order.metadata.strategyName : 'Strategy Runtime',
        }))
        .sort((left, right) => right.time.getTime() - left.time.getTime()),
    [intents, market.price, orders, runtimeIds],
  );

  const positionView = useMemo(
    () =>
      positions.map((position) => ({
        strategyId:
          members.find((member) => member.runtimeId === position.strategyRuntimeId)?.strategyId ?? position.id,
        symbol: position.symbol,
        side: position.side === 'short' ? 'short' : 'long',
        entryPrice: position.avgEntryPrice,
        amount: position.quantity,
        pnl: position.unrealizedPnl + position.realizedPnl,
        pnlPercent:
          position.avgEntryPrice > 0 ? ((position.unrealizedPnl + position.realizedPnl) / (position.avgEntryPrice * position.quantity)) * 100 : 0,
      })),
    [members, positions],
  );

  return {
    members,
    market,
    monitorSignals,
    orderView,
    positionView,
    addStrategies: (strategyIds: string[]) => {
      strategyIds.forEach((strategyId) => {
        const strategy = availableStrategies.find((item) => item.id === strategyId);
        if (!strategy) {
          return;
        }

        addStrategyToExecutionPool({
          id: `execution_member_${strategy.id}`,
          strategyId: strategy.id,
          strategyName: strategy.name,
          source: strategy.source,
        });
      });
    },
    removeStrategy: removeStrategyFromExecutionPool,
    setMarketSymbol: setExecutionMarketSymbol,
    startStrategy: startExecutionMember,
    pauseStrategy: pauseExecutionMember,
    resumeStrategy: startExecutionMember,
    stopStrategy: stopExecutionMember,
  };
}
