import { create } from 'zustand';

interface ProcessInfo {
  id: string;
  pid: number | undefined;
  status: string;
  startedAt: number;
  exitCode: number | null;
}

interface ProcessPoolState {
  processes: ProcessInfo[];
  maxProcesses: number;
  activeCount: number;
  setProcesses: (processes: ProcessInfo[]) => void;
  updateProcess: (id: string, update: Partial<ProcessInfo>) => void;
  setMaxProcesses: (max: number) => void;
}

export const useProcessPoolStore = create<ProcessPoolState>((set) => ({
  processes: [],
  maxProcesses: 4,
  activeCount: 0,
  setProcesses: (processes) => set({
    processes,
    activeCount: processes.filter((p) => p.status === 'running').length,
  }),
  updateProcess: (id, update) => set((s) => {
    const processes = s.processes.map((p) => (p.id === id ? { ...p, ...update } : p));
    return { processes, activeCount: processes.filter((p) => p.status === 'running').length };
  }),
  setMaxProcesses: (max) => set({ maxProcesses: max }),
}));
