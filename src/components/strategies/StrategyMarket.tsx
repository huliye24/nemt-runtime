/**
 * NEMT Platform - Strategy Market Component
 * Tab-based view for My Strategies and Discover
 */

import React, { useState } from 'react';
import { Plus, Cpu, Globe } from 'lucide-react';
import { StrategyList } from './StrategyList';
import { DiscoverStrategies } from './DiscoverStrategies';
import type { StrategyData } from './CreateStrategyModal';

interface StrategyMarketProps {
  strategies: StrategyData[];
  publishedStrategies: MarketStrategy[];
  onCreateNew: () => void;
  onSaveStrategy: (strategy: StrategyData) => void;
  onDeleteStrategy: (id: string) => void;
  onDuplicateStrategy: (strategy: StrategyData) => void;
  onRunBacktest: (strategy: StrategyData) => void;
  onStartExecution: (strategy: StrategyData) => void;
  onPublishStrategy?: (strategy: StrategyData) => void;
  onPurchaseStrategy?: (strategy: MarketStrategy) => void;
}

export interface MarketStrategy {
  id: string;
  name: string;
  author: string;
  description: string;
  price: number;
  rating: number;
  purchases: number;
  code: string;
  tags: string[];
}

type Tab = 'my' | 'discover';

export function StrategyMarket({
  strategies,
  publishedStrategies,
  onCreateNew,
  onSaveStrategy,
  onDeleteStrategy,
  onDuplicateStrategy,
  onRunBacktest,
  onStartExecution,
  onPublishStrategy,
  onPurchaseStrategy,
}: StrategyMarketProps) {
  const [activeTab, setActiveTab] = useState<Tab>('my');

  const tabs = [
    { id: 'my' as Tab, label: '我的策略', icon: Cpu },
    { id: 'discover' as Tab, label: '发现策略', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: '#1a1a1a' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? '#262626' : 'transparent',
                color: isActive ? '#ffffff' : '#737373',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'my' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ 
                backgroundColor: '#6b21a8',
                color: '#ffffff',
              }}
            >
              <Plus size={16} />
              新建策略
            </button>
          </div>

          {/* Empty State */}
          {strategies.length === 0 ? (
            <div 
              className="flex flex-col items-center justify-center py-20 rounded-2xl"
              style={{ 
                backgroundColor: '#141414',
                border: '1px dashed #2a2a2a',
              }}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <Cpu size={28} style={{ color: '#525252' }} />
              </div>
              <h3 className="text-neutral-300 text-lg font-medium mb-2">
                暂无策略
              </h3>
              <p className="text-neutral-500 text-sm mb-6">
                创建你的第一个量化交易策略
              </p>
              <button 
                onClick={onCreateNew}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ 
                  backgroundColor: '#262626',
                  color: '#a3a3a3',
                }}
              >
                <Plus size={16} />
                创建策略
              </button>
            </div>
          ) : (
            <StrategyList
              strategies={strategies}
              onDelete={onDeleteStrategy}
              onDuplicate={onDuplicateStrategy}
              onRunBacktest={onRunBacktest}
              onStartExecution={onStartExecution}
              onPublish={onPublishStrategy}
            />
          )}
        </div>
      )}

      {activeTab === 'discover' && (
        <DiscoverStrategies 
          onPurchase={onPurchaseStrategy}
          myPublishedStrategies={publishedStrategies}
        />
      )}
    </div>
  );
}
