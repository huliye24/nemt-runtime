import { useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { BarChart3, Database, FileStack, Server } from 'lucide-react';

import { DataMarket } from '@/components/data-market/DataMarket';
import { BacktestEngine } from '@/components/strategies';
import type { StrategyData } from '@/components/strategies';
import {
  createDefaultBacktestManifest,
} from '@/services/compute/backtestManifestFactory';
import { createDefaultComputeProviders } from '@/services/compute/computeProviderRegistry';
import {
  useBacktestManifestStore,
  useBacktestManifests,
  useComputeProviderStore,
  useComputeProviders,
} from '@/stores';
import { Colors } from '@/presets/presets';

type ComputeTab = 'backtest' | 'data';

export interface BacktestComputeProps {
  strategies: StrategyData[];
}

const TABS: { id: ComputeTab; label: string; icon: ElementType }[] = [
  { id: 'backtest', label: '批量回测', icon: BarChart3 },
  { id: 'data', label: '数据宇宙', icon: Database },
];

export function BacktestCompute({ strategies }: BacktestComputeProps) {
  const [activeTab, setActiveTab] = useState<ComputeTab>('backtest');
  const providers = useComputeProviders();
  const manifests = useBacktestManifests();
  const providerStore = useComputeProviderStore();
  const manifestStore = useBacktestManifestStore();

  useEffect(() => {
    if (providers.length > 0) {
      return;
    }

    const defaultProviders = createDefaultComputeProviders();
    providerStore.setProviders(defaultProviders);
    providerStore.selectProvider(defaultProviders[0]?.id ?? null);
  }, [providerStore, providers.length]);

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === providerStore.selectedProviderId) ?? providers[0] ?? null,
    [providerStore.selectedProviderId, providers],
  );

  const handleCreateManifest = () => {
    if (!selectedProvider) {
      return;
    }

    const manifest = createDefaultBacktestManifest(strategies, selectedProvider);
    manifestStore.upsertManifest(manifest);
    manifestStore.selectManifest(manifest.id);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-lg p-4 md:grid-cols-3" style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}>
        {providers.map((provider) => {
          const isSelected = selectedProvider?.id === provider.id;
          return (
            <button
              key={provider.id}
              onClick={() => providerStore.selectProvider(provider.id)}
              className="flex items-center gap-3 rounded-lg p-3 text-left transition-all"
              style={{
                backgroundColor: isSelected ? Colors.bgTertiary : 'transparent',
                border: `1px solid ${isSelected ? Colors.borderHover : Colors.border}`,
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: Colors.bgTertiary, color: Colors.success }}>
                <Server size={15} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium" style={{ color: Colors.text }}>{provider.name}</div>
                <div className="text-xs" style={{ color: Colors.textMuted }}>
                  {provider.capacity.cpuCores} CPU · {provider.capacity.memoryGb}GB · {provider.capacity.maxParallelJobs} jobs
                </div>
                <div className="text-xs mt-1" style={{ color: provider.status === 'ready' ? Colors.success : Colors.warning }}>
                  {provider.status}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg p-4" style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: Colors.bgTertiary, color: Colors.accent }}>
              <FileStack size={16} />
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: Colors.text }}>Batch Manifest</div>
              <div className="text-xs" style={{ color: Colors.textMuted }}>
                {manifests.length} manifests · {selectedProvider?.name ?? 'No provider selected'}
              </div>
            </div>
          </div>
          <button
            onClick={handleCreateManifest}
            disabled={!selectedProvider}
            className="rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: Colors.bgTertiary, color: Colors.text, border: `1px solid ${Colors.border}` }}
          >
            新建批量任务
          </button>
        </div>

        {manifests.length > 0 && (
          <div className="mt-4 grid gap-2">
            {manifests.slice(0, 3).map((manifest) => (
              <div
                key={manifest.id}
                className="grid grid-cols-4 gap-3 rounded-lg px-3 py-2 text-xs"
                style={{ backgroundColor: Colors.bgTertiary, color: Colors.textSecondary }}
              >
                <span className="truncate">{manifest.name}</span>
                <span>{manifest.estimatedRunCount} runs</span>
                <span>{manifest.dataUniverse.symbols.length} symbols</span>
                <span style={{ color: manifest.status === 'draft' ? Colors.warning : Colors.success }}>{manifest.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex w-fit items-center gap-1 rounded-lg p-1" style={{ backgroundColor: Colors.bgSecondary }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? Colors.bgTertiary : 'transparent',
                color: isActive ? Colors.text : Colors.textMuted,
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'backtest' ? <BacktestEngine strategies={strategies} /> : <DataMarket />}
    </div>
  );
}
