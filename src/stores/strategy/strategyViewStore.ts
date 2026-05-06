/**
 * NEMT Runtime - Strategy View Store
 * Compatibility projection between strategy definitions/runtimes and legacy UI.
 */

import type { StrategyViewModel } from '@/types/strategy';

import { useStrategyDefinitionStore } from './strategyDefinitionStore';
import { useStrategyRuntimeStore } from './strategyRuntimeStore';

function buildStrategyViews(): StrategyViewModel[] {
  const { definitions } = useStrategyDefinitionStore.getState();
  const { runtimes } = useStrategyRuntimeStore.getState();

  return definitions.map((definition) => {
    const runtime = runtimes.find((item) => item.strategyDefinitionId === definition.id) ?? null;

    return {
      id: definition.id,
      name: definition.name,
      code: definition.code,
      createdAt: new Date(definition.createdAt),
      status: runtime?.status ?? 'ready',
      runtimeId: runtime?.id,
      containerRuntimeId: runtime?.containerRuntimeId,
      lastHeartbeatAt: runtime?.lastHeartbeatAt,
    };
  });
}

export const useStrategyViews = () => {
  useStrategyDefinitionStore((state) => state.definitions);
  useStrategyRuntimeStore((state) => state.runtimes);

  return buildStrategyViews();
};
