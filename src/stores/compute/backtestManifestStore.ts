import { create } from 'zustand';

import type { BacktestComputeManifest, ComputeBacktestJobStatus } from '@/types/compute';

interface BacktestManifestState {
  manifests: BacktestComputeManifest[];
  selectedManifestId: string | null;
}

interface BacktestManifestActions {
  upsertManifest: (_manifest: BacktestComputeManifest) => void;
  updateManifestStatus: (_id: string, _status: ComputeBacktestJobStatus) => void;
  appendResultId: (_id: string, _resultId: string) => void;
  selectManifest: (_id: string | null) => void;
  reset: () => void;
}

export const useBacktestManifestStore = create<BacktestManifestState & BacktestManifestActions>()((set) => ({
  manifests: [],
  selectedManifestId: null,
  upsertManifest: (manifest) =>
    set((state) => {
      const exists = state.manifests.some((item) => item.id === manifest.id);
      return {
        manifests: exists
          ? state.manifests.map((item) => (item.id === manifest.id ? manifest : item))
          : [manifest, ...state.manifests],
      };
    }),
  updateManifestStatus: (id, status) =>
    set((state) => ({
      manifests: state.manifests.map((manifest) =>
        manifest.id === id ? { ...manifest, status, updatedAt: Date.now() } : manifest,
      ),
    })),
  appendResultId: (id, resultId) =>
    set((state) => ({
      manifests: state.manifests.map((manifest) =>
        manifest.id === id && !manifest.resultIds.includes(resultId)
          ? { ...manifest, resultIds: [resultId, ...manifest.resultIds], updatedAt: Date.now() }
          : manifest,
      ),
    })),
  selectManifest: (id) => set({ selectedManifestId: id }),
  reset: () => set({ manifests: [], selectedManifestId: null }),
}));

export const useBacktestManifests = () => useBacktestManifestStore((state) => state.manifests);
export const useSelectedBacktestManifest = () =>
  useBacktestManifestStore((state) =>
    state.manifests.find((manifest) => manifest.id === state.selectedManifestId) ?? null,
  );
