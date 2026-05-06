/**
 * NEMT Runtime - Strategy Definition Store
 */

import { create } from 'zustand';

import type { StrategyDefinition } from '@/types/strategy';

interface StrategyDefinitionState {
  definitions: StrategyDefinition[];
  selectedDefinitionId: string | null;
}

interface StrategyDefinitionActions {
  addDefinition: (definition: StrategyDefinition) => void;
  updateDefinition: (id: string, updates: Partial<StrategyDefinition>) => void;
  removeDefinition: (id: string) => void;
  selectDefinition: (id: string | null) => void;
  setDefinitions: (definitions: StrategyDefinition[]) => void;
}

export const useStrategyDefinitionStore = create<StrategyDefinitionState & StrategyDefinitionActions>()((set) => ({
  definitions: [],
  selectedDefinitionId: null,
  addDefinition: (definition) => set((state) => ({ definitions: [...state.definitions, definition] })),
  updateDefinition: (id, updates) =>
    set((state) => ({
      definitions: state.definitions.map((definition) =>
        definition.id === id ? { ...definition, ...updates, updatedAt: Date.now() } : definition,
      ),
    })),
  removeDefinition: (id) =>
    set((state) => ({
      definitions: state.definitions.filter((definition) => definition.id !== id),
      selectedDefinitionId: state.selectedDefinitionId === id ? null : state.selectedDefinitionId,
    })),
  selectDefinition: (id) => set({ selectedDefinitionId: id }),
  setDefinitions: (definitions) => set({ definitions }),
}));

export const useStrategyDefinitions = () => useStrategyDefinitionStore((state) => state.definitions);
export const useSelectedStrategyDefinitionId = () =>
  useStrategyDefinitionStore((state) => state.selectedDefinitionId);
export const useSelectedStrategyDefinition = () =>
  useStrategyDefinitionStore((state) =>
    state.definitions.find((definition) => definition.id === state.selectedDefinitionId) ?? null,
  );
