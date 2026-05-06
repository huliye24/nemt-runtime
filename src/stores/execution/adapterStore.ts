import { create } from 'zustand';

import type { ExecutionAdapterRuntime, ExecutionAdapterStatus } from '@/types/execution';

interface ExecutionAdapterState {
  adapters: ExecutionAdapterRuntime[];
  selectedAdapterRuntimeId: string | null;
}

interface ExecutionAdapterActions {
  upsertAdapter: (adapter: ExecutionAdapterRuntime) => void;
  removeAdapter: (id: string) => void;
  updateAdapterStatus: (id: string, status: ExecutionAdapterStatus) => void;
  selectAdapter: (id: string | null) => void;
  reset: () => void;
}

export const useExecutionAdapterStore = create<ExecutionAdapterState & ExecutionAdapterActions>()((set) => ({
  adapters: [],
  selectedAdapterRuntimeId: null,
  upsertAdapter: (adapter) =>
    set((state) => {
      const exists = state.adapters.some((item) => item.id === adapter.id);
      return {
        adapters: exists
          ? state.adapters.map((item) => (item.id === adapter.id ? adapter : item))
          : [adapter, ...state.adapters],
      };
    }),
  removeAdapter: (id) =>
    set((state) => ({
      adapters: state.adapters.filter((adapter) => adapter.id !== id),
      selectedAdapterRuntimeId: state.selectedAdapterRuntimeId === id ? null : state.selectedAdapterRuntimeId,
    })),
  updateAdapterStatus: (id, status) =>
    set((state) => ({
      adapters: state.adapters.map((adapter) =>
        adapter.id === id ? { ...adapter, status, updatedAt: Date.now() } : adapter,
      ),
    })),
  selectAdapter: (id) => set({ selectedAdapterRuntimeId: id }),
  reset: () =>
    set({
      adapters: [],
      selectedAdapterRuntimeId: null,
    }),
}));

export const useExecutionAdapters = () => useExecutionAdapterStore((state) => state.adapters);
export const useSelectedExecutionAdapter = () =>
  useExecutionAdapterStore((state) =>
    state.adapters.find((adapter) => adapter.id === state.selectedAdapterRuntimeId) ?? null,
  );
