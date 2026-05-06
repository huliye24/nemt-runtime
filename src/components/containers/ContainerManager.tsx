/**
 * NEMT Platform - Container Manager Component
 * Store-backed container management with create and detail views.
 */

import React, { useMemo, useState } from 'react';

import {
  useContainerFilter,
  useContainerRuntimeStore,
  useContainerStats,
  useContainerViewStore,
  useFilteredContainers,
  useIsRefreshing,
} from '@/stores';
import type { LegacyContainerViewModel } from '@/types';

import {
  ContainerCard,
  ContainerDetailPanel,
  ContainerToolbar,
  ContainerStats,
  ContainerEmptyState,
} from './components';

type FilterStatus = 'all' | 'running' | 'stopped' | 'error';

export function ContainerManager({ onCreateNew }: { onCreateNew: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containers = useFilteredContainers();
  const stats = useContainerStats();
  const filter = useContainerFilter();
  const isRefreshing = useIsRefreshing();
  const setFilter = useContainerViewStore((state) => state.setFilter);
  const updateRuntime = useContainerRuntimeStore((state) => state.updateRuntime);
  const setRefreshing = useContainerRuntimeStore((state) => state.setRefreshing);

  const selectedContainer = useMemo(
    () => containers.find((container) => container.id === selectedId) ?? null,
    [containers, selectedId],
  );

  const handleStart = (id: string) => {
    updateRuntime(id, {
      status: 'running',
      health: 'healthy',
      startedAt: Date.now(),
      resources: {
        cpuPercent: 15,
        memory: {
          used: 384,
          limit: 512,
          unit: 'mb',
        },
      },
    });
  };

  const handleStop = (id: string) => {
    updateRuntime(id, {
      status: 'stopped',
      resources: {
        cpuPercent: 0,
        memory: {
          used: 0,
          limit: 512,
          unit: 'mb',
        },
      },
      stoppedAt: Date.now(),
    });
  };

  const handleDelete = (id: string) => {
    useContainerRuntimeStore.getState().removeRuntime(id);
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      useContainerRuntimeStore.getState().setRuntimes(
        useContainerRuntimeStore.getState().runtimes.map((runtime) =>
          runtime.status === 'running'
            ? {
                ...runtime,
                resources: {
                  ...runtime.resources,
                  cpuPercent: Math.floor(Math.random() * 60) + 10,
                },
                updatedAt: Date.now(),
              }
            : runtime,
        ),
      );
      setRefreshing(false);
    }, 1000);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 space-y-6">
        <ContainerToolbar
          filter={filter as FilterStatus}
          isRefreshing={isRefreshing}
          onCreateNew={onCreateNew}
          onRefresh={handleRefresh}
          onFilterChange={setFilter}
        />

        <ContainerStats
          total={stats.total}
          running={stats.running}
          stopped={stats.stopped}
          error={stats.error}
        />

        {containers.length === 0 ? (
          <ContainerEmptyState onCreateNew={onCreateNew} />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {containers.map((container: LegacyContainerViewModel) => (
              <ContainerCard
                key={container.id}
                container={container}
                isSelected={selectedId === container.id}
                onStart={() => handleStart(container.id)}
                onStop={() => handleStop(container.id)}
                onDelete={() => handleDelete(container.id)}
                onViewLogs={() => setSelectedId(container.id)}
                onSelect={() => setSelectedId(container.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedContainer && (
        <ContainerDetailPanel
          container={selectedContainer}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

export default ContainerManager;
