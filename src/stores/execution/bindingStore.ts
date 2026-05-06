import { create } from 'zustand';

import type { ExecutionAdapterBinding } from '@/types/execution';

interface ExecutionBindingState {
  bindings: ExecutionAdapterBinding[];
}

interface ExecutionBindingActions {
  upsertBinding: (_binding: ExecutionAdapterBinding) => void;
  removeBinding: (_id: string) => void;
  detachBindingsForRuntime: (_strategyRuntimeId: string) => void;
  reset: () => void;
}

export const useExecutionBindingStore = create<ExecutionBindingState & ExecutionBindingActions>()((set) => ({
  bindings: [],
  upsertBinding: (binding) =>
    set((state) => {
      const exists = state.bindings.some((item) => item.id === binding.id);
      return {
        bindings: exists
          ? state.bindings.map((item) => (item.id === binding.id ? binding : item))
          : [binding, ...state.bindings],
      };
    }),
  removeBinding: (id) =>
    set((state) => ({
      bindings: state.bindings.filter((binding) => binding.id !== id),
    })),
  detachBindingsForRuntime: (strategyRuntimeId) =>
    set((state) => ({
      bindings: state.bindings.map((binding) =>
        binding.strategyRuntimeId === strategyRuntimeId
          ? {
              ...binding,
              status: 'detached',
              updatedAt: Date.now(),
            }
          : binding,
      ),
    })),
  reset: () =>
    set({
      bindings: [],
    }),
}));

export const useExecutionBindings = () => useExecutionBindingStore((state) => state.bindings);
export const useExecutionBindingsByRuntime = (strategyRuntimeId: string) =>
  useExecutionBindingStore((state) =>
    state.bindings.filter((binding) => binding.strategyRuntimeId === strategyRuntimeId),
  );
