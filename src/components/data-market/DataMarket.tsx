/**
 * NEMT Platform - Data Market Component
 * Data source and flow management interface
 * 
 * Refactored: Split into smaller components
 * - DataMarketHeader: 头部
 * - DataMarketStats: 统计
 * - QuickStart: 快速开始
 * - DataSourceList: 数据源列表
 * - DataFlowList: 数据流列表
 * - AddFlowModal: 添加数据流表单
 */

import React, { useState } from 'react';
import { useDataMarketStore, type DataSource, type DataFlow } from '../../stores/dataMarketStore';
import {
  DataMarketHeader,
  DataMarketStats,
  QuickStart,
  DataSourceList,
  DataFlowList,
  AddFlowModal,
} from './components';

// Source info config
type SourceInfo = { assets: string; region: string; popularSymbols: string[] };

const SOURCE_INFO: Record<string, SourceInfo> = {
  binance: { 
    assets: '加密货币', 
    region: '全球', 
    popularSymbols: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'] 
  },
  yahoo: { 
    assets: '股票/指数', 
    region: '美国', 
    popularSymbols: ['AAPL', 'GOOGL', 'MSFT', 'SPY'] 
  },
  alpaca: { 
    assets: '股票/期权', 
    region: '美国', 
    popularSymbols: ['AAPL', 'TSLA', 'SPY', 'QQQ'] 
  },
};

// Quick start presets
const QUICK_STARTS = [
  { label: 'BTC 1分钟K线', sourceId: 'binance', symbol: 'BTC/USDT', interval: '1m', containerId: 'container-a' },
  { label: 'ETH 5分钟K线', sourceId: 'binance', symbol: 'ETH/USDT', interval: '5m', containerId: 'container-a' },
  { label: 'AAPL 日线', sourceId: 'yahoo', symbol: 'AAPL', interval: '1d', containerId: 'container-b' },
];

export function DataMarket() {
  const { sources, flows, containers, addFlow, removeFlow } = useDataMarketStore();
  
  const [showAdd, setShowAdd] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [dataCount, setDataCount] = useState(0);

  // Helper functions
  const getSourceName = (id: string) => sources.find(s => s.id === id)?.name || id;
  const getSourceIcon = (id: string) => sources.find(s => s.id === id)?.icon || '?';
  const getContainerName = (id: string) => containers.find(c => c.id === id)?.name || id;

  const handleAddFlow = (flowData: { sourceId: string; symbol: string; interval: string; targetContainer: string }) => {
    addFlow(flowData);
    setDataCount(prev => prev + Math.floor(Math.random() * 1000));
    setLastUpdate(new Date());
    setShowAdd(false);
  };

  const handleQuickStart = (preset: typeof QUICK_STARTS[0]) => {
    addFlow({
      sourceId: preset.sourceId,
      symbol: preset.symbol,
      interval: preset.interval,
      targetContainer: preset.containerId,
    });
    setDataCount(prev => prev + Math.floor(Math.random() * 500));
    setLastUpdate(new Date());
  };

  const handleSelectSymbol = (sourceId: string, symbol: string) => {
    setShowAdd(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <DataMarketHeader onAddFlow={() => setShowAdd(true)} />

      {/* Stats */}
      <DataMarketStats
        flowsCount={flows.length}
        activeCount={flows.length}
        todayReceived={dataCount}
        lastUpdate={lastUpdate}
      />

      {/* Quick Start */}
      {flows.length === 0 && !showAdd && (
        <QuickStart
          presets={QUICK_STARTS}
          onQuickStart={handleQuickStart}
          getSourceName={getSourceName}
          getContainerName={getContainerName}
        />
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Data Sources */}
        <DataSourceList
          sources={sources}
          flows={flows}
          sourceInfo={SOURCE_INFO}
          onSelectSymbol={handleSelectSymbol}
        />

        {/* Right: Data Flows */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">数据流</h3>
            {flows.length > 0 && (
              <span className="text-xs text-neutral-500">{flows.length} 个数据流</span>
            )}
          </div>

          {/* Add Flow Form */}
          {showAdd && (
            <AddFlowModal
              sources={sources}
              containers={containers}
              sourceInfo={SOURCE_INFO}
              getSourceName={getSourceName}
              getSourceIcon={getSourceIcon}
              getContainerName={getContainerName}
              onAdd={handleAddFlow}
              onClose={() => setShowAdd(false)}
            />
          )}

          {/* Flow List */}
          <DataFlowList
            flows={flows}
            sources={sources}
            containers={containers}
            showAddForm={showAdd}
            onToggleAddForm={() => setShowAdd(!showAdd)}
            onRemoveFlow={removeFlow}
          />
        </div>
      </div>
    </div>
  );
}
