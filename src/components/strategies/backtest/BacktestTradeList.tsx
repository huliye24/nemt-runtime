/**
 * BacktestTradeList Component
 * 
 * 回测交易记录列表组件
 */

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { BacktestTrade } from '../../../stores/backtestStore';

interface BacktestTradeListProps {
  trades: BacktestTrade[];
}

export function BacktestTradeList({ trades }: BacktestTradeListProps) {
  if (!trades || trades.length === 0) {
    return (
      <div 
        className="rounded-xl p-12 text-center"
        style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
      >
        <p className="text-sm" style={{ color: '#737373' }}>
          暂无交易记录
        </p>
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
    >
      <div className="px-4 py-3 border-b" style={{ borderColor: '#1f1f1f' }}>
        <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
          交易记录 ({trades.length} 笔)
        </span>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center justify-between px-4 py-3 border-b last:border-b-0"
            style={{ borderColor: '#1a1a1a' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: trade.type === 'buy' ? '#052e16' : '#450a0a' }}
              >
                {trade.type === 'buy' ? (
                  <ArrowUpRight size={14} style={{ color: '#22c55e' }} />
                ) : (
                  <ArrowDownRight size={14} style={{ color: '#ef4444' }} />
                )}
              </div>
              <div>
                <div className="text-sm" style={{ color: '#ffffff' }}>
                  {trade.type === 'buy' ? '买入' : '卖出'} @ ${trade.price.toFixed(2)}
                </div>
                <div className="text-xs" style={{ color: '#737373' }}>
                  {trade.date} · {trade.quantity.toFixed(4)} 手
                </div>
              </div>
            </div>
            {trade.pnl !== 0 && (
              <div 
                className="text-sm font-medium"
                style={{ color: trade.pnl >= 0 ? '#22c55e' : '#ef4444' }}
              >
                {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
