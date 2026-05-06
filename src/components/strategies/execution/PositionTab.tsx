/**
 * PositionTab Component
 * 
 * 持仓 Tab
 */

import { Wallet } from 'lucide-react';
import { Colors } from '../../../presets/presets';

interface Position {
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  amount: number;
  pnl: number;
  pnlPercent: number;
  strategyId: string;
}

interface PositionTabProps {
  positions: Position[];
  currentPrice: number;
  onClosePosition: (_strategyId: string) => void;
}

export function PositionTab({ positions, currentPrice, onClosePosition }: PositionTabProps) {
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const avgPnlPercent = positions.length > 0
    ? positions.reduce((sum, p) => sum + p.pnlPercent, 0) / positions.length
    : 0;

  return (
    <div className="space-y-4">
      {/* Position Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl" style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}>
          <div className="text-xs mb-2" style={{ color: Colors.textMuted }}>策略持仓</div>
          <div className="text-lg font-semibold" style={{ color: Colors.text }}>{positions.length}</div>
        </div>
        <div className="p-4 rounded-xl" style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}>
          <div className="text-xs mb-2" style={{ color: Colors.textMuted }}>总盈亏</div>
          <div className="text-lg font-semibold" style={{ color: totalPnl >= 0 ? Colors.success : Colors.error }}>
            {positions.length > 0 ? `${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} USDT` : '--'}
          </div>
        </div>
        <div className="p-4 rounded-xl" style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}>
          <div className="text-xs mb-2" style={{ color: Colors.textMuted }}>平均收益率</div>
          <div className="text-lg font-semibold" style={{ color: avgPnlPercent >= 0 ? Colors.success : Colors.error }}>
            {positions.length > 0 ? `${avgPnlPercent >= 0 ? '+' : ''}${avgPnlPercent.toFixed(2)}%` : '--'}
          </div>
        </div>
      </div>

      {/* Positions List */}
      {positions.length > 0 ? (
        <div className="space-y-4">
          {positions.map((position) => (
            <div
              key={position.strategyId}
              className="p-6 rounded-xl space-y-4"
              style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: Colors.text }}>{position.strategyId}</span>
                  <span className="text-xs px-2 py-1 rounded"
                    style={{
                      color: position.side === 'long' ? Colors.success : Colors.error,
                      backgroundColor: position.side === 'long' ? `${Colors.success}15` : `${Colors.error}15`
                    }}
                  >
                    {position.side === 'long' ? '做多' : '做空'}
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color: position.pnl >= 0 ? Colors.success : Colors.error }}>
                  {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)} USDT ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-xs mb-1" style={{ color: Colors.textMuted }}>品种</div>
                  <div className="text-sm" style={{ color: Colors.text }}>{position.symbol}</div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: Colors.textMuted }}>数量</div>
                  <div className="text-sm" style={{ color: Colors.text }}>{position.amount.toFixed(6)}</div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: Colors.textMuted }}>入场价</div>
                  <div className="text-sm" style={{ color: Colors.text }}>${position.entryPrice.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: Colors.textMuted }}>当前价</div>
                  <div className="text-sm" style={{ color: Colors.text }}>${currentPrice.toLocaleString()}</div>
                </div>
              </div>

              <button
                onClick={() => onClosePosition(position.strategyId)}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all mt-2"
                style={{ backgroundColor: Colors.error }}
              >
                平仓
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-xl flex flex-col items-center" style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}>
          <Wallet size={48} style={{ color: Colors.textMuted }} />
          <p className="mt-4 text-sm" style={{ color: Colors.textMuted }}>
            当前无持仓
          </p>
          <p className="text-xs mt-1" style={{ color: '#525252' }}>
            策略发出买入信号后将自动建仓
          </p>
        </div>
      )}
    </div>
  );
}
