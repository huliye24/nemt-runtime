/**
 * NEMT Runtime - Container View Store
 * Compatibility selectors that project layered container entities into UI view models.
 */

import { create } from 'zustand';

import { assembleContainerListItemViewModel, assembleLegacyContainerViewModel } from '@/services/container/containerViewAssembler';
import type { ContainerListItemViewModel, LegacyContainerViewModel } from '@/types/container';

import { useContainerBindingStore } from './containerBindingStore';
import { useContainerEnvelopeStore } from './containerEnvelopeStore';
import { useContainerObservationStore } from './containerObservationStore';
import { useContainerRuntimeStore } from './containerRuntimeStore';
import { useContainerSpecStore } from './containerSpecStore';

interface ContainerViewState {
  selectedContainerId: string | null;
  filter: 'all' | LegacyContainerViewModel['status'];
}

interface ContainerViewActions {
  selectContainer: (id: string | null) => void;
  setFilter: (filter: 'all' | LegacyContainerViewModel['status']) => void;
}

export const useContainerViewStore = create<ContainerViewState & ContainerViewActions>()((set) => ({
  selectedContainerId: null,
  filter: 'all',
  selectContainer: (id) => set({ selectedContainerId: id }),
  setFilter: (filter) => set({ filter }),
}));

function buildLegacyContainerViews(): LegacyContainerViewModel[] {
  const { specs } = useContainerSpecStore.getState();
  const { runtimes } = useContainerRuntimeStore.getState();
  const { observations } = useContainerObservationStore.getState();
  const { bindings } = useContainerBindingStore.getState();

  return runtimes.flatMap((runtime) => {
    const spec = specs.find((item) => item.id === runtime.specId);
    if (!spec) {
      return [];
    }

    const runtimeBindings = bindings.filter((binding) => binding.containerRuntimeId === runtime.id);

    return [assembleLegacyContainerViewModel(spec, runtime, observations[runtime.id], runtimeBindings)];
  });
}

function buildContainerListItems(): ContainerListItemViewModel[] {
  const { specs } = useContainerSpecStore.getState();
  const { runtimes } = useContainerRuntimeStore.getState();
  const { envelopes } = useContainerEnvelopeStore.getState();
  const { observations } = useContainerObservationStore.getState();
  const { bindings } = useContainerBindingStore.getState();

  return runtimes.flatMap((runtime) => {
    const spec = specs.find((item) => item.id === runtime.specId);
    if (!spec) {
      return [];
    }

    const envelope = runtime.envelopeId
      ? envelopes.find((item) => item.id === runtime.envelopeId) ?? null
      : null;
    const runtimeBindings = bindings.filter((binding) => binding.containerRuntimeId === runtime.id);

    return [assembleContainerListItemViewModel(spec, runtime, envelope, observations[runtime.id], runtimeBindings)];
  });
}

export const useLegacyContainers = () => {
  useContainerSpecStore((state) => state.specs);
  useContainerRuntimeStore((state) => state.runtimes);
  useContainerObservationStore((state) => state.observations);
  useContainerBindingStore((state) => state.bindings);

  return buildLegacyContainerViews();
};

export const useSelectedContainerId = () => useContainerViewStore((state) => state.selectedContainerId);
export const useContainerFilter = () => useContainerViewStore((state) => state.filter);
export const useFilteredContainers = () => {
  const containers = useLegacyContainers();
  const filter = useContainerViewStore((state) => state.filter);

  if (filter === 'all') {
    return containers;
  }

  return containers.filter((container) => container.status === filter);
};

export const useContainerListItems = () => {
  useContainerSpecStore((state) => state.specs);
  useContainerRuntimeStore((state) => state.runtimes);
  useContainerEnvelopeStore((state) => state.envelopes);
  useContainerObservationStore((state) => state.observations);
  useContainerBindingStore((state) => state.bindings);

  return buildContainerListItems();
};

export const useContainerStats = () => {
  const containers = useLegacyContainers();

  return {
    total: containers.length,
    running: containers.filter((container) => container.status === 'running').length,
    stopped: containers.filter((container) => container.status === 'stopped').length,
    error: containers.filter((container) => container.status === 'error').length,
  };
};

export const useIsRefreshing = () => useContainerRuntimeStore((state) => state.isRefreshing);
