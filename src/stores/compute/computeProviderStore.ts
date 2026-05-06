import { create } from 'zustand';

import type { ComputeProvider, ComputeProviderStatus } from '@/types/compute';

interface ComputeProviderState {
  providers: ComputeProvider[];
  selectedProviderId: string | null;
}

interface ComputeProviderActions {
  upsertProvider: (_provider: ComputeProvider) => void;
  updateProviderStatus: (_id: string, _status: ComputeProviderStatus) => void;
  selectProvider: (_id: string | null) => void;
  setProviders: (_providers: ComputeProvider[]) => void;
  reset: () => void;
}

export const useComputeProviderStore = create<ComputeProviderState & ComputeProviderActions>()((set) => ({
  providers: [],
  selectedProviderId: null,
  upsertProvider: (provider) =>
    set((state) => {
      const exists = state.providers.some((item) => item.id === provider.id);
      return {
        providers: exists
          ? state.providers.map((item) => (item.id === provider.id ? provider : item))
          : [provider, ...state.providers],
      };
    }),
  updateProviderStatus: (id, status) =>
    set((state) => ({
      providers: state.providers.map((provider) =>
        provider.id === id ? { ...provider, status, updatedAt: Date.now() } : provider,
      ),
    })),
  selectProvider: (id) => set({ selectedProviderId: id }),
  setProviders: (providers) => set({ providers }),
  reset: () => set({ providers: [], selectedProviderId: null }),
}));

export const useComputeProviders = () => useComputeProviderStore((state) => state.providers);
export const useSelectedComputeProvider = () =>
  useComputeProviderStore((state) =>
    state.providers.find((provider) => provider.id === state.selectedProviderId) ?? null,
  );
