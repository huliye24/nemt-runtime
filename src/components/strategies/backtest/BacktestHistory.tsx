/**
 * BacktestHistory Component
 * 
 * 回测历史记录组件 - 增强版
 * 支持预设场景展示和分类
 */

import { useState } from 'react';
import { History, Star, Clock, TrendingUp, Zap } from 'lucide-react';
import { Colors } from '../../../presets/presets';
import type { BacktestResult } from '../../../stores/backtestStore';
import { backtestPresets } from '../../../services/backtestPresets';

interface BacktestHistoryProps {
  results: BacktestResult[];
  onSelectResult: (result: BacktestResult) => void;
  onSelectPreset?: (scenarioId: string) => void;
  showPresets?: boolean;
}

type FilterType = 'all' | 'presets' | 'custom';

export function BacktestHistory({ 
  results, 
  onSelectResult, 
  onSelectPreset,
  showPresets = true 
}: BacktestHistoryProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  // 分离预设结果和自定义结果
  const presetResults = backtestPresets.getAllResults();
  const customResults = results.filter(r => !r.id.startsWith('preset_'));
  
  // 根据筛选条件过滤
  const filteredResults = filter === 'all' 
    ? results 
    : filter === 'presets' 
      ? []  // 预设场景通过独立区域展示
      : customResults;

  return (
    <div className="space-y-6">
      {/* 预设场景快捷入口 */}
      {showPresets && onSelectPreset && (
        <PresetScenariosSection onSelectPreset={onSelectPreset} />
      )}

      {/* 筛选标签 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium" style={{ color: Colors.text }}>回测历史</h3>
          <span className="text-xs" style={{ color: Colors.textMuted }}>
            {filter === 'all' ? results.length : customResults.length} 条记录
          </span>
        </div>
        
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: Colors.bgTertiary }}>
          <FilterTab 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
            count={results.length}
          >
            全部
          </FilterTab>
          <FilterTab 
            active={filter === 'custom'} 
            onClick={() => setFilter('custom')}
            count={customResults.length}
          >
            自定义
          </FilterTab>
        </div>
      </div>
      
      {/* 回测列表 */}
      {filteredResults.length > 0 ? (
        <div className="space-y-3">
          {filteredResults.slice().reverse().map((result) => (
            <HistoryCard
              key={result.id}
              result={result}
              onClick={() => onSelectResult(result)}
            />
          ))}
        </div>
      ) : (
        <EmptyState type={filter} />
      )}
    </div>
  );
}

// 预设场景快捷入口
function PresetScenariosSection({ onSelectPreset }: { onSelectPreset: (id: string) => void }) {
  const scenarios = backtestPresets.getAll().slice(0, 4); // 只显示前4个

  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={16} style={{ color: Colors.accent }} />
        <h3 className="text-sm font-medium" style={{ color: Colors.text }}>快速体验</h3>
        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${Colors.accent}20`, color: Colors.accent }}>
          预设场景
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelectPreset(scenario.id)}
            className="flex items-center gap-2 p-3 rounded-lg text-left transition-all"
            style={{ 
              backgroundColor: Colors.bgTertiary,
              border: `1px solid ${Colors.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = scenario.color;
              e.currentTarget.style.backgroundColor = `${scenario.color}10`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = Colors.border;
              e.currentTarget.style.backgroundColor = Colors.bgTertiary;
            }}
          >
            <span className="text-lg">{scenario.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: Colors.text }}>
                {scenario.name}
              </div>
              <div className="text-xs truncate" style={{ color: Colors.textMuted }}>
                {backtestPresets.getConfig(scenario.id)?.symbol || 'N/A'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// 筛选标签
function FilterTab({ 
  active, 
  onClick, 
  count, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all"
      style={{
        backgroundColor: active ? Colors.accent : 'transparent',
        color: active ? '#ffffff' : Colors.textMuted,
      }}
    >
      {children}
      <span style={{ opacity: 0.7 }}>({count})</span>
    </button>
  );
}

// 历史记录卡片
interface HistoryCardProps {
  result: BacktestResult;
  onClick: () => void;
  isPreset?: boolean;
}

function HistoryCard({ result, onClick, isPreset }: HistoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // 检查是否是预设结果
  const scenarioMeta = result.id.startsWith('preset_') 
    ? backtestPresets.getById(result.id.replace('preset_', ''))
    : null;

  return (
    <div
      className="p-4 rounded-xl cursor-pointer transition-all"
      style={{ 
        backgroundColor: isHovered ? '#1a1a1a' : '#141414', 
        border: `1px solid ${isHovered ? '#3d3660' : '#2a2a2a'}`,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* 预设标签 */}
          {scenarioMeta && (
            <span 
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: `${scenarioMeta.color}20`, color: scenarioMeta.color }}
            >
              <Star size={10} />
              {scenarioMeta.icon} {scenarioMeta.name}
            </span>
          )}
          <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
            {result.strategyName || '策略'}
          </span>
          <span 
            className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: '#1a1a1a', color: '#737373' }}
          >
            {result.startDate} ~ {result.endDate}
          </span>
        </div>
        <span 
          className="text-sm font-medium"
          style={{ color: result.totalReturn >= 0 ? '#22c55e' : '#ef4444' }}
        >
          {result.totalReturn >= 0 ? '+' : ''}{result.totalReturn.toFixed(2)}%
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs" style={{ color: '#737373' }}>
        <span className="flex items-center gap-1">
          <TrendingUp size={12} />
          夏普 {result.sharpeRatio.toFixed(2)}
        </span>
        <span>回撤 -{result.maxDrawdown.toFixed(1)}%</span>
        <span>胜率 {result.winRate.toFixed(0)}%</span>
        <span>{result.totalTrades} 笔交易</span>
      </div>
    </div>
  );
}

// 空状态
function EmptyState({ type }: { type: FilterType }) {
  const messages = {
    all: { icon: History, text: '暂无回测历史' },
    presets: { icon: Star, text: '暂无预设场景' },
    custom: { icon: Clock, text: '暂无自定义回测' },
  };
  
  const { icon: Icon, text } = messages[type];

  return (
    <div 
      className="flex flex-col items-center justify-center h-48 rounded-xl"
      style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
    >
      <Icon size={40} style={{ color: '#404040' }} />
      <p className="mt-4 text-sm" style={{ color: '#737373' }}>{text}</p>
      <p className="text-xs mt-1" style={{ color: '#525252' }}>
        {type === 'custom' ? '去"快速开始"体验预设场景' : '开始你的第一次回测'}
      </p>
    </div>
  );
}
