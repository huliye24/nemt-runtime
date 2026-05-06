import { createPaperExecutionAdapter } from '@/adapters/paper/paperSimulator';
import type { ExecutionAdapter, ExecutionAdapterRuntime } from '@/types/execution';

const DEFAULT_EXECUTION_CASH = 100000;

const adapterInstances = new Map<string, ExecutionAdapter>();

export function ensureExecutionAdapter(runtime: ExecutionAdapterRuntime): ExecutionAdapter {
  const existing = adapterInstances.get(runtime.id);
  if (existing) {
    return existing;
  }

  const adapter =
    runtime.adapterKind === 'paper'
      ? createPaperExecutionAdapter({
          runtime,
          initialCash: DEFAULT_EXECUTION_CASH,
        })
      : createPaperExecutionAdapter({
          runtime,
          initialCash: DEFAULT_EXECUTION_CASH,
        });

  adapterInstances.set(runtime.id, adapter);
  return adapter;
}

export function getExecutionAdapter(runtimeId: string): ExecutionAdapter | null {
  return adapterInstances.get(runtimeId) ?? null;
}

export function clearExecutionAdapter(runtimeId: string): void {
  adapterInstances.delete(runtimeId);
}
