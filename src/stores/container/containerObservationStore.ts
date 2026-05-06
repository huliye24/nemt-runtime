/**
 * NEMT Runtime - Container Observation Store
 */

import { create } from 'zustand';

import type { ContainerObservation } from '@/types/container';

interface ContainerObservationState {
  observations: Record<string, ContainerObservation>;
}

interface ContainerObservationActions {
  setObservation: (observation: ContainerObservation) => void;
  updateObservation: (runtimeId: string, updates: Partial<ContainerObservation>) => void;
  removeObservation: (runtimeId: string) => void;
  appendEventRef: (runtimeId: string, eventId: string) => void;
  setAlertRefs: (runtimeId: string, alertIds: string[]) => void;
}

export const useContainerObservationStore = create<ContainerObservationState & ContainerObservationActions>()((set) => ({
  observations: {},
  setObservation: (observation) =>
    set((state) => ({
      observations: {
        ...state.observations,
        [observation.containerRuntimeId]: observation,
      },
    })),
  updateObservation: (runtimeId, updates) =>
    set((state) => {
      const current = state.observations[runtimeId];
      if (!current) {
        return state;
      }

      return {
        observations: {
          ...state.observations,
          [runtimeId]: {
            ...current,
            ...updates,
            updatedAt: Date.now(),
          },
        },
      };
    }),
  removeObservation: (runtimeId) =>
    set((state) => {
      const next = { ...state.observations };
      delete next[runtimeId];
      return { observations: next };
    }),
  appendEventRef: (runtimeId, eventId) =>
    set((state) => {
      const current = state.observations[runtimeId];
      if (!current || current.latestEventIds.includes(eventId)) {
        return state;
      }

      return {
        observations: {
          ...state.observations,
          [runtimeId]: {
            ...current,
            latestEventIds: [eventId, ...current.latestEventIds].slice(0, 50),
            updatedAt: Date.now(),
          },
        },
      };
    }),
  setAlertRefs: (runtimeId, alertIds) =>
    set((state) => {
      const current = state.observations[runtimeId];
      if (!current) {
        return state;
      }

      return {
        observations: {
          ...state.observations,
          [runtimeId]: {
            ...current,
            alertIds,
            updatedAt: Date.now(),
          },
        },
      };
    }),
}));

export const useContainerObservations = () => useContainerObservationStore((state) => state.observations);
export const useContainerObservation = (runtimeId: string) =>
  useContainerObservationStore((state) => state.observations[runtimeId] ?? null);
export const useContainerMetrics = (runtimeId: string) =>
  useContainerObservationStore((state) => state.observations[runtimeId]?.metrics ?? null);
export const useContainerDependencyHealth = (runtimeId: string) =>
  useContainerObservationStore((state) => state.observations[runtimeId]?.dependencyHealth ?? []);
