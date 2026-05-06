/**
 * CapitalOverview Component
 * 
 * 资金概览卡片
 */

import { Wallet, TrendingUp, DollarSign } from 'lucide-react';

interface CapitalOverviewProps {
  totalCapital: number;
  totalAllocated: number;
}

export function CapitalOverview({ totalCapital, totalAllocated }: CapitalOverviewProps) {
  const percentage = totalCapital > 0 ? (totalAllocated / totalCapital) * 100 : 0;
  const available = totalCapital - totalAllocated;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div
        className="p-6 rounded-xl"
        style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Wallet size={20} style={{ color: '#c084fc' }} />
          <span className="text-sm font-medium" style={{ color: '#a3a3a3' }}>
            总资金
          </span>
        </div>
        <div className="text-2xl font-bold text-white">
          ${totalCapital.toLocaleString()}
        </div>
      </div>

      <div
        className="p-6 rounded-xl"
        style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={20} style={{ color: '#22c55e' }} />
          <span className="text-sm font-medium" style={{ color: '#a3a3a3' }}>
            已分配
          </span>
        </div>
        <div className="text-2xl font-bold text-white">
          ${totalAllocated.toLocaleString()}
        </div>
        <div
          className="text-xs mt-1"
          style={{
            color: totalAllocated > totalCapital ? '#dc2626' : '#737373',
          }}
        >
          {percentage.toFixed(1)}% 已分配
        </div>
      </div>

      <div
        className="p-6 rounded-xl"
        style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <DollarSign size={20} style={{ color: '#f59e0b' }} />
          <span className="text-sm font-medium" style={{ color: '#a3a3a3' }}>
            可分配
          </span>
        </div>
        <div className="text-2xl font-bold text-white">
          ${available.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
