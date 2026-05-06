import type { BacktestComputeManifest, ComputeProvider } from '@/types/compute';
import type { StrategyData } from '@/components/strategies';

export function createDefaultBacktestManifest(
  strategies: StrategyData[],
  provider: ComputeProvider,
): BacktestComputeManifest {
  const now = Date.now();
  const strategyIds = strategies.slice(0, 3).map((strategy) => strategy.id);

  return {
    id: `manifest_${now}`,
    name: 'BTC multi-strategy validation',
    strategyIds,
    providerId: provider.id,
    dataUniverse: {
      sourceId: 'binance',
      symbols: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
      interval: '1d',
      startDate: '2021-01-01',
      endDate: new Date().toISOString().split('T')[0],
    },
    parameterSweeps: [
      { key: 'risk.maxPositionSize', values: [0.05, 0.1, 0.2] },
      { key: 'execution.slippage', values: [0.0005, 0.001, 0.002] },
    ],
    rankingMetrics: [
      { key: 'sharpeRatio', direction: 'desc', weight: 0.35 },
      { key: 'maxDrawdown', direction: 'asc', weight: 0.3 },
      { key: 'totalReturn', direction: 'desc', weight: 0.2 },
      { key: 'stabilityScore', direction: 'desc', weight: 0.15 },
    ],
    estimatedRunCount: Math.max(strategyIds.length, 1) * 3 * 3,
    status: 'draft',
    resultIds: [],
    createdAt: now,
    updatedAt: now,
  };
}
