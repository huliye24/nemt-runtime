/**
 * BacktestConfigForm Component
 * 
 * 回测配置表单组件
 */

import { Zap } from 'lucide-react';
import type { StrategyData } from '../CreateStrategyModal';
import { 
  useBacktestStore, 
  BACKTEST_SOURCES, 
  BACKTEST_INTERVALS, 
  BACKTEST_SYMBOLS,
  TIME_RANGES,
} from '../../../stores/backtestStore';

interface BacktestConfigFormProps {
  strategies: StrategyData[];
  selectedStrategyId: string | null;
  config: {
    sourceId: string;
    symbol: string;
    interval: string;
    startDate: string;
    endDate: string;
    initialCapital: number;
    commission: number;
    slippage: number;
  };
  onStrategyChange: (strategyId: string) => void;
  onConfigChange: (config: any) => void;
  onApplyQuickTest: () => void;
  onApplyTimeRange: (days: number) => void;
  onRunBacktest: () => void;
  isReady: boolean;
  isRunning: boolean;
  progress: number;
}

export function BacktestConfigForm({
  strategies,
  selectedStrategyId,
  config,
  onStrategyChange,
  onConfigChange,
  onApplyQuickTest,
  onApplyTimeRange,
  onRunBacktest,
  isReady,
  isRunning,
  progress,
}: BacktestConfigFormProps) {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Strategy Selection */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
      >
        <label className="block text-sm font-medium mb-3" style={{ color: '#ffffff' }}>
          策略
        </label>
        <select
          value={selectedStrategyId || ''}
          onChange={(e) => onStrategyChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
        >
          <option value="">选择策略...</option>
          {strategies.filter(s => s.status !== 'draft').map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      
      {/* Data Source */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
      >
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium" style={{ color: '#ffffff' }}>
            数据源
          </label>
          <button
            onClick={onApplyQuickTest}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
            style={{ backgroundColor: '#6b21a8', color: '#ffffff' }}
          >
            <Zap size={12} />
            快速测试
          </button>
        </div>
        
        {/* Source buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {BACKTEST_SOURCES.map((source) => (
            <button
              key={source.id}
              onClick={() => onConfigChange({ 
                ...config, 
                sourceId: source.id, 
                symbol: BACKTEST_SYMBOLS[source.id][0] 
              })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all"
              style={{
                backgroundColor: config.sourceId === source.id ? '#262626' : '#1a1a1a',
                border: `1px solid ${config.sourceId === source.id ? '#6b21a8' : '#2a2a2a'}`,
                color: config.sourceId === source.id ? '#ffffff' : '#a3a3a3',
              }}
            >
              <span className="text-base">{source.icon}</span>
              <span>{source.name}</span>
            </button>
          ))}
        </div>
        
        {/* Symbol & Interval */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs mb-2" style={{ color: '#737373' }}>交易品种</label>
            <select
              value={config.symbol}
              onChange={(e) => onConfigChange({ ...config, symbol: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
            >
              {BACKTEST_SYMBOLS[config.sourceId]?.map((sym) => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-2" style={{ color: '#737373' }}>时间周期</label>
            <select
              value={config.interval}
              onChange={(e) => onConfigChange({ ...config, interval: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
            >
              {BACKTEST_INTERVALS.map((int) => (
                <option key={int.value} value={int.value}>{int.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Time Range */}
        <div className="mb-4">
          <label className="block text-xs mb-2" style={{ color: '#737373' }}>时间范围</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {TIME_RANGES.map((range) => (
              <button
                key={range.days}
                onClick={() => onApplyTimeRange(range.days)}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{ 
                  backgroundColor: '#1a1a1a', 
                  color: '#a3a3a3',
                  border: '1px solid #2a2a2a',
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={config.startDate}
              onChange={(e) => onConfigChange({ ...config, startDate: e.target.value })}
              className="px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
            />
            <input
              type="date"
              value={config.endDate}
              onChange={(e) => onConfigChange({ ...config, endDate: e.target.value })}
              className="px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
            />
          </div>
        </div>
      </div>
      
      {/* Settings */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
      >
        <label className="block text-sm font-medium mb-3" style={{ color: '#ffffff' }}>
          参数设置
        </label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs mb-2" style={{ color: '#737373' }}>初始资金</label>
            <input
              type="number"
              value={config.initialCapital}
              onChange={(e) => onConfigChange({ ...config, initialCapital: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
            />
          </div>
          <div>
            <label className="block text-xs mb-2" style={{ color: '#737373' }}>手续费 (%)</label>
            <input
              type="number"
              step="0.01"
              value={config.commission}
              onChange={(e) => onConfigChange({ ...config, commission: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
            />
          </div>
          <div>
            <label className="block text-xs mb-2" style={{ color: '#737373' }}>滑点 (%)</label>
            <input
              type="number"
              step="0.01"
              value={config.slippage}
              onChange={(e) => onConfigChange({ ...config, slippage: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
            />
          </div>
        </div>
      </div>
      
      {/* Run Button */}
      <button
        onClick={onRunBacktest}
        disabled={!isReady || isRunning}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-base font-semibold transition-all disabled:opacity-50"
        style={{ 
          backgroundColor: isReady && !isRunning ? '#6b21a8' : '#1a1a1a',
          color: isReady && !isRunning ? '#ffffff' : '#737373',
        }}
      >
        {isRunning ? (
          <>
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
              <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
            </svg>
            运行中 {progress}%
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            开始回测
          </>
        )}
      </button>
    </div>
  );
}
