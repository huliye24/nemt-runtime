/**
 * AddStrategyModal Component
 * 
 * 添加策略模态框
 */

import { useState } from 'react';
import { Search, X, Zap, ShoppingCart, Star } from 'lucide-react';
import { Colors, ButtonVariants } from '../../../presets/presets';

type StrategySource = 'mine' | 'purchased' | 'subscribed';

interface AvailableStrategy {
  id: string;
  name: string;
  source: StrategySource;
  author?: string;
  description?: string;
}

interface AddStrategyModalProps {
  availableStrategies: AvailableStrategy[];
  selectedIds: Set<string>;
  onAdd: (_ids: string[]) => void;
  onClose: () => void;
}

const SOURCE_CONFIG = {
  mine: { icon: Zap, label: '我的策略', color: Colors.accent },
  purchased: { icon: ShoppingCart, label: '已购买', color: '#f59e0b' },
  subscribed: { icon: Star, label: '订阅', color: '#06b6d4' },
};

function StrategyItem({
  strategy,
  isSelected,
  onToggle,
}: {
  strategy: AvailableStrategy;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const sourceConfig = SOURCE_CONFIG[strategy.source];
  const SourceIcon = sourceConfig.icon;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
      style={{
        backgroundColor: isSelected ? `${ButtonVariants.primary.bg}15` : Colors.bgTertiary,
        border: `1px solid ${isSelected ? ButtonVariants.primary.bg : Colors.border}`,
      }}
      onClick={onToggle}
    >
      <div
        className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: isSelected ? ButtonVariants.primary.bg : 'transparent',
          borderColor: isSelected ? ButtonVariants.primary.bg : Colors.textMuted,
        }}
      >
        {isSelected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate" style={{ color: Colors.text }}>{strategy.name}</span>
          <div
            className="flex items-center gap-1 text-xs"
            style={{ color: sourceConfig.color }}
          >
            <SourceIcon size={12} />
            <span>{sourceConfig.label}</span>
          </div>
        </div>
        {strategy.author && (
          <div className="text-xs mt-0.5" style={{ color: Colors.textMuted }}>
            by {strategy.author}
          </div>
        )}
      </div>
    </div>
  );
}

export function AddStrategyModal({
  availableStrategies,
  selectedIds,
  onAdd,
  onClose,
}: AddStrategyModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const notAddedStrategies = availableStrategies.filter(s => !selectedIds.has(s.id));

  const filteredStrategies = notAddedStrategies.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const mineStrategies = filteredStrategies.filter(s => s.source === 'mine');
  const purchasedStrategies = filteredStrategies.filter(s => s.source === 'purchased');
  const subscribedStrategies = filteredStrategies.filter(s => s.source === 'subscribed');

  const handleToggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAdd = () => {
    onAdd(Array.from(selected));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: Colors.bgSecondary }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: Colors.border }}>
          <h2 className="text-lg font-semibold" style={{ color: Colors.text }}>添加策略</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-neutral-800"
          >
            <X size={18} style={{ color: Colors.textMuted }} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b" style={{ borderColor: Colors.border }}>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: Colors.textMuted }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索策略..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: Colors.bgTertiary, border: `1px solid ${Colors.border}`, color: Colors.text }}
            />
          </div>
        </div>

        {/* Strategy List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {mineStrategies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} style={{ color: Colors.accent }} />
                <span className="text-sm font-medium" style={{ color: Colors.accent }}>我的策略</span>
              </div>
              <div className="space-y-2">
                {mineStrategies.map((strategy) => (
                  <StrategyItem
                    key={strategy.id}
                    strategy={strategy}
                    isSelected={selected.has(strategy.id)}
                    onToggle={() => handleToggle(strategy.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {purchasedStrategies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart size={14} style={{ color: '#f59e0b' }} />
                <span className="text-sm font-medium" style={{ color: '#f59e0b' }}>已购买</span>
              </div>
              <div className="space-y-2">
                {purchasedStrategies.map((strategy) => (
                  <StrategyItem
                    key={strategy.id}
                    strategy={strategy}
                    isSelected={selected.has(strategy.id)}
                    onToggle={() => handleToggle(strategy.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {subscribedStrategies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} style={{ color: '#06b6d4' }} />
                <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>订阅</span>
              </div>
              <div className="space-y-2">
                {subscribedStrategies.map((strategy) => (
                  <StrategyItem
                    key={strategy.id}
                    strategy={strategy}
                    isSelected={selected.has(strategy.id)}
                    onToggle={() => handleToggle(strategy.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredStrategies.length === 0 && (
            <div className="flex flex-col items-center py-12">
              <p className="text-sm" style={{ color: Colors.textMuted }}>
                没有找到匹配的策略
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: Colors.border }}>
          <span className="text-sm" style={{ color: Colors.textMuted }}>
            已选择 {selected.size} 个策略
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: Colors.bgTertiary, color: Colors.textSecondary }}
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              disabled={selected.size === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: ButtonVariants.primary.bg, color: ButtonVariants.primary.color }}
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
