/**
 * Backtest Scenario Selector Component
 * 
 * 回测场景选择器 - 快速选择预设场景
 */

import { useState } from 'react';
import { Zap, TrendingUp, TrendingDown, Activity, Shield, Target, Briefcase, Flame } from 'lucide-react';
import { Colors } from '../../../presets/presets';
import type { MarketCondition } from '../../../demo/mockBacktestResults';
import type { BacktestScenarioMeta } from '../../../demo/mockBacktestResults';

interface ScenarioSelectorProps {
  scenarios: BacktestScenarioMeta[];
  onSelectScenario: (scenarioId: string) => void;
  onClose?: () => void;
}

// 行情类型筛选器
const MARKET_CONDITIONS: { id: MarketCondition | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: '全部', icon: <Activity size={14} /> },
  { id: 'bull', label: '牛市', icon: <TrendingUp size={14} /> },
  { id: 'bear', label: '熊市', icon: <TrendingDown size={14} /> },
  { id: 'volatile', label: '震荡', icon: <Activity size={14} /> },
  { id: 'stable', label: '稳健', icon: <Shield size={14} /> },
  { id: 'crash', label: '暴跌', icon: <Flame size={14} /> },
];

// 场景图标映射
const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  scenario_bull: <TrendingUp size={20} />,
  scenario_bear: <TrendingDown size={20} />,
  scenario_volatile: <Activity size={20} />,
  scenario_crash: <Flame size={20} />,
  scenario_stable: <Shield size={20} />,
  scenario_newbie: <Target size={20} />,
  scenario_portfolio: <Briefcase size={20} />,
  scenario_highvol: <Flame size={20} />,
};

export function ScenarioSelector({ scenarios, onSelectScenario, onClose }: ScenarioSelectorProps) {
  const [selectedCondition, setSelectedCondition] = useState<MarketCondition | 'all'>('all');

  const filteredScenarios = selectedCondition === 'all'
    ? scenarios
    : scenarios.filter(s => s.marketCondition === selectedCondition);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: Colors.bgTertiary }}
          >
            <Zap size={16} style={{ color: Colors.accent }} />
          </div>
          <div>
            <h3 className="text-sm font-medium" style={{ color: Colors.text }}>快速开始</h3>
            <p className="text-xs" style={{ color: Colors.textMuted }}>选择预设场景快速体验</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs"
            style={{ backgroundColor: Colors.bgTertiary, color: Colors.textMuted }}
          >
            关闭
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {MARKET_CONDITIONS.map((condition) => (
          <button
            key={condition.id}
            onClick={() => setSelectedCondition(condition.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              backgroundColor: selectedCondition === condition.id ? Colors.accent : Colors.bgTertiary,
              color: selectedCondition === condition.id ? '#ffffff' : Colors.textMuted,
              border: `1px solid ${selectedCondition === condition.id ? Colors.accent : Colors.border}`,
            }}
          >
            {condition.icon}
            {condition.label}
          </button>
        ))}
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-2 gap-3">
        {filteredScenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onSelect={() => onSelectScenario(scenario.id)}
          />
        ))}
      </div>
    </div>
  );
}

// 单个场景卡片
interface ScenarioCardProps {
  scenario: BacktestScenarioMeta;
  onSelect: () => void;
}

function ScenarioCard({ scenario, onSelect }: ScenarioCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-4 rounded-xl text-left transition-all"
      style={{
        backgroundColor: isHovered ? '#1a1a1a' : Colors.bgSecondary,
        border: `1px solid ${isHovered ? scenario.color : Colors.border}`,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <span 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: `${scenario.color}20` }}
        >
          {scenario.icon}
        </span>
        <span 
          className="text-xs px-2 py-0.5 rounded"
          style={{ backgroundColor: `${scenario.color}20`, color: scenario.color }}
        >
          {getConditionLabel(scenario.marketCondition)}
        </span>
      </div>
      
      <h4 className="text-sm font-medium mb-1" style={{ color: Colors.text }}>
        {scenario.name}
      </h4>
      <p className="text-xs mb-3" style={{ color: Colors.textMuted }}>
        {scenario.description}
      </p>
      
      <div 
        className="text-xs font-medium px-2 py-1 rounded"
        style={{ backgroundColor: Colors.accent, color: '#ffffff' }}
      >
        立即体验
      </div>
    </button>
  );
}

// 获取行情类型标签
function getConditionLabel(condition: MarketCondition): string {
  const labels: Record<MarketCondition, string> = {
    bull: '牛市',
    bear: '熊市',
    volatile: '震荡',
    stable: '稳健',
    crash: '暴跌',
  };
  return labels[condition] || condition;
}

// 导出场景图标获取函数
export function getScenarioIcon(scenarioId: string): React.ReactNode {
  return SCENARIO_ICONS[scenarioId] || <Activity size={20} />;
}
