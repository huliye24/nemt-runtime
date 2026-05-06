import { useExecutionAdapterStore } from '@/stores/execution/adapterStore';
import { useExecutionBindingStore } from '@/stores/execution/bindingStore';
import type { ExecutionAdapterBinding, ExecutionAdapterRuntime } from '@/types/execution';

export function bindStrategyRuntimeToAdapter(
  strategyRuntimeId: string,
  adapterRuntimeId: string,
  symbolScope: string[],
): ExecutionAdapterBinding {
  const now = Date.now();
  const binding: ExecutionAdapterBinding = {
    id: `execution_binding_${strategyRuntimeId}_${adapterRuntimeId}`,
    strategyRuntimeId,
    adapterRuntimeId,
    symbolScope,
    mode: 'primary',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  useExecutionBindingStore.getState().upsertBinding(binding);
  return binding;
}

export function resolveAdapterForStrategyRuntime(strategyRuntimeId: string): ExecutionAdapterRuntime | null {
  const binding = useExecutionBindingStore
    .getState()
    .bindings.find((item) => item.strategyRuntimeId === strategyRuntimeId && item.status === 'active');

  if (!binding) {
    return null;
  }

  return useExecutionAdapterStore.getState().adapters.find((adapter) => adapter.id === binding.adapterRuntimeId) ?? null;
}
