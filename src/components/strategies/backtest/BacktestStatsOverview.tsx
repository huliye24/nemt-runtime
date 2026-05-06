/**
 * Backtest Statistics Overview Component
 * 
 * 回测统计概览组件 - 展示预设场景的整体统计
 */

import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Activity, Shield, Zap } from 'lucide-react';
import { Colors } from '../../../presets/presets';
import { backtestPresets } from '../../../services/backtestPresets';
import type { MarketCondition } from '../../../demo/mockBacktestResults';

export function BacktestStatsOverview() {
  const allResults = backtestPresets.getAllResults();
  
  // 计算整体统计
  const stats = {
    totalScenarios: allResults.length,
    avgReturn: allResults.reduce((sum, r) => sum + r.totalReturn, 0) / allResults.length || 0,
    avgSharpe: allResults.reduce((sum, r) => sum + r.sharpeRatio, 0) / allResults.length || 0,
    avgDrawdown: allResults.reduce((sum, r) => sum + r.maxDrawdown, 0) / allResults.length || 0,
    bestScenario: allResults.reduce((best, r) => r.totalReturn > best.totalReturn ? r : best, allResults[0]),
    worstScenario: allResults.reduce((worst, r) => r.totalReturn < worst.totalReturn ? r : worst, allResults[0]),
  };

  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}>
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} style={{ color: Colors.accent }} />
        <h3 className="text-sm font-medium" style={{ color: Colors.text }}>场景统计</h3>
      </div>
      
      {/* 整体统计卡片 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard
          label="平均收益率"
          value={`${stats.avgReturn >= 0 ? '+' : ''}${stats.avgReturn.toFixed(1)}%`}
          icon={stats.avgReturn >= 0 ? TrendingUp : TrendingDown}
          color={stats.avgReturn >= 0 ? '#22c55e' : '#ef4444'}
        />
        <StatCard
          label="平均夏普比率"
          value={stats.avgSharpe.toFixed(2)}
          icon={Activity}
          color={stats.avgSharpe >= 1 ? '#22c55e' : '#fbbf24'}
        />
        <StatCard
          label="平均最大回撤"
          value={`-${stats.avgDrawdown.toFixed(1)}%`}
          icon={Shield}
          color="#ef4444"
        />
        <StatCard
          label="预设场景数"
          value={stats.totalScenarios.toString()}
          icon={Zap}
          color={Colors.accent}
        />
      </div>

      {/* 最佳/最差场景 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: `${Colors.accent}10` }}>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: '#22c55e' }} />
            <span className="text-xs" style={{ color: '#737373' }}>最佳</span>
          </div>
          <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
            {stats.bestScenario?.strategyName || 'N/A'} (+{stats.bestScenario?.totalReturn?.toFixed(1)}%)
          </span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
          <div className="flex items-center gap-2">
            <TrendingDown size={14} style={{ color: '#ef4444' }} />
            <span className="text-xs" style={{ color: '#737373' }}>最差</span>
          </div>
          <span className="text-xs font-medium" style={{ color: '#ef4444' }}>
            {stats.worstScenario?.strategyName || 'N/A'} ({stats.worstScenario?.totalReturn?.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

// 统计卡片
interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div 
      className="p-3 rounded-lg"
      style={{ backgroundColor: Colors.bgTertiary, border: `1px solid ${Colors.border}` }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} style={{ color }} />
        <span className="text-xs" style={{ color: '#737373' }}>{label}</span>
      </div>
      <div className="text-lg font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

// 按市场行情分类统计
export function BacktestConditionStats() {
  const conditions: { id: MarketCondition; label: string; icon: string; color: string }[] = [
    { id: 'bull', label: '牛市', icon: '📈', color: '#22c55e' },
    { id: 'bear', label: '熊市', icon: '📉', color: '#f97316' },
    { id: 'volatile', label: '震荡', icon: '📊', color: '#a855f7' },
    { id: 'stable', label: '稳健', icon: '🛡️', color: '#3b82f6' },
    { id: 'crash', label: '暴跌', icon: '⚡', color: '#ef4444' },
  ];

  const allScenarios = backtestPresets.getAll();

  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}>
      <h3 className="text-sm font-medium mb-3" style={{ color: Colors.text }}>按行情分类</h3>
      
      <div className="space-y-2">
        {conditions.map((condition) => {
          const scenarios = allScenarios.filter(s => s.marketCondition === condition.id);
          if (scenarios.length === 0) return null;
          
          const avgReturn = scenarios.reduce((sum, s) => {
            const result = backtestPresets.getResult(s.id);
            return sum + (result?.totalReturn || 0);
          }, 0) / scenarios.length;

          return (
            <div 
              key={condition.id}
              className="flex items-center justify-between p-2 rounded-lg"
              style={{ backgroundColor: Colors.bgTertiary }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{condition.icon}</span>
                <span className="text-xs" style={{ color: '#e5e5e5' }}>{condition.label}</span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${condition.color}20`, color: condition.color }}>
                  {scenarios.length} 个
                </span>
              </div>
              <span 
                className="text-xs font-medium"
                style={{ color: avgReturn >= 0 ? '#22c55e' : '#ef4444' }}
              >
                {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
