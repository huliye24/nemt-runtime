/**
 * StrategyPerformanceList Component
 * 
 * 策略绩效列表
 */

import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type { StrategyPerformance, AllocationResult } from '../../../types/portfolio';

interface StrategyPerformanceListProps {
  performances: StrategyPerformance[];
  allocations: AllocationResult[];
  stopLossPercent: number;
}

const COLORS = ['#c084fc', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

function PerformanceBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const width = Math.min((value / maxValue) * 100, 100);
  return (
    <div>
      <div className="text-xs mb-1" style={{ color: '#737373' }}>{label}</div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a2a' }}>
        <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
      <div className="text-xs mt-1" style={{ color: '#a3a3a3' }}>{value.toFixed(1)}%</div>
    </div>
  );
}

export function StrategyPerformanceList({
  performances,
  allocations,
  stopLossPercent,
}: StrategyPerformanceListProps) {
  return (
    <div className="p-6 rounded-xl" style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}>
      <h3 className="text-sm font-medium text-white mb-4">策略绩效</h3>
      <div className="space-y-3">
        {performances.map((perf, index) => {
          const allocation = allocations.find((a) => a.strategyId === perf.strategyId);
          const isProfitable = perf.returns >= 0;
          const isStopLoss = perf.returns < -stopLossPercent;
          const color = COLORS[index % COLORS.length];

          return (
            <div
              key={perf.strategyId}
              className="p-4 rounded-xl"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: color + '30', color }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{perf.strategyName}</div>
                    <div className="text-xs" style={{ color: '#737373' }}>
                      {perf.tradeCount} 笔交易
                    </div>
                  </div>
                </div>

                {isStopLoss && (
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: '#dc262620', color: '#dc2626' }}
                  >
                    <AlertTriangle size={12} />
                    止损
                  </div>
                )}

                <div className="text-right">
                  <div className="text-lg font-bold flex items-center gap-1" style={{ color: isProfitable ? '#22c55e' : '#dc2626' }}>
                    {isProfitable ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    {isProfitable ? '+' : ''}{perf.returns.toFixed(1)}%
                  </div>
                  <div className="text-xs" style={{ color: '#737373' }}>
                    夏普 {perf.sharpeRatio.toFixed(2)} · 胜率 {(perf.winRate * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Performance Bars */}
              <div className="grid grid-cols-4 gap-4 mb-3">
                <PerformanceBar label="回撤" value={perf.maxDrawdown} maxValue={50} color={perf.maxDrawdown > 20 ? '#dc2626' : '#f59e0b'} />
                <PerformanceBar label="波动率" value={perf.volatility * 100} maxValue={100} color="#3b82f6" />
                <PerformanceBar label="稳定性" value={perf.consistency * 100} maxValue={100} color="#22c55e" />
                <PerformanceBar label="评分" value={(allocation?.score || 0) * 100} maxValue={100} color={color} />
              </div>

              {/* Allocation Result */}
              {allocation && (
                <div
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: '#0d0d0d' }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs" style={{ color: '#737373' }}>分配资金</span>
                    <span className="text-lg font-bold text-white">${allocation.allocation.toLocaleString()}</span>
                    <span
                      className="text-sm px-2 py-0.5 rounded"
                      style={{ backgroundColor: color + '20', color }}
                    >
                      {allocation.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {allocation.change !== 0 && (
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: allocation.change > 0 ? '#22c55e' : '#dc2626' }}
                      >
                        {allocation.change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {allocation.change > 0 ? '+' : ''}${allocation.change.toFixed(0)}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: '#525252' }}>
                      {allocation.reason}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
