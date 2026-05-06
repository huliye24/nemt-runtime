/**
 * NEMT Platform - Portfolio Manager Component
 *
 * Main interface for managing portfolio capital allocation
 * 
 * Refactored: Split into smaller components
 * - PortfolioHeader: 头部
 * - PortfolioSettings: 设置面板
 * - CapitalOverview: 资金概览
 * - StrategyPerformanceList: 策略绩效
 * - AllocationChart: 分配图表
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity } from 'lucide-react';
import { usePortfolioStore } from '../../stores/portfolioStore';
import type {
  PortfolioData,
  StrategyPerformance,
} from '../../types/portfolio';
import {
  PortfolioHeader,
  PortfolioSettings,
  CapitalOverview,
  StrategyPerformanceList,
  AllocationChart,
} from './components';

// Demo strategy performance data
const DEMO_STRATEGIES: StrategyPerformance[] = [
  {
    strategyId: 'strategy_demo_1',
    strategyName: '双均线趋势策略',
    returns: 12.5,
    sharpeRatio: 1.8,
    winRate: 0.62,
    maxDrawdown: 8.2,
    tradeCount: 45,
    volatility: 0.15,
    consistency: 0.75,
    periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    periodEnd: new Date(),
  },
  {
    strategyId: 'strategy_demo_2',
    strategyName: 'RSI 超卖策略',
    returns: 5.2,
    sharpeRatio: 1.2,
    winRate: 0.55,
    maxDrawdown: 15.5,
    tradeCount: 28,
    volatility: 0.22,
    consistency: 0.6,
    periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    periodEnd: new Date(),
  },
  {
    strategyId: 'strategy_demo_3',
    strategyName: '网格套利机器人',
    returns: -2.1,
    sharpeRatio: 0.4,
    winRate: 0.48,
    maxDrawdown: 22.8,
    tradeCount: 156,
    volatility: 0.08,
    consistency: 0.85,
    periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    periodEnd: new Date(),
  },
];

export function PortfolioManager() {
  const {
    portfolios,
    selectedPortfolioId,
    selectPortfolio,
    setTotalCapital,
    recalculateAllocations,
    getCurrentAllocations,
    isRecalculating,
    lastRecalculation,
    executeReallocation,
  } = usePortfolioStore();

  const [showSettings, setShowSettings] = useState(false);
  const [strategyPerformances] = useState<StrategyPerformance[]>(DEMO_STRATEGIES);

  // Select first portfolio if none selected
  useEffect(() => {
    if (portfolios.length > 0 && !selectedPortfolioId) {
      selectPortfolio(portfolios[0].id);
    }
  }, [portfolios, selectedPortfolioId, selectPortfolio]);

  const selectedPortfolio = portfolios.find((p) => p.id === selectedPortfolioId) || null;
  const allocations = getCurrentAllocations();
  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocation, 0);

  const handleRecalculate = () => {
    recalculateAllocations(strategyPerformances);
  };

  const handleExecute = () => {
    executeReallocation();
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PortfolioHeader
        portfolios={portfolios}
        selectedPortfolioId={selectedPortfolioId}
        showSettings={showSettings}
        onSelectPortfolio={selectPortfolio}
        onToggleSettings={handleToggleSettings}
      />

      {/* Settings Panel */}
      {showSettings && selectedPortfolio && (
        <PortfolioSettings
          portfolio={selectedPortfolio}
          onSetTotalCapital={setTotalCapital}
        />
      )}

      {/* Capital Overview */}
      <CapitalOverview
        totalCapital={selectedPortfolio?.totalCapital || 0}
        totalAllocated={totalAllocated}
      />

      {/* Allocation Actions */}
      <div
        className="p-4 rounded-xl flex items-center justify-between"
        style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: '#6b21a8', color: '#ffffff' }}
          >
            <RefreshCw size={16} className={isRecalculating ? 'animate-spin' : ''} />
            重新计算分配
          </button>
          <button
            onClick={handleExecute}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
          >
            <Activity size={16} />
            执行分配
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: '#737373' }}>
          <span>上次计算:</span>
          <span>
            {lastRecalculation
              ? lastRecalculation.toLocaleTimeString()
              : '从未计算'}
          </span>
        </div>
      </div>

      {/* Strategy Performance */}
      <StrategyPerformanceList
        performances={strategyPerformances}
        allocations={allocations}
        stopLossPercent={selectedPortfolio?.config.rules.stopLossPercent || 20}
      />

      {/* Allocation Chart */}
      <AllocationChart allocations={allocations} />
    </div>
  );
}
