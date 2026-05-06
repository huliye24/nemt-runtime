/**
 * NEMT Platform - Strategy Pool Execution Component
 * Strategy pool UI backed by the execution orchestrator and execution stores.
 */

import React, { useMemo, useState } from 'react';
import { Clock, Monitor, Play, Plus, Square, Wallet, Zap } from 'lucide-react';

import { useExecutionWorkbench } from '@/hooks/useExecutionWorkbench';
import { BACKTEST_SYMBOLS } from '@/stores/backtestStore';

import type { StrategyData } from './CreateStrategyModal';
import type { MarketStrategy } from './StrategyMarket';
import {
  AddStrategyModal,
  MonitorTab,
  OrdersTab,
  PositionTab,
  StrategyPoolItem,
} from './execution';

type TabType = 'monitor' | 'position' | 'orders';
type StrategySource = 'mine' | 'purchased' | 'subscribed';

interface AvailableStrategy {
  id: string;
  name: string;
  source: StrategySource;
  author?: string;
  description?: string;
}

interface StrategyExecutionProps {
  strategies: StrategyData[];
  publishedStrategies?: MarketStrategy[];
  subscribedStrategies?: SubscribedStrategy[];
}

interface SubscribedStrategy {
  id: string;
  name: string;
  author: string;
  description: string;
  tags: string[];
}

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'monitor', label: '监控', icon: <Monitor size={16} /> },
  { id: 'position', label: '持仓', icon: <Wallet size={16} /> },
  { id: 'orders', label: '订单', icon: <Clock size={16} /> },
];

export function StrategyExecution({
  strategies,
  publishedStrategies = [],
  subscribedStrategies = [],
}: StrategyExecutionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('monitor');
  const [selectedStrategyIds, setSelectedStrategyIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);

  const availableStrategies: AvailableStrategy[] = useMemo(
    () => [
      ...strategies.map((strategy) => ({ ...strategy, source: 'mine' as const })),
      ...publishedStrategies.map((strategy) => ({ ...strategy, source: 'purchased' as const })),
      ...subscribedStrategies.map((strategy) => ({ ...strategy, source: 'subscribed' as const })),
    ],
    [publishedStrategies, strategies, subscribedStrategies],
  );

  const {
    members,
    market,
    monitorSignals,
    orderView,
    positionView,
    addStrategies,
    removeStrategy,
    setMarketSymbol,
    startStrategy,
    pauseStrategy,
    resumeStrategy,
    stopStrategy,
  } = useExecutionWorkbench({
    availableStrategies,
  });

  const runningStrategies = members.filter((member) => member.status === 'running');

  const handleToggleSelection = (id: string) => {
    setSelectedStrategyIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedStrategyIds.size === members.length) {
      setSelectedStrategyIds(new Set());
      return;
    }

    setSelectedStrategyIds(new Set(members.map((member) => member.strategyId)));
  };

  const handleStartSelected = () => {
    selectedStrategyIds.forEach((strategyId) => startStrategy(strategyId));
  };

  const handleStopSelected = () => {
    selectedStrategyIds.forEach((strategyId) => stopStrategy(strategyId));
  };

  const handleRemoveStrategy = (id: string) => {
    removeStrategy(id);
    setSelectedStrategyIds((previous) => {
      const next = new Set(previous);
      next.delete(id);
      return next;
    });
  };

  const handleClosePosition = (strategyId: string) => {
    stopStrategy(strategyId);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl" style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white">策略池</h2>
            <span className="text-sm px-3 py-1 rounded-lg" style={{ backgroundColor: '#1a1a1a', color: '#737373' }}>
              已选择 {selectedStrategyIds.size}/{members.length}
            </span>
            {runningStrategies.length > 0 && (
              <span className="flex items-center gap-2 text-sm px-3 py-1 rounded-lg bg-green-500/10 text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {runningStrategies.length} 个运行中
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={market.symbol}
              onChange={(event) => setMarketSymbol(event.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
            >
              {BACKTEST_SYMBOLS.binance.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
              style={{ backgroundColor: '#6b21a8' }}
            >
              <Plus size={16} />
              添加策略
            </button>
          </div>
        </div>

        {members.length > 0 ? (
          <div className="space-y-2">
            <div
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
              style={{ backgroundColor: '#1a1a1a' }}
              onClick={handleToggleSelectAll}
            >
              <div
                className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: selectedStrategyIds.size === members.length ? '#6b21a8' : 'transparent',
                  borderColor: selectedStrategyIds.size === members.length ? '#6b21a8' : '#404040',
                }}
              >
                {selectedStrategyIds.size === members.length && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm" style={{ color: '#737373' }}>全选</span>
            </div>

            {members.map((member) => (
              <StrategyPoolItem
                key={member.strategyId}
                strategyId={member.strategyId}
                strategyName={member.strategyName}
                source={member.source}
                status={member.status}
                isSelected={selectedStrategyIds.has(member.strategyId)}
                onToggleSelect={() => handleToggleSelection(member.strategyId)}
                onStart={() => startStrategy(member.strategyId)}
                onPause={() => pauseStrategy(member.strategyId)}
                onResume={() => resumeStrategy(member.strategyId)}
                onStop={() => stopStrategy(member.strategyId)}
                onRemove={() => handleRemoveStrategy(member.strategyId)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
            <Zap size={48} style={{ color: '#404040' }} />
            <p className="mt-4 text-sm" style={{ color: '#737373' }}>
              策略池为空
            </p>
            <p className="text-xs mt-1" style={{ color: '#525252' }}>
              点击“添加策略”开始构建你的执行池
            </p>
          </div>
        )}

        {members.length > 0 && (
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleStartSelected}
              disabled={selectedStrategyIds.size === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#16a34a' }}
            >
              <Play size={14} />
              批量启动
            </button>
            <button
              onClick={handleStopSelected}
              disabled={selectedStrategyIds.size === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#dc2626' }}
            >
              <Square size={14} />
              批量停止
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: '#141414' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            style={activeTab === tab.id ? { backgroundColor: '#1f1f1f' } : {}}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'monitor' && (
          <MonitorTab
            signals={monitorSignals}
            currentPrice={market.price}
            priceChange24h={market.change24h}
          />
        )}
        {activeTab === 'position' && (
          <PositionTab
            positions={positionView.map((position) => ({
              ...position,
              side: position.side === 'short' ? 'short' : 'long',
            }))}
            currentPrice={market.price}
            onClosePosition={handleClosePosition}
          />
        )}
        {activeTab === 'orders' && <OrdersTab orders={orderView} />}
      </div>

      {showAddModal && (
        <AddStrategyModal
          availableStrategies={availableStrategies}
          selectedIds={new Set(members.map((member) => member.strategyId))}
          onAdd={(ids) => {
            addStrategies(ids);
            setSelectedStrategyIds((previous) => {
              const next = new Set(previous);
              ids.forEach((id) => next.add(id));
              return next;
            });
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
