import { create } from 'zustand';

interface TelemetryEvent {
  id: string;
  category: string;
  name: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

interface TelemetryState {
  enabled: boolean;
  events: TelemetryEvent[];
  stats: { total: number; byCategory: Record<string, number>; sessionStart: number };
  setEnabled: (enabled: boolean) => void;
  setEvents: (events: TelemetryEvent[]) => void;
  addEvent: (event: TelemetryEvent) => void;
  setStats: (stats: TelemetryState['stats']) => void;
  clearEvents: () => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  enabled: false,
  events: [],
  stats: { total: 0, byCategory: {}, sessionStart: Date.now() },
  setEnabled: (enabled) => set({ enabled }),
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((s) => ({ events: [...s.events, event].slice(-1000) })),
  setStats: (stats) => set({ stats }),
  clearEvents: () => set({ events: [] }),
}));
