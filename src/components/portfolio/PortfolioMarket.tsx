/**
 * NEMT Platform - Portfolio Market Component
 *
 * Tab-based view for My Portfolios and Discover
 */

import React, { useState } from 'react';
import { Plus, PieChart, Globe, Trash2, Edit2, Globe2, ShoppingCart, Star } from 'lucide-react';
import type {
  PortfolioData,
  MarketPortfolio,
  PortfolioConfig,
} from '../../types/portfolio';
import { SCORING_PERIOD_LABELS, FREQUENCY_LABELS } from '../../types/portfolio';

interface PortfolioMarketProps {
  portfolios: PortfolioData[];
  marketPortfolios: MarketPortfolio[];
  onCreateNew: () => void;
  onSavePortfolio: (portfolio: PortfolioData) => void;
  onDeletePortfolio: (id: string) => void;
  onPublishPortfolio?: (portfolio: PortfolioData) => void;
  onPurchasePortfolio?: (portfolio: MarketPortfolio) => void;
  onEditPortfolio?: (portfolio: PortfolioData) => void;
}

type Tab = 'my' | 'discover';

export function PortfolioMarket({
  portfolios,
  marketPortfolios,
  onCreateNew,
  onDeletePortfolio,
  onPublishPortfolio,
  onPurchasePortfolio,
  onEditPortfolio,
}: PortfolioMarketProps) {
  const [activeTab, setActiveTab] = useState<Tab>('my');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const tabs = [
    { id: 'my' as Tab, label: '我的 Portfolio', icon: PieChart },
    { id: 'discover' as Tab, label: '发现 Portfolio', icon: Globe2 },
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
          <div className="flex items-center justify-between">
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
                新建 Portfolio
              </button>
            </div>
            <span
              className="text-sm px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: '#1a1a1a', color: '#737373' }}
            >
              {portfolios.length} 个 Portfolio
            </span>
          </div>

          {/* Empty State */}
          {portfolios.length === 0 ? (
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
                <PieChart size={28} style={{ color: '#525252' }} />
              </div>
              <h3 className="text-neutral-300 text-lg font-medium mb-2">
                暂无资金管理器
              </h3>
              <p className="text-neutral-500 text-sm mb-6">
                创建你的第一个资金管理器，自动分配策略资金
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
                创建资金管理器
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {portfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  isExpanded={expandedId === portfolio.id}
                  onToggle={() => toggleExpand(portfolio.id)}
                  onDelete={() => onDeletePortfolio(portfolio.id)}
                  onPublish={() => onPublishPortfolio?.(portfolio)}
                  onEdit={() => onEditPortfolio?.(portfolio)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'discover' && (
        <DiscoverPortfolios
          portfolios={marketPortfolios}
          onPurchase={onPurchasePortfolio}
        />
      )}
    </div>
  );
}

// Portfolio Card Component
interface PortfolioCardProps {
  portfolio: PortfolioData;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onEdit: () => void;
}

function PortfolioCard({
  portfolio,
  isExpanded,
  onToggle,
  onDelete,
  onPublish,
  onEdit,
}: PortfolioCardProps) {
  const totalAllocated = portfolio.allocations.reduce((sum, a) => sum + a.allocation, 0);
  const allocPercentage = portfolio.totalCapital > 0 ? (totalAllocated / portfolio.totalCapital) * 100 : 0;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}
    >
      {/* Card Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#6b21a820' }}
          >
            <PieChart size={20} style={{ color: '#c084fc' }} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white">{portfolio.name}</span>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: portfolio.status === 'active' ? '#16a34a20' : '#f59e0b20',
                  color: portfolio.status === 'active' ? '#22c55e' : '#f59e0b',
                }}
              >
                {portfolio.status === 'active' ? '已激活' : '草稿'}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: '#737373' }}>
              {portfolio.description || '暂无描述'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-white">
              ${portfolio.totalCapital.toLocaleString()}
            </div>
            <div className="text-xs" style={{ color: '#737373' }}>
              总资金 · {allocPercentage.toFixed(0)}% 已分配
            </div>
          </div>
          <span
            className="text-xs px-2 py-1 rounded"
            style={{ backgroundColor: '#1a1a1a', color: '#737373' }}
          >
            {isExpanded ? '收起' : '展开'}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          className="border-t p-4 space-y-4"
          style={{ borderColor: '#1f1f1f' }}
        >
          {/* Config Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              <div className="text-xs mb-1" style={{ color: '#737373' }}>
                评分周期
              </div>
              <div className="text-sm font-medium text-white">
                {SCORING_PERIOD_LABELS[portfolio.config.scoring.period]}
              </div>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              <div className="text-xs mb-1" style={{ color: '#737373' }}>
                调整频率
              </div>
              <div className="text-sm font-medium text-white">
                {FREQUENCY_LABELS[portfolio.config.frequency]}
              </div>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              <div className="text-xs mb-1" style={{ color: '#737373' }}>
                策略数量
              </div>
              <div className="text-sm font-medium text-white">
                {portfolio.allocations.length}
              </div>
            </div>
          </div>

          {/* Allocations Preview */}
          {portfolio.allocations.length > 0 && (
            <div>
              <div className="text-xs mb-2" style={{ color: '#737373' }}>
                分配预览
              </div>
              <div className="space-y-2">
                {portfolio.allocations.slice(0, 3).map((alloc) => (
                  <div
                    key={alloc.strategyId}
                    className="flex items-center justify-between p-2 rounded-lg"
                    style={{ backgroundColor: '#1a1a1a' }}
                  >
                    <span className="text-sm text-white">{alloc.strategyName}</span>
                    <span className="text-sm" style={{ color: '#c084fc' }}>
                      ${alloc.allocation.toLocaleString()} ({alloc.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
                {portfolio.allocations.length > 3 && (
                  <div className="text-xs text-center" style={{ color: '#737373' }}>
                    还有 {portfolio.allocations.length - 3} 个策略...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ backgroundColor: '#262626', color: '#a3a3a3' }}
            >
              <Edit2 size={14} />
              编辑
            </button>
            <button
              onClick={onPublish}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ backgroundColor: '#6b21a8', color: '#ffffff' }}
            >
              <Globe size={14} />
              发布市场
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ml-auto"
              style={{ backgroundColor: '#dc262620', color: '#dc2626' }}
            >
              <Trash2 size={14} />
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Discover Portfolios Component
interface DiscoverPortfoliosProps {
  portfolios: MarketPortfolio[];
  onPurchase?: (portfolio: MarketPortfolio) => void;
}

function DiscoverPortfolios({ portfolios, onPurchase }: DiscoverPortfoliosProps) {
  const [search, setSearch] = useState('');

  const filteredPortfolios = portfolios.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索 Portfolio..."
          className="w-full px-4 py-3 pl-10 rounded-xl text-sm outline-none"
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            color: '#e5e5e5',
          }}
        />
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </span>
      </div>

      {/* Portfolio Grid */}
      {filteredPortfolios.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{
            backgroundColor: '#141414',
            border: '1px dashed #2a2a2a',
          }}
        >
          <Globe size={48} style={{ color: '#404040' }} />
          <p className="mt-4 text-neutral-500 text-sm">
            {portfolios.length === 0 ? '暂无市场 Portfolio' : '没有找到匹配的 Portfolio'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredPortfolios.map((portfolio) => (
            <MarketPortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onPurchase={() => onPurchase?.(portfolio)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Market Portfolio Card
interface MarketPortfolioCardProps {
  portfolio: MarketPortfolio;
  onPurchase: () => void;
}

function MarketPortfolioCard({ portfolio, onPurchase }: MarketPortfolioCardProps) {
  return (
    <div
      className="rounded-xl p-4 space-y-4"
      style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#6b21a820' }}
          >
            <PieChart size={20} style={{ color: '#c084fc' }} />
          </div>
          <div>
            <span className="text-sm font-medium text-white">{portfolio.name}</span>
            <p className="text-xs" style={{ color: '#737373' }}>
              by {portfolio.author}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star size={12} style={{ color: '#f59e0b' }} fill="#f59e0b" />
          <span className="text-xs" style={{ color: '#f59e0b' }}>
            {portfolio.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm" style={{ color: '#a3a3a3' }}>
        {portfolio.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {portfolio.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-1 rounded"
            style={{ backgroundColor: '#262626', color: '#a3a3a3' }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <ShoppingCart size={14} style={{ color: '#737373' }} />
          <span className="text-xs" style={{ color: '#737373' }}>
            {portfolio.purchases} 次购买
          </span>
        </div>
        <button
          onClick={onPurchase}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: '#6b21a8',
            color: '#ffffff',
          }}
        >
          {portfolio.price === 0 ? '免费获取' : `¥${portfolio.price}`}
        </button>
      </div>
    </div>
  );
}
