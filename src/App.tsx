/**
 * NEMT Platform - Main App Component
 * Runtime shell orchestration
 */

import React, { useEffect, useState } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { CreateContainerModal } from './components/containers/CreateContainerModal';
import { PlatformHeader } from './components/platform/PlatformHeader';
import { CreatePortfolioModal } from './components/portfolio/CreatePortfolioModal';
import { PublishPortfolioModal } from './components/portfolio/PublishPortfolioModal';
import {
  CreateStrategyModal,
  StrategyData,
} from './components/strategies';
import { PublishStrategyModal, PublishSettings } from './components/strategies/PublishStrategyModal';
import type { MarketStrategy } from './components/strategies/StrategyMarket';
import { AppShell } from './components/platform/AppShell';
import { AppViewRouter, VIEW_DESCRIPTIONS, VIEW_TITLES } from './components/platform/AppViewRouter';
import { bootstrapRuntime } from './bootstrap/runtimeBootstrap';
import { MOCK_MARKET_STRATEGIES } from './demo';
import { createContainerBoundary } from './orchestrators/containerOrchestrator';
import {
  useIsAuthenticated,
  useRuntimeRegistryStore,
  useStrategyDefinitionStore,
  useStrategyRuntimeStore,
} from './stores';
import {
  createStrategyRuntimeRegistryEntry,
} from './runtime/registry/runtimeRegistry';
import { useBacktestStore } from './stores/backtestStore';
import { usePortfolioStore } from './stores/portfolioStore';
import { COLOR_THEMES, useUIStore } from './stores/uiStore';
import type {
  StrategyDefinition,
  StrategyRuntime,
  ViewId,
} from './types';
import type {
  MarketPortfolio,
  PortfolioData,
  PublishSettings as PortfolioPublishSettings,
} from './types/portfolio';

const INITIAL_STRATEGIES: StrategyData[] = [
  {
    id: 'strategy_demo_1',
    name: '双均线趋势策略',
    code: `# 双均线趋势策略
class DualMAStrategy:
    def __init__(self, fast=10, slow=30):
        self.fast = fast
        self.slow = slow
`,
    createdAt: new Date('2024-01-15'),
    status: 'ready',
  },
  {
    id: 'strategy_demo_2',
    name: 'RSI 超卖策略',
    code: `# RSI 超卖策略
class RSIStrategy:
    def __init__(self, period=14, oversold=30, overbought=70):
        self.period = period
`,
    createdAt: new Date('2024-02-20'),
    status: 'ready',
  },
  {
    id: 'strategy_demo_3',
    name: '网格套利机器人',
    code: `# 网格套利策略
class GridStrategy:
    def __init__(self, grid_count=10, grid_size=0.02):
        self.grid_count = grid_count
`,
    createdAt: new Date('2024-03-10'),
    status: 'draft',
  },
];

const SUBSCRIBED_STRATEGIES = MOCK_MARKET_STRATEGIES.slice(0, 3).map((strategy) => ({
  id: strategy.id,
  name: strategy.name,
  author: strategy.author.name,
  description: strategy.description,
  tags: strategy.tags,
}));

function App() {
  const [activeView, setActiveView] = useState<ViewId>('strategy-lab');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishingStrategy, setPublishingStrategy] = useState<StrategyData | null>(null);
  const [strategies, setStrategies] = useState<StrategyData[]>(INITIAL_STRATEGIES);
  const [publishedStrategies, setPublishedStrategies] = useState<MarketStrategy[]>(
    MOCK_MARKET_STRATEGIES.slice(0, 2).map((strategy) => ({
      id: strategy.id,
      name: strategy.name,
      author: strategy.author.name,
      description: strategy.description,
      price: strategy.price,
      rating: strategy.rating,
      purchases: strategy.purchases,
      code: strategy.code,
      tags: strategy.tags,
    })),
  );
  const [showCreatePortfolioModal, setShowCreatePortfolioModal] = useState(false);
  const [showPublishPortfolioModal, setShowPublishPortfolioModal] = useState(false);
  const [publishingPortfolio, setPublishingPortfolio] = useState<PortfolioData | null>(null);
  const [showCreateContainerModal, setShowCreateContainerModal] = useState(false);

  const { setPendingStrategy } = useBacktestStore();
  const isAuthenticated = useIsAuthenticated();
  const colorTheme = useUIStore((state) => state.colorTheme);

  const {
    portfolios,
    marketPortfolios,
    addPortfolio,
    deletePortfolio,
    publishPortfolio,
    purchasePortfolio,
  } = usePortfolioStore();
  const upsertRuntimeRegistryEntry = useRuntimeRegistryStore((state) => state.upsertEntry);
  const addStrategyDefinition = useStrategyDefinitionStore((state) => state.addDefinition);
  const updateStrategyDefinition = useStrategyDefinitionStore((state) => state.updateDefinition);
  const addStrategyRuntime = useStrategyRuntimeStore((state) => state.addRuntime);
  const updateStrategyRuntime = useStrategyRuntimeStore((state) => state.updateRuntime);

  const handleSaveStrategy = (strategy: StrategyData) => {
    setStrategies((prev) => [...prev, { ...strategy, status: 'ready' }]);
    const now = Date.now();
    const definition: StrategyDefinition = {
      id: strategy.id,
      name: strategy.name,
      description: `${strategy.name} 的策略定义`,
      author: 'current-user',
      version: '1.0.0',
      code: strategy.code,
      language: 'python',
      type: 'custom',
      tags: [],
      tradingMode: 'both',
      timeFrames: ['1h'],
      config: {
        symbols: ['BTC/USDT'],
        signalSettings: {
          indicators: [],
        },
        riskRules: [],
        executionSettings: {
          executionMode: 'paper',
          defaultOrderType: 'market',
          positionSizing: 'fixed_quantity',
        },
        notificationSettings: {
          enabled: false,
          channels: [],
          notifyOn: {
            trade: false,
            signal: false,
            error: true,
            milestone: false,
            dailyReport: false,
          },
        },
      },
      riskLevel: 'moderate',
      maxPositionSize: 20,
      maxDrawdownLimit: 15,
      preferredContainerBoundaryKinds: ['strategy-host'],
      isPublic: false,
      isTemplate: false,
      allowCopy: true,
      createdAt: now,
      updatedAt: now,
    };

    addStrategyDefinition(definition);
  };

  const handleDeleteStrategy = (id: string) => {
    setStrategies((prev) => prev.filter((strategy) => strategy.id !== id));
    useStrategyDefinitionStore.getState().removeDefinition(id);
    const strategyRuntime = useStrategyRuntimeStore.getState().runtimes.find((runtime) => runtime.strategyDefinitionId === id);
    if (strategyRuntime) {
      useStrategyRuntimeStore.getState().removeRuntime(strategyRuntime.id);
    }
  };

  const handleDuplicateStrategy = (strategy: StrategyData) => {
    const duplicatedId = `strategy_${Date.now()}`;
    const newStrategy: StrategyData = {
      ...strategy,
      id: duplicatedId,
      name: `${strategy.name}（副本）`,
      createdAt: new Date(),
      status: 'draft',
    };
    setStrategies((prev) => [...prev, newStrategy]);

    const now = Date.now();
    const duplicatedDefinition: StrategyDefinition = {
      id: duplicatedId,
      name: newStrategy.name,
      description: `${strategy.name} 的副本定义`,
      author: 'current-user',
      version: '1.0.0',
      code: strategy.code,
      language: 'python',
      type: 'custom',
      tags: [],
      tradingMode: 'both',
      timeFrames: ['1h'],
      config: {
        symbols: ['BTC/USDT'],
        signalSettings: {
          indicators: [],
        },
        riskRules: [],
        executionSettings: {
          executionMode: 'paper',
          defaultOrderType: 'market',
          positionSizing: 'fixed_quantity',
        },
        notificationSettings: {
          enabled: false,
          channels: [],
          notifyOn: {
            trade: false,
            signal: false,
            error: true,
            milestone: false,
            dailyReport: false,
          },
        },
      },
      riskLevel: 'moderate',
      maxPositionSize: 20,
      maxDrawdownLimit: 15,
      preferredContainerBoundaryKinds: ['strategy-host'],
      isPublic: false,
      isTemplate: false,
      allowCopy: true,
      createdAt: now,
      updatedAt: now,
    };

    addStrategyDefinition(duplicatedDefinition);
  };

  const handleRunBacktest = (strategy: StrategyData) => {
    setPendingStrategy({ id: strategy.id, name: strategy.name });
    setActiveView('backtest-compute');
  };

  const handleStartExecution = (strategy: StrategyData) => {
    const now = Date.now();
    const existingRuntime = useStrategyRuntimeStore
      .getState()
      .runtimes.find((runtime) => runtime.strategyDefinitionId === strategy.id);

    if (existingRuntime) {
      const updatedRuntime: StrategyRuntime = {
        ...existingRuntime,
        status: 'running',
        startedAt: existingRuntime.startedAt ?? now,
        lastHeartbeatAt: now,
        updatedAt: now,
      };
      updateStrategyRuntime(existingRuntime.id, updatedRuntime);
      upsertRuntimeRegistryEntry(createStrategyRuntimeRegistryEntry(updatedRuntime));
    } else {
      const runtime: StrategyRuntime = {
        id: `strategy_runtime_${strategy.id}_${now}`,
        strategyDefinitionId: strategy.id,
        name: strategy.name,
        status: 'running',
        subscribedSymbols: ['BTC/USDT'],
        activeSignalIds: [],
        activeOrderIntentIds: [],
        positions: [],
        metrics: {
          signalsGenerated: 0,
          ordersPlaced: 0,
          ordersFilled: 0,
          uptimeSeconds: 0,
          totalPnl: 0,
          todayPnl: 0,
          signalsPerMinute: 0,
          successRate: 0,
        },
        errors: [],
        startedAt: now,
        lastHeartbeatAt: now,
        createdAt: now,
        updatedAt: now,
      };

      addStrategyRuntime(runtime);
      upsertRuntimeRegistryEntry(createStrategyRuntimeRegistryEntry(runtime));
    }

    updateStrategyDefinition(strategy.id, {
      updatedAt: now,
    });

    setStrategies((prev) =>
      prev.map((item) =>
        item.id === strategy.id
          ? {
              ...item,
              status: 'running' as const,
              runtimeId:
                useStrategyRuntimeStore
                  .getState()
                  .runtimes.find((runtime) => runtime.strategyDefinitionId === strategy.id)?.id ??
                `strategy_runtime_${strategy.id}_${now}`,
              lastHeartbeatAt: now,
            }
          : item,
      ),
    );
    setActiveView('runtime-desk');
  };

  const handlePublishStrategy = (strategy: StrategyData) => {
    setPublishingStrategy(strategy);
    setShowPublishModal(true);
  };

  const handleConfirmPublish = (strategy: StrategyData, settings: PublishSettings) => {
    const marketStrategy: MarketStrategy = {
      id: strategy.id,
      name: strategy.name,
      author: '我',
      description: settings.description,
      price: settings.price,
      rating: 0,
      purchases: 0,
      code: settings.isPublicCode ? strategy.code : '# 代码已隐藏',
      tags: [],
    };

    setPublishedStrategies((prev) => [marketStrategy, ...prev]);
    setShowPublishModal(false);
    setPublishingStrategy(null);
  };

  const handleSavePortfolio = (portfolio: PortfolioData) => {
    addPortfolio(portfolio);
  };

  const handleDeletePortfolio = (id: string) => {
    deletePortfolio(id);
  };

  const handlePublishPortfolio = (portfolio: PortfolioData) => {
    setPublishingPortfolio(portfolio);
    setShowPublishPortfolioModal(true);
  };

  const handleConfirmPublishPortfolio = (
    portfolio: PortfolioData,
    settings: PortfolioPublishSettings,
  ) => {
    const marketPortfolio: MarketPortfolio = {
      id: portfolio.id,
      name: portfolio.name,
      author: '我',
      description: settings.description,
      price: settings.price,
      rating: 0,
      purchases: 0,
      code: settings.isPublicCode ? portfolio.config.scoringCode : '# 评分代码已隐藏',
      tags: [],
      config: portfolio.config,
    };

    publishPortfolio(portfolio, marketPortfolio);
    setShowPublishPortfolioModal(false);
    setPublishingPortfolio(null);
  };

  const handlePurchasePortfolio = (marketPortfolio: MarketPortfolio) => {
    purchasePortfolio(marketPortfolio);
  };

  useEffect(() => {
    const colors = COLOR_THEMES[colorTheme];
    document.documentElement.style.setProperty('--nemt-bg', colors.bg);
    document.documentElement.style.setProperty('--nemt-bg-secondary', colors.bgSecondary);
    document.documentElement.style.setProperty('--nemt-bg-tertiary', colors.bgTertiary);
    document.documentElement.style.setProperty('--nemt-border', colors.border);
    document.documentElement.style.setProperty('--nemt-border-light', colors.borderLight);
    document.documentElement.style.setProperty('--nemt-text', colors.text);
    document.documentElement.style.setProperty('--nemt-text-secondary', colors.textSecondary);
    document.documentElement.style.setProperty('--nemt-text-muted', colors.textMuted);
    document.documentElement.style.setProperty('--nemt-accent', colors.accent);
  }, [colorTheme]);

  useEffect(() => {
    bootstrapRuntime({ initialStrategies: INITIAL_STRATEGIES });
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppShell
      activeView={activeView}
      title={VIEW_TITLES[activeView]}
      description={VIEW_DESCRIPTIONS[activeView]}
      onViewChange={setActiveView}
      header={<PlatformHeader />}
    >
      <AppViewRouter
        activeView={activeView}
        strategies={strategies}
        publishedStrategies={publishedStrategies}
        subscribedStrategies={SUBSCRIBED_STRATEGIES}
        portfolios={portfolios}
        marketPortfolios={marketPortfolios}
        onCreateStrategy={() => setShowCreateModal(true)}
        onSaveStrategy={handleSaveStrategy}
        onDeleteStrategy={handleDeleteStrategy}
        onDuplicateStrategy={handleDuplicateStrategy}
        onRunBacktest={handleRunBacktest}
        onStartExecution={handleStartExecution}
        onPublishStrategy={handlePublishStrategy}
        onPurchaseStrategy={(strategy) => {
          const definitionId = `strategy_${Date.now()}`;
          const createdAt = Date.now();
          const newStrategy: StrategyData = {
            id: definitionId,
            name: strategy.name,
            code: strategy.code,
            createdAt: new Date(),
            status: 'ready',
          };
          setStrategies((prev) => [...prev, newStrategy]);

          const purchasedDefinition: StrategyDefinition = {
            id: definitionId,
            name: strategy.name,
            description: strategy.description,
            author: strategy.author,
            version: '1.0.0',
            code: strategy.code,
            language: 'python',
            type: 'custom',
            tags: strategy.tags,
            tradingMode: 'both',
            timeFrames: ['1h'],
            config: {
              symbols: ['BTC/USDT'],
              signalSettings: {
                indicators: [],
              },
              riskRules: [],
              executionSettings: {
                executionMode: 'paper',
                defaultOrderType: 'market',
                positionSizing: 'fixed_quantity',
              },
              notificationSettings: {
                enabled: false,
                channels: [],
                notifyOn: {
                  trade: false,
                  signal: false,
                  error: true,
                  milestone: false,
                  dailyReport: false,
                },
              },
            },
            riskLevel: 'moderate',
            maxPositionSize: 20,
            maxDrawdownLimit: 15,
            preferredContainerBoundaryKinds: ['strategy-host'],
            isPublic: false,
            isTemplate: false,
            allowCopy: true,
            createdAt,
            updatedAt: createdAt,
          };

          addStrategyDefinition(purchasedDefinition);
        }}
        onCreatePortfolio={() => setShowCreatePortfolioModal(true)}
        onSavePortfolio={handleSavePortfolio}
        onDeletePortfolio={handleDeletePortfolio}
        onPublishPortfolio={handlePublishPortfolio}
        onPurchasePortfolio={handlePurchasePortfolio}
        onCreateContainer={() => setShowCreateContainerModal(true)}
      />

      {showCreateModal && (
        <CreateStrategyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveStrategy}
        />
      )}

      <PublishStrategyModal
        isOpen={showPublishModal}
        strategy={publishingStrategy}
        onClose={() => {
          setShowPublishModal(false);
          setPublishingStrategy(null);
        }}
        onPublish={handleConfirmPublish}
      />

      <CreatePortfolioModal
        isOpen={showCreatePortfolioModal}
        onClose={() => setShowCreatePortfolioModal(false)}
        onSave={handleSavePortfolio}
      />

      <PublishPortfolioModal
        isOpen={showPublishPortfolioModal}
        portfolio={publishingPortfolio}
        onClose={() => {
          setShowPublishPortfolioModal(false);
          setPublishingPortfolio(null);
        }}
        onPublish={handleConfirmPublishPortfolio}
      />

      <CreateContainerModal
        isOpen={showCreateContainerModal}
        onClose={() => setShowCreateContainerModal(false)}
        onCreate={(config) => {
          createContainerBoundary({ config, strategies });
        }}
        availableStrategies={strategies.map((strategy) => ({ id: strategy.id, name: strategy.name }))}
      />
    </AppShell>
  );
}

export default App;
