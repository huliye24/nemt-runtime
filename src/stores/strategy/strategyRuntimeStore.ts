/**
 * NEMT Runtime - Strategy Runtime Store
 */

import { create } from 'zustand';

import type { StrategyRuntime, StrategyStatus } from '@/types/strategy';

interface StrategyRuntimeState {
  runtimes: StrategyRuntime[];
  selectedRuntimeId: string | null;
}

interface StrategyRuntimeActions {
  addRuntime: (runtime: StrategyRuntime) => void;
  updateRuntime: (id: string, updates: Partial<StrategyRuntime>) => void;
  removeRuntime: (id: string) => void;
  selectRuntime: (id: string | null) => void;
  setRuntimes: (runtimes: StrategyRuntime[]) => void;
  updateHeartbeat: (id: string, timestamp: number) => void;
}

export const useStrategyRuntimeStore = create<StrategyRuntimeState & StrategyRuntimeActions>()((set) => ({
  runtimes: [],
  selectedRuntimeId: null,
  addRuntime: (runtime) => set((state) => ({ runtimes: [...state.runtimes, runtime] })),
  updateRuntime: (id, updates) =>
    set((state) => ({
      runtimes: state.runtimes.map((runtime) =>
        runtime.id === id ? { ...runtime, ...updates, updatedAt: Date.now() } : runtime,
      ),
    })),
  removeRuntime: (id) =>
    set((state) => ({
      runtimes: state.runtimes.filter((runtime) => runtime.id !== id),
      selectedRuntimeId: state.selectedRuntimeId === id ? null : state.selectedRuntimeId,
    })),
  selectRuntime: (id) => set({ selectedRuntimeId: id }),
  setRuntimes: (runtimes) => set({ runtimes }),
  updateHeartbeat: (id, timestamp) =>
    set((state) => ({
      runtimes: state.runtimes.map((runtime) =>
        runtime.id === id ? { ...runtime, lastHeartbeatAt: timestamp, updatedAt: Date.now() } : runtime,
      ),
    })),
}));

export const useStrategyRuntimes = () => useStrategyRuntimeStore((state) => state.runtimes);
export const useSelectedStrategyRuntimeId = () => useStrategyRuntimeStore((state) => state.selectedRuntimeId);
export const useSelectedStrategyRuntime = () =>
  useStrategyRuntimeStore((state) =>
    state.runtimes.find((runtime) => runtime.id === state.selectedRuntimeId) ?? null,
  );
export const useStrategyRuntimeByDefinitionId = (strategyDefinitionId: string) =>
  useStrategyRuntimeStore((state) =>
    state.runtimes.find((runtime) => runtime.strategyDefinitionId === strategyDefinitionId) ?? null,
  );
export const useStrategyRuntimesByStatus = (status: StrategyStatus) =>
  useStrategyRuntimeStore((state) => state.runtimes.filter((runtime) => runtime.status === status));
