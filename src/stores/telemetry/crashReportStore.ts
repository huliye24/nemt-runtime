import { create } from 'zustand';

interface CrashReport {
  id: string;
  crashDate: string;
  crashType: string;
  appVersion: string;
  platform: string;
}

interface CrashReportState {
  lastReport: CrashReport | null;
  uploadedReports: CrashReport[];
  reports: CrashReport[];
  setLastReport: (report: CrashReport | null) => void;
  setUploadedReports: (reports: CrashReport[]) => void;
  setReports: (reports: CrashReport[]) => void;
  addReport: (report: CrashReport) => void;
}

export const useCrashReportStore = create<CrashReportState>((set) => ({
  lastReport: null,
  uploadedReports: [],
  reports: [],
  setLastReport: (report) => set({ lastReport: report }),
  setUploadedReports: (reports) => set({ uploadedReports: reports }),
  setReports: (reports) => set({ reports }),
  addReport: (report) => set((s) => ({ reports: [report, ...s.reports].slice(0, 100) })),
}));
