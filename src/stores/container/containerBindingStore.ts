/**
 * NEMT Runtime - Container Binding Store
 */

import { create } from 'zustand';

import type { ContainerBinding, RuntimeUnitKind } from '@/types/container';

interface ContainerBindingState {
  bindings: ContainerBinding[];
}

interface ContainerBindingActions {
  addBinding: (binding: ContainerBinding) => void;
  updateBinding: (id: string, updates: Partial<ContainerBinding>) => void;
  removeBinding: (id: string) => void;
  setBindings: (bindings: ContainerBinding[]) => void;
}

export const useContainerBindingStore = create<ContainerBindingState & ContainerBindingActions>()((set) => ({
  bindings: [],
  addBinding: (binding) => set((state) => ({ bindings: [...state.bindings, binding] })),
  updateBinding: (id, updates) =>
    set((state) => ({
      bindings: state.bindings.map((binding) =>
        binding.id === id ? { ...binding, ...updates, updatedAt: Date.now() } : binding,
      ),
    })),
  removeBinding: (id) =>
    set((state) => ({
      bindings: state.bindings.filter((binding) => binding.id !== id),
    })),
  setBindings: (bindings) => set({ bindings }),
}));

export const useContainerBindings = () => useContainerBindingStore((state) => state.bindings);
export const useBindingsByRuntimeId = (containerRuntimeId: string) =>
  useContainerBindingStore((state) =>
    state.bindings.filter((binding) => binding.containerRuntimeId === containerRuntimeId),
  );
export const useBindingsByRuntimeUnitKind = (runtimeUnitKind: RuntimeUnitKind) =>
  useContainerBindingStore((state) =>
    state.bindings.filter((binding) => binding.runtimeUnitKind === runtimeUnitKind),
  );
