import { create } from 'zustand';

interface CrossWindowMessage {
  id: string;
  sourceWindowId: number;
  targetWindowId: number | 'all';
  type: string;
  payload: unknown;
  timestamp: number;
}

interface CrossWindowState {
  messages: CrossWindowMessage[];
  maxMessages: number;
  pushMessage: (message: CrossWindowMessage) => void;
  clearMessages: () => void;
}

export const useCrossWindowStore = create<CrossWindowState>((set) => ({
  messages: [],
  maxMessages: 500,
  pushMessage: (message) => set((s) => ({
    messages: [...s.messages, message].slice(-s.maxMessages),
  })),
  clearMessages: () => set({ messages: [] }),
}));
