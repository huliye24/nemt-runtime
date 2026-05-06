/**
 * NEMT Runtime - Container Runtime Store
 */

import { create } from 'zustand';

import type { ContainerRuntime, ContainerRuntimeStatus } from '@/types/container';

interface ContainerRuntimeState {
  runtimes: ContainerRuntime[];
  selectedRuntimeId: string | null;
  isRefreshing: boolean;
  filter: 'all' | ContainerRuntimeStatus;
}

interface ContainerRuntimeActions {
  addRuntime: (runtime: ContainerRuntime) => void;
  updateRuntime: (id: string, updates: Partial<ContainerRuntime>) => void;
  removeRuntime: (id: string) => void;
  selectRuntime: (id: string | null) => void;
  setRuntimes: (runtimes: ContainerRuntime[]) => void;
  setRefreshing: (value: boolean) => void;
  setFilter: (filter: 'all' | ContainerRuntimeStatus) => void;
  attachBindingId: (runtimeId: string, bindingId: string) => void;
  detachBindingId: (runtimeId: string, bindingId: string) => void;
  updateHeartbeat: (runtimeId: string, timestamp: number) => void;
}

export const useContainerRuntimeStore = create<ContainerRuntimeState & ContainerRuntimeActions>()((set, get) => ({
  runtimes: [],
  selectedRuntimeId: null,
  isRefreshing: false,
  filter: 'all',
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
  setRefreshing: (value) => set({ isRefreshing: value }),
  setFilter: (filter) => set({ filter }),
  attachBindingId: (runtimeId, bindingId) =>
    set((state) => ({
      runtimes: state.runtimes.map((runtime) =>
        runtime.id === runtimeId && !runtime.activeBindingIds.includes(bindingId)
          ? { ...runtime, activeBindingIds: [...runtime.activeBindingIds, bindingId], updatedAt: Date.now() }
          : runtime,
      ),
    })),
  detachBindingId: (runtimeId, bindingId) =>
    set((state) => ({
      runtimes: state.runtimes.map((runtime) =>
        runtime.id === runtimeId
          ? {
              ...runtime,
              activeBindingIds: runtime.activeBindingIds.filter((id) => id !== bindingId),
              updatedAt: Date.now(),
            }
          : runtime,
      ),
    })),
  updateHeartbeat: (runtimeId, timestamp) =>
    set((state) => ({
      runtimes: state.runtimes.map((runtime) =>
        runtime.id === runtimeId ? { ...runtime, lastHeartbeatAt: timestamp, updatedAt: Date.now() } : runtime,
      ),
    })),
}));

export const useContainerRuntimes = () => useContainerRuntimeStore((state) => state.runtimes);
export const useSelectedContainerRuntimeId = () => useContainerRuntimeStore((state) => state.selectedRuntimeId);
export const useSelectedContainerRuntime = () =>
  useContainerRuntimeStore((state) => state.runtimes.find((runtime) => runtime.id === state.selectedRuntimeId) ?? null);
export const useIsContainerRuntimeRefreshing = () => useContainerRuntimeStore((state) => state.isRefreshing);
export const useContainerRuntimeFilter = () => useContainerRuntimeStore((state) => state.filter);
export const useFilteredContainerRuntimes = () =>
  useContainerRuntimeStore((state) => {
    if (state.filter === 'all') {
      return state.runtimes;
    }

    return state.runtimes.filter((runtime) => runtime.status === state.filter);
  });
export const useContainerRuntimeStats = () =>
  useContainerRuntimeStore((state) => ({
    total: state.runtimes.length,
    running: state.runtimes.filter((runtime) => runtime.status === 'running').length,
    stopped: state.runtimes.filter((runtime) => runtime.status === 'stopped').length,
    failed: state.runtimes.filter((runtime) => runtime.status === 'failed').length,
    quarantined: state.runtimes.filter((runtime) => runtime.status === 'quarantined').length,
  }));
