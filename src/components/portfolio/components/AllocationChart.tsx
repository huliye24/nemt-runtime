/**
 * AllocationChart Component
 * 
 * 分配可视化图表
 */

import { Colors } from '../../../presets/presets';
import type { AllocationResult } from '../../../types/portfolio';

interface AllocationChartProps {
  allocations: AllocationResult[];
}

const COLORS = ['#c084fc', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

type ReactNode = import('react').ReactNode;

export function AllocationChart({ allocations }: AllocationChartProps) {
  return (
    <div className="p-6 rounded-xl" style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}>
      <h3 className="text-sm font-medium mb-4" style={{ color: Colors.text }}>分配可视化</h3>
      <div className="flex items-center gap-6">
        {/* Simple Pie Chart */}
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {allocations.length > 0 ? (
              allocations.reduce(
                (acc, alloc, index) => {
                  const percentage = alloc.percentage;
                  const dashArray = `${(percentage / 100) * 251.2} 251.2`;
                  acc.elements.push(
                    <circle
                      key={alloc.strategyId}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth="20"
                      strokeDasharray={dashArray}
                      strokeDashoffset={-acc.offset}
                    />
                  );
                  acc.offset += (percentage / 100) * 251.2;
                  return acc;
                },
                { elements: [] as ReactNode[], offset: 0 }
              ).elements
            ) : (
              <circle cx="50" cy="50" r="40" fill="none" stroke={Colors.border} strokeWidth="20" />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs" style={{ color: Colors.textMuted }}>
              {allocations.length > 0 ? `${allocations.length} 个策略` : '无'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {allocations.length > 0 ? (
            allocations.map((alloc, index) => (
              <div key={alloc.strategyId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm" style={{ color: Colors.text }}>{alloc.strategyName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm" style={{ color: Colors.textSecondary }}>
                    ${alloc.allocation.toLocaleString()}
                  </span>
                  <span
                    className="text-xs w-12 text-right"
                    style={{ color: COLORS[index % COLORS.length] }}
                  >
                    {alloc.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm" style={{ color: Colors.textMuted }}>
              暂无分配数据，点击「重新计算分配」生成
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
