import { create } from 'zustand';

interface OHLCVBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface DownloadProgress {
  requestId: string;
  status: string;
  progress: number;
  downloadedBars: number;
}

interface HistoricalDataState {
  bars: Record<string, OHLCVBar[]>;
  activeDownloads: DownloadProgress[];
  isLoading: boolean;
  error: string | null;
  setBars: (key: string, bars: OHLCVBar[]) => void;
  addDownload: (download: DownloadProgress) => void;
  updateDownload: (requestId: string, update: Partial<DownloadProgress>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useHistoricalDataStore = create<HistoricalDataState>((set) => ({
  bars: {},
  activeDownloads: [],
  isLoading: false,
  error: null,
  setBars: (key, bars) => set((s) => ({ bars: { ...s.bars, [key]: bars } })),
  addDownload: (download) => set((s) => ({ activeDownloads: [...s.activeDownloads, download] })),
  updateDownload: (requestId, update) => set((s) => ({
    activeDownloads: s.activeDownloads.map((d) => (d.requestId === requestId ? { ...d, ...update } : d)),
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
