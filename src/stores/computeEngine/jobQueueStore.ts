import { create } from 'zustand';

interface ComputeJob {
  id: string;
  type: string;
  priority: number;
  status: string;
  progress: number;
  submittedAt: number;
  completedAt?: number;
  error?: string;
}

interface JobQueueState {
  queue: ComputeJob[];
  history: ComputeJob[];
  queueLength: number;
  activeCount: number;
  setQueue: (queue: ComputeJob[]) => void;
  updateJob: (id: string, update: Partial<ComputeJob>) => void;
  setHistory: (history: ComputeJob[]) => void;
}

export const useJobQueueStore = create<JobQueueState>((set) => ({
  queue: [],
  history: [],
  queueLength: 0,
  activeCount: 0,
  setQueue: (queue) => set({
    queue,
    queueLength: queue.filter((j) => j.status === 'queued').length,
    activeCount: queue.filter((j) => j.status === 'running').length,
  }),
  updateJob: (id, update) => set((s) => {
    const queue = s.queue.map((j) => (j.id === id ? { ...j, ...update } : j));
    return {
      queue,
      queueLength: queue.filter((j) => j.status === 'queued').length,
      activeCount: queue.filter((j) => j.status === 'running').length,
    };
  }),
  setHistory: (history) => set({ history }),
}));
