/**
 * NEMT Runtime - Container Spec Store
 */

import { create } from 'zustand';

import type { ContainerBoundaryKind, ContainerSpec } from '@/types/container';

interface ContainerSpecState {
  specs: ContainerSpec[];
  selectedSpecId: string | null;
}

interface ContainerSpecActions {
  addSpec: (spec: ContainerSpec) => void;
  updateSpec: (id: string, updates: Partial<ContainerSpec>) => void;
  removeSpec: (id: string) => void;
  selectSpec: (id: string | null) => void;
  setSpecs: (specs: ContainerSpec[]) => void;
}

export const useContainerSpecStore = create<ContainerSpecState & ContainerSpecActions>()((set) => ({
  specs: [],
  selectedSpecId: null,
  addSpec: (spec) => set((state) => ({ specs: [...state.specs, spec] })),
  updateSpec: (id, updates) =>
    set((state) => ({
      specs: state.specs.map((spec) => (spec.id === id ? { ...spec, ...updates, updatedAt: Date.now() } : spec)),
    })),
  removeSpec: (id) =>
    set((state) => ({
      specs: state.specs.filter((spec) => spec.id !== id),
      selectedSpecId: state.selectedSpecId === id ? null : state.selectedSpecId,
    })),
  selectSpec: (id) => set({ selectedSpecId: id }),
  setSpecs: (specs) => set({ specs }),
}));

export const useContainerSpecs = () => useContainerSpecStore((state) => state.specs);
export const useSelectedContainerSpecId = () => useContainerSpecStore((state) => state.selectedSpecId);
export const useSelectedContainerSpec = () =>
  useContainerSpecStore((state) => state.specs.find((spec) => spec.id === state.selectedSpecId) ?? null);
export const useContainerSpecsByBoundaryKind = (boundaryKind: ContainerBoundaryKind) =>
  useContainerSpecStore((state) => state.specs.filter((spec) => spec.boundaryKind === boundaryKind));
