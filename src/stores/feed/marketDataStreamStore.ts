import { create } from 'zustand';

interface StreamEvent {
  channel: string;
  type: string;
  symbol?: string;
  data: unknown;
  timestamp: number;
}

interface MarketDataStreamState {
  events: StreamEvent[];
  bufferSize: number;
  maxBufferSize: number;
  isStreaming: boolean;
  pushEvent: (event: StreamEvent) => void;
  setBuffer: (events: StreamEvent[]) => void;
  clearBuffer: () => void;
  setStreaming: (streaming: boolean) => void;
}

export const useMarketDataStreamStore = create<MarketDataStreamState>((set) => ({
  events: [],
  bufferSize: 0,
  maxBufferSize: 5000,
  isStreaming: false,
  pushEvent: (event) => set((s) => {
    const events = [...s.events, event].slice(-s.maxBufferSize);
    return { events, bufferSize: events.length };
  }),
  setBuffer: (events) => set({ events, bufferSize: events.length }),
  clearBuffer: () => set({ events: [], bufferSize: 0 }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
}));
