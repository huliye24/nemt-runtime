/**
 * MonitorTab Component
 * 
 * 监控面板 Tab
 */

import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type SignalType = 'buy' | 'sell' | 'hold';

interface Signal {
  time: Date;
  type: SignalType;
  price: number;
  reason: string;
  strength: number;
  strategyName: string;
}

interface MonitorTabProps {
  signals: Signal[];
  currentPrice: number;
  priceChange24h: number;
}

function getSignalIcon(type: SignalType) {
  switch (type) {
    case 'buy': return <TrendingUp size={14} style={{ color: '#22c55e' }} />;
    case 'sell': return <TrendingDown size={14} style={{ color: '#ef4444' }} />;
    case 'hold': return <Minus size={14} style={{ color: '#737373' }} />;
  }
}

function getSignalColor(type: SignalType) {
  switch (type) {
    case 'buy': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' };
    case 'sell': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
    case 'hold': return { bg: 'rgba(115, 115, 115, 0.1)', text: '#737373' };
  }
}

export function MonitorTab({ signals, currentPrice, priceChange24h }: MonitorTabProps) {
  const priceColor = priceChange24h >= 0 ? '#22c55e' : '#ef4444';

  return (
    <div className="space-y-4">
      {/* Price Display */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
              <Activity size={20} style={{ color: '#c084fc' }} />
            </div>
            <div>
              <div className="text-sm" style={{ color: '#737373' }}>当前价格</div>
              <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                ${currentPrice.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs mb-1" style={{ color: '#737373' }}>24h 涨跌</div>
            <div className="text-lg font-semibold" style={{ color: priceColor }}>
              {priceChange24h >= 0 ? '+' : ''}{priceChange24h >= 0 ? '' : ''}
              {priceChange24h.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Signal List */}
      <div className="rounded-xl" style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#1f1f1f' }}>
          <span className="text-sm font-medium" style={{ color: '#ffffff' }}>信号记录</span>
          <span className="text-xs" style={{ color: '#737373' }}>{signals.length} 条</span>
        </div>

        {signals.length > 0 ? (
          <div className="max-h-64 overflow-y-auto">
            {signals.slice(0, 20).map((signal, index) => {
              const config = getSignalColor(signal.type);
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                  style={{ borderColor: '#1a1a1a' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: config.bg }}
                  >
                    {getSignalIcon(signal.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{ backgroundColor: config.bg, color: config.text }}
                      >
                        {signal.type === 'buy' ? '买入' : signal.type === 'sell' ? '卖出' : '观望'}
                      </span>
                      <span className="text-xs" style={{ color: '#a3a3a3' }}>
                        @ ${signal.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#737373' }}>
                      <span>{signal.strategyName}</span>
                      <span>·</span>
                      <span>{signal.reason}</span>
                      <span>·</span>
                      <span>{(signal.strength * 100).toFixed(0)}% 强度</span>
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: '#525252' }}>
                    {signal.time.toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-12">
            <TrendingUp size={48} style={{ color: '#404040' }} />
            <p className="mt-4 text-sm" style={{ color: '#737373' }}>
              暂无信号
            </p>
            <p className="text-xs mt-1" style={{ color: '#525252' }}>
              启动策略后开始记录信号
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
