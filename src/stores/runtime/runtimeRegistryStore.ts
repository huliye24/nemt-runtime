/**
 * NEMT Runtime - Runtime Registry Store
 */

import { create } from 'zustand';

import type { RuntimeKind, RuntimeRegistryEntry } from '@/runtime/registry/runtimeRegistryTypes';

interface RuntimeRegistryState {
  entries: RuntimeRegistryEntry[];
}

interface RuntimeRegistryActions {
  upsertEntry: (entry: RuntimeRegistryEntry) => void;
  removeEntry: (runtimeId: string) => void;
  setEntries: (entries: RuntimeRegistryEntry[]) => void;
  appendEventId: (runtimeId: string, eventId: string) => void;
  setRelatedEntityRefs: (runtimeId: string, refs: RuntimeRegistryEntry['relatedEntityRefs']) => void;
}

export const useRuntimeRegistryStore = create<RuntimeRegistryState & RuntimeRegistryActions>()((set) => ({
  entries: [],
  upsertEntry: (entry) =>
    set((state) => {
      const exists = state.entries.some((item) => item.runtimeId === entry.runtimeId);
      if (!exists) {
        return { entries: [...state.entries, entry] };
      }

      return {
        entries: state.entries.map((item) => (item.runtimeId === entry.runtimeId ? entry : item)),
      };
    }),
  removeEntry: (runtimeId) =>
    set((state) => ({
      entries: state.entries.filter((entry) => entry.runtimeId !== runtimeId),
    })),
  setEntries: (entries) => set({ entries }),
  appendEventId: (runtimeId, eventId) =>
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.runtimeId === runtimeId && !entry.latestEventIds.includes(eventId)
          ? {
              ...entry,
              latestEventIds: [eventId, ...entry.latestEventIds].slice(0, 50),
              updatedAt: Date.now(),
            }
          : entry,
      ),
    })),
  setRelatedEntityRefs: (runtimeId, refs) =>
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.runtimeId === runtimeId
          ? {
              ...entry,
              relatedEntityRefs: refs,
              updatedAt: Date.now(),
            }
          : entry,
      ),
    })),
}));

export const useRuntimeRegistryEntries = () => useRuntimeRegistryStore((state) => state.entries);
export const useRuntimeEntryById = (runtimeId: string) =>
  useRuntimeRegistryStore((state) => state.entries.find((entry) => entry.runtimeId === runtimeId) ?? null);
export const useRuntimeEntriesByKind = (runtimeKind: RuntimeKind) =>
  useRuntimeRegistryStore((state) => state.entries.filter((entry) => entry.runtimeKind === runtimeKind));
export const useRuntimeEntriesByContainer = (containerRuntimeId: string) =>
  useRuntimeRegistryStore((state) =>
    state.entries.filter((entry) => entry.containerRuntimeId === containerRuntimeId),
  );
export const useFailedRuntimeEntries = () =>
  useRuntimeRegistryStore((state) =>
    state.entries.filter((entry) => ['failed', 'degraded', 'quarantined'].includes(entry.status)),
  );
