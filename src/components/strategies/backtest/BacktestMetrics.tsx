/**
 * BacktestMetrics Component
 * 
 * 回测指标展示组件
 */

import { TrendingUp, TrendingDown, BarChart3, Zap } from 'lucide-react';
import type { BacktestResult } from '../../../stores/backtestStore';

interface MetricCardProps {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
  description?: string;
}

function MetricCard({ label, value, color, icon, description }: MetricCardProps) {
  return (
    <div 
      className="p-4 rounded-xl"
      style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div style={{ color }}>{icon}</div>
        <span className="text-xs" style={{ color: '#737373' }}>{label}</span>
      </div>
      <div 
        className="text-2xl font-bold"
        style={{ color }}
      >
        {value}
      </div>
      {description && (
        <div className="text-xs mt-1" style={{ color: '#525252' }}>
          {description}
        </div>
      )}
    </div>
  );
}

interface BacktestMetricsProps {
  result: BacktestResult;
  config: {
    initialCapital: number;
  };
}

export function BacktestMetrics({ result, config }: BacktestMetricsProps) {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="总收益"
          value={`${result.totalReturn >= 0 ? '+' : ''}${result.totalReturn.toFixed(2)}%`}
          color={result.totalReturn >= 0 ? '#22c55e' : '#ef4444'}
          icon={<TrendingUp size={16} />}
          description={`初始资金 $${config.initialCapital.toLocaleString()}`}
        />
        
        <MetricCard
          label="夏普比率"
          value={result.sharpeRatio.toFixed(2)}
          color={result.sharpeRatio >= 1 ? '#22c55e' : '#fbbf24'}
          icon={<BarChart3 size={16} />}
          description="风险调整收益"
        />
        
        <MetricCard
          label="最大回撤"
          value={`-${result.maxDrawdown.toFixed(2)}%`}
          color="#ef4444"
          icon={<TrendingDown size={16} />}
          description="历史最大亏损"
        />
        
        <MetricCard
          label="胜率"
          value={`${result.winRate.toFixed(0)}%`}
          color={result.winRate >= 50 ? '#22c55e' : '#ef4444'}
          icon={<Zap size={16} />}
          description={`${result.profitableTrades}/${result.totalTrades} 笔盈利`}
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="收益率"
          value={`${result.totalReturn >= 0 ? '+' : ''}${result.totalReturn.toFixed(2)}%`}
          color={result.totalReturn >= 0 ? '#22c55e' : '#ef4444'}
          icon={<TrendingUp size={14} />}
        />
        <MetricCard
          label="夏普比率"
          value={result.sharpeRatio.toFixed(2)}
          color={result.sharpeRatio >= 1 ? '#22c55e' : '#fbbf24'}
          icon={<BarChart3 size={14} />}
        />
        <MetricCard
          label="最大回撤"
          value={`-${result.maxDrawdown.toFixed(1)}%`}
          color="#ef4444"
          icon={<TrendingDown size={14} />}
        />
        <MetricCard
          label="胜率"
          value={`${result.winRate.toFixed(0)}%`}
          color={result.winRate >= 50 ? '#22c55e' : '#ef4444'}
          icon={<Zap size={14} />}
        />
      </div>
    </div>
  );
}

export { MetricCard };
