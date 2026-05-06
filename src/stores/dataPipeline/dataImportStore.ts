import { create } from 'zustand';

interface ImportJob {
  jobId: string;
  status: string;
  progress: number;
  processedRows: number;
  totalRows?: number;
  errors: string[];
}

interface DataImportState {
  activeJobs: ImportJob[];
  importHistory: ImportJob[];
  isImporting: boolean;
  addJob: (job: ImportJob) => void;
  updateJob: (jobId: string, update: Partial<ImportJob>) => void;
  removeJob: (jobId: string) => void;
  clearHistory: () => void;
}

export const useDataImportStore = create<DataImportState>((set) => ({
  activeJobs: [],
  importHistory: [],
  isImporting: false,
  addJob: (job) => set((s) => ({ activeJobs: [...s.activeJobs, job], isImporting: true })),
  updateJob: (jobId, update) => set((s) => ({
    activeJobs: s.activeJobs.map((j) => (j.jobId === jobId ? { ...j, ...update } : j)),
  })),
  removeJob: (jobId) => set((s) => {
    const job = s.activeJobs.find((j) => j.jobId === jobId);
    return {
      activeJobs: s.activeJobs.filter((j) => j.jobId !== jobId),
      importHistory: job ? [job, ...s.importHistory] : s.importHistory,
      isImporting: s.activeJobs.length > 1,
    };
  }),
  clearHistory: () => set({ importHistory: [] }),
}));
