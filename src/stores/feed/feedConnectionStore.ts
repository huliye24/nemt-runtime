import { create } from 'zustand';

interface FeedConnection {
  id: string;
  exchange: string;
  status: string;
  subscribedSymbols: string[];
  messageCount: number;
}

interface FeedConnectionState {
  connections: FeedConnection[];
  activeCount: number;
  totalSymbols: number;
  setConnections: (connections: FeedConnection[]) => void;
  addConnection: (connection: FeedConnection) => void;
  removeConnection: (id: string) => void;
  updateConnection: (id: string, update: Partial<FeedConnection>) => void;
}

export const useFeedConnectionStore = create<FeedConnectionState>((set) => ({
  connections: [],
  activeCount: 0,
  totalSymbols: 0,
  setConnections: (connections) => set({
    connections,
    activeCount: connections.filter((c) => c.status === 'connected').length,
    totalSymbols: connections.reduce((s, c) => s + c.subscribedSymbols.length, 0),
  }),
  addConnection: (connection) => set((s) => {
    const connections = [...s.connections, connection];
    return {
      connections,
      activeCount: connections.filter((c) => c.status === 'connected').length,
      totalSymbols: connections.reduce((sum, c) => sum + c.subscribedSymbols.length, 0),
    };
  }),
  removeConnection: (id) => set((s) => {
    const connections = s.connections.filter((c) => c.id !== id);
    return {
      connections,
      activeCount: connections.filter((c) => c.status === 'connected').length,
      totalSymbols: connections.reduce((sum, c) => sum + c.subscribedSymbols.length, 0),
    };
  }),
  updateConnection: (id, update) => set((s) => {
    const connections = s.connections.map((c) => (c.id === id ? { ...c, ...update } : c));
    return {
      connections,
      activeCount: connections.filter((c) => c.status === 'connected').length,
      totalSymbols: connections.reduce((sum, c) => sum + c.subscribedSymbols.length, 0),
    };
  }),
}));
