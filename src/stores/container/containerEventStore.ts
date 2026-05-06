/**
 * NEMT Runtime - Container Event Store
 */

import { create } from 'zustand';

import type { ContainerEvent } from '@/types/container';

interface ContainerEventState {
  events: ContainerEvent[];
}

interface ContainerEventActions {
  addEvent: (event: ContainerEvent) => void;
  setEvents: (events: ContainerEvent[]) => void;
  clearEventsForRuntime: (containerRuntimeId: string) => void;
}

export const useContainerEventStore = create<ContainerEventState & ContainerEventActions>()((set) => ({
  events: [],
  addEvent: (event) => set((state) => ({ events: [event, ...state.events] })),
  setEvents: (events) => set({ events }),
  clearEventsForRuntime: (containerRuntimeId) =>
    set((state) => ({
      events: state.events.filter((event) => event.containerRuntimeId !== containerRuntimeId),
    })),
}));

export const useContainerEvents = () => useContainerEventStore((state) => state.events);
export const useContainerEventsByRuntimeId = (containerRuntimeId: string) =>
  useContainerEventStore((state) =>
    state.events.filter((event) => event.containerRuntimeId === containerRuntimeId),
  );
