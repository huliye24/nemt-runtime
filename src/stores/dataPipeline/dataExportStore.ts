import { create } from 'zustand';

interface ExportRecord {
  path: string;
  format: string;
  rowCount: number;
  fileSize: number;
  exportedAt: number;
}

interface DataExportState {
  lastExport: ExportRecord | null;
  exportHistory: ExportRecord[];
  isExporting: boolean;
  setLastExport: (record: ExportRecord) => void;
  addToHistory: (record: ExportRecord) => void;
  setExporting: (exporting: boolean) => void;
  clearHistory: () => void;
}

export const useDataExportStore = create<DataExportState>((set) => ({
  lastExport: null,
  exportHistory: [],
  isExporting: false,
  setLastExport: (record) => set({ lastExport: record, isExporting: false }),
  addToHistory: (record) => set((s) => ({ exportHistory: [record, ...s.exportHistory] })),
  setExporting: (exporting) => set({ isExporting: exporting }),
  clearHistory: () => set({ exportHistory: [] }),
}));
