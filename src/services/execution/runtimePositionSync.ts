import { useExecutionPositionStore } from '@/stores/execution/positionStore';
import { useStrategyRuntimeStore } from '@/stores/strategy/strategyRuntimeStore';
import type { ExecutionPosition, RuntimePosition, StrategyRuntime } from '@/types';

function mapExecutionPositionToRuntimePosition(position: ExecutionPosition): RuntimePosition {
  const notional = position.avgEntryPrice * position.quantity;
  const totalPnl = position.unrealizedPnl + position.realizedPnl;

  return {
    symbol: position.symbol,
    side: position.side === 'short' ? 'short' : 'long',
    quantity: position.quantity,
    entryPrice: position.avgEntryPrice,
    currentPrice: position.markPrice,
    unrealizedPnl: position.unrealizedPnl,
    unrealizedPnlPercent: notional > 0 ? (totalPnl / notional) * 100 : 0,
    openedAt: position.openedAt ?? position.createdAt,
  };
}

function syncRuntime(runtime: StrategyRuntime): void {
  const positions = useExecutionPositionStore
    .getState()
    .positions.filter((position) => position.strategyRuntimeId === runtime.id)
    .map(mapExecutionPositionToRuntimePosition);

  const totalPnl = positions.reduce((sum, position) => sum + position.unrealizedPnl, 0);

  useStrategyRuntimeStore.getState().updateRuntime(runtime.id, {
    positions,
    metrics: {
      ...runtime.metrics,
      totalPnl,
      todayPnl: totalPnl,
    },
  });
}

export function syncStrategyRuntimePositions(strategyRuntimeId: string): void {
  const runtime = useStrategyRuntimeStore.getState().runtimes.find((item) => item.id === strategyRuntimeId);
  if (!runtime) {
    return;
  }

  syncRuntime(runtime);
}

export function syncAllStrategyRuntimePositions(): void {
  useStrategyRuntimeStore.getState().runtimes.forEach(syncRuntime);
}
