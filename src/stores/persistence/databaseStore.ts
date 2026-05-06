import { create } from 'zustand';

interface MigrationStatus {
  currentVersion: number;
  latestVersion: number;
  pending: Array<{ version: number; name: string }>;
  isUpToDate: boolean;
}

interface PersistenceState {
  isConnected: boolean;
  dbPath: string | null;
  migrationStatus: MigrationStatus | null;
  schemaTables: Array<{ name: string; sql: string }>;
  queryHistory: string[];
  isLoading: boolean;
  error: string | null;
  setConnected: (connected: boolean) => void;
  setDbPath: (path: string | null) => void;
  setMigrationStatus: (status: MigrationStatus | null) => void;
  setSchemaTables: (tables: Array<{ name: string; sql: string }>) => void;
  addQueryToHistory: (sql: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDatabaseStore = create<PersistenceState>((set) => ({
  isConnected: false,
  dbPath: null,
  migrationStatus: null,
  schemaTables: [],
  queryHistory: [],
  isLoading: false,
  error: null,
  setConnected: (connected) => set({ isConnected: connected }),
  setDbPath: (path) => set({ dbPath: path }),
  setMigrationStatus: (status) => set({ migrationStatus: status }),
  setSchemaTables: (tables) => set({ schemaTables: tables }),
  addQueryToHistory: (sql) => set((s) => ({
    queryHistory: [sql, ...s.queryHistory].slice(0, 100),
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
