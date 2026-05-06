/**
 * NEMT Platform - Backtest Result Detail Component
 * Detailed view of backtest results with charts and trades
 */

import { useState } from 'react';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Activity,
  Percent,
  RefreshCw,
  Download,
  Play,
} from 'lucide-react';
import type { BacktestResult, BacktestConfig } from '../../stores/backtestStore';
import type { StrategyData } from './CreateStrategyModal';

interface BacktestResultDetailProps {
  result: BacktestResult;
  config?: BacktestConfig;
  strategy?: StrategyData;
  onBack: () => void;
  onRunAgain?: () => void;
}

export function BacktestResultDetail({
  result,
  config,
  strategy,
  onBack,
  onRunAgain,
}: BacktestResultDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'equity'>('overview');
  
  const isPositive = result.totalReturn >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: '#141414', color: '#737373' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {strategy?.name || config?.strategyName || '回测结果'}
            </h2>
            <p className="text-xs" style={{ color: '#737373' }}>
              {result.startDate} ~ {result.endDate} · {result.duration} 天
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRunAgain && (
            <button
              onClick={onRunAgain}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: '#1a1a1a', color: '#a3a3a3', border: '1px solid #2a2a2a' }}
            >
              <RefreshCw size={14} />
              重新回测
            </button>
          )}
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ backgroundColor: '#6b21a8', color: '#ffffff' }}
          >
            <Play size={14} />
            开始实盘
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: '#1a1a1a' }}>
        {[
          { id: 'overview', label: '概览', icon: BarChart3 },
          { id: 'equity', label: '权益曲线', icon: TrendingUp },
          { id: 'trades', label: '交易记录', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? '#262626' : 'transparent',
                color: isActive ? '#ffffff' : '#737373',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <OverviewTab result={result} config={config} isPositive={isPositive} />
      )}
      {activeTab === 'equity' && (
        <EquityTab result={result} />
      )}
      {activeTab === 'trades' && (
        <TradesTab result={result} />
      )}
    </div>
  );
}

// ============================================
// Overview Tab
// ============================================

function OverviewTab({ 
  result, 
  config, 
  isPositive 
}: { 
  result: BacktestResult; 
  config?: BacktestConfig;
  isPositive: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main Metrics */}
      <div className="col-span-2 space-y-4">
        {/* Return Card */}
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: '#141414', border: `1px solid ${isPositive ? '#166534' : '#991b1b'}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isPositive ? (
                <TrendingUp size={24} style={{ color: '#22c55e' }} />
              ) : (
                <TrendingDown size={24} style={{ color: '#ef4444' }} />
              )}
              <div>
                <div className="text-xs" style={{ color: '#737373' }}>总收益率</div>
                <div 
                  className="text-3xl font-bold"
                  style={{ color: isPositive ? '#22c55e' : '#ef4444' }}
                >
                  {isPositive ? '+' : ''}{result.totalReturn.toFixed(2)}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs" style={{ color: '#737373' }}>初始资金</div>
              <div className="text-lg font-semibold text-white">
                ${config?.initialCapital?.toLocaleString() || '10,000'}
              </div>
            </div>
          </div>
          
          {/* Mini Equity Chart */}
          <div className="h-24 rounded-lg overflow-hidden" style={{ backgroundColor: '#0d0d0d' }}>
            <EquityMiniChart data={result.equityCurve} isPositive={isPositive} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            label="夏普比率"
            value={result.sharpeRatio.toFixed(2)}
            icon={Target}
            color={result.sharpeRatio >= 1 ? '#22c55e' : '#fbbf24'}
          />
          <MetricCard
            label="最大回撤"
            value={`-${result.maxDrawdown.toFixed(2)}%`}
            icon={TrendingDown}
            color="#ef4444"
          />
          <MetricCard
            label="胜率"
            value={`${result.winRate}%`}
            icon={Percent}
            color={result.winRate >= 50 ? '#22c55e' : '#ef4444'}
          />
          <MetricCard
            label="交易次数"
            value={result.totalTrades.toString()}
            icon={Activity}
            color="#c084fc"
          />
        </div>

        {/* Trade Stats */}
        <div 
          className="p-5 rounded-xl"
          style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
        >
          <h3 className="text-sm font-medium text-white mb-4">交易统计</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#737373' }}>盈利交易</span>
              <span className="text-sm font-medium text-green-400">{result.profitableTrades}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#737373' }}>亏损交易</span>
              <span className="text-sm font-medium text-red-400">{result.totalTrades - result.profitableTrades}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#737373' }}>平均持仓时长</span>
              <span className="text-sm font-medium text-white">2.3 天</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#737373' }}>盈亏比</span>
              <span className="text-sm font-medium text-white">1.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-4">
        {/* Config Info */}
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
        >
          <h3 className="text-sm font-medium text-white mb-3">回测配置</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span style={{ color: '#737373' }}>数据源</span>
              <span className="text-white">{config?.sourceId?.toUpperCase() || 'Binance'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: '#737373' }}>交易品种</span>
              <span className="text-white">{config?.symbol || 'BTC/USDT'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: '#737373' }}>K线周期</span>
              <span className="text-white">{config?.interval || '1d'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: '#737373' }}>手续费率</span>
              <span className="text-white">{config?.commission || 0.1}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: '#737373' }}>滑点</span>
              <span className="text-white">{config?.slippage || 0.05}%</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
        >
          <h3 className="text-sm font-medium text-white mb-3">操作</h3>
          <div className="space-y-2">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ backgroundColor: '#1a1a1a', color: '#a3a3a3' }}
            >
              <Download size={14} />
              导出报告
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ backgroundColor: '#1a1a1a', color: '#a3a3a3' }}
            >
              <BarChart3 size={14} />
              详细分析
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type TabId = 'overview' | 'equity' | 'trades';

// ============================================
// Metric Card
// ============================================

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number | string; style?: React.CSSProperties }>;
  color: string;
}

function MetricCard({ label, value, icon: Icon, color }: MetricCardProps) {
  return (
    <div 
      className="p-4 rounded-xl"
      style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-xs" style={{ color: '#737373' }}>{label}</span>
      </div>
      <div className="text-xl font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

// ============================================
// Equity Tab
// ============================================

function EquityTab({ result }: { result: BacktestResult }) {
  return (
    <div 
      className="p-6 rounded-xl"
      style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">权益曲线</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#c084fc' }} />
            <span style={{ color: '#737373' }}>权益</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
            <span style={{ color: '#737373' }}>回撤</span>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-80 rounded-lg overflow-hidden" style={{ backgroundColor: '#0d0d0d' }}>
        <EquityChart data={result.equityCurve} />
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#1a1a1a' }}>
          <div className="text-xs mb-1" style={{ color: '#737373' }}>起始资金</div>
          <div className="text-sm font-medium text-white">
            ${result.equityCurve[0]?.value.toLocaleString()}
          </div>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#1a1a1a' }}>
          <div className="text-xs mb-1" style={{ color: '#737373' }}>结束资金</div>
          <div className="text-sm font-medium text-white">
            ${result.equityCurve[result.equityCurve.length - 1]?.value.toLocaleString()}
          </div>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#1a1a1a' }}>
          <div className="text-xs mb-1" style={{ color: '#737373' }}>最高资金</div>
          <div className="text-sm font-medium text-green-400">
            ${Math.max(...result.equityCurve.map(e => e.value)).toLocaleString()}
          </div>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#1a1a1a' }}>
          <div className="text-xs mb-1" style={{ color: '#737373' }}>最低资金</div>
          <div className="text-sm font-medium text-red-400">
            ${Math.min(...result.equityCurve.map(e => e.value)).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Trades Tab
// ============================================

function TradesTab({ result }: { result: BacktestResult }) {
  return (
    <div className="space-y-4">
      <div 
        className="p-4 rounded-xl"
        style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">交易记录</h3>
          <span className="text-xs" style={{ color: '#737373' }}>
            共 {result.trades.length} 笔交易
          </span>
        </div>
        
        <div className="space-y-2">
          {/* Header */}
          <div 
            className="grid grid-cols-6 gap-4 px-4 py-2 text-xs rounded-lg"
            style={{ backgroundColor: '#1a1a1a', color: '#737373' }}
          >
            <div>时间</div>
            <div>类型</div>
            <div className="text-right">价格</div>
            <div className="text-right">数量</div>
            <div className="text-right">盈亏</div>
            <div className="text-right">累计</div>
          </div>
          
          {/* Trades */}
          {result.trades.map((trade, idx) => {
            const isBuy = trade.type === 'buy';
            const isProfitable = trade.pnl >= 0;
            
            return (
              <div
                key={trade.id}
                className="grid grid-cols-6 gap-4 px-4 py-3 rounded-lg text-sm transition-colors hover:bg-neutral-800/30"
                style={{ backgroundColor: '#141414' }}
              >
                <div className="text-white">{trade.date}</div>
                <div>
                  <span 
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: isBuy ? '#052e16' : '#450a0a',
                      color: isBuy ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {isBuy ? '买入' : '卖出'}
                  </span>
                </div>
                <div className="text-right text-white">${trade.price.toFixed(2)}</div>
                <div className="text-right text-white">{trade.quantity.toFixed(4)}</div>
                <div 
                  className="text-right font-medium"
                  style={{ color: isProfitable ? '#22c55e' : '#ef4444' }}
                >
                  {isProfitable ? '+' : ''}{trade.pnl.toFixed(2)}
                </div>
                <div className="text-right" style={{ color: '#737373' }}>
                  ${(result.equityCurve[0]?.value + result.trades.slice(0, idx + 1).reduce((sum, t) => sum + t.pnl, 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Simple SVG Charts (no external charting lib)
// ============================================

function EquityMiniChart({ data, isPositive }: { data: { date: string; value: number }[]; isPositive: boolean }) {
  if (!data.length) return null;
  
  const min = Math.min(...data.map(d => d.value));
  const max = Math.max(...data.map(d => d.value));
  const range = max - min || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? '#22c55e' : '#ef4444'}
        strokeWidth="0.5"
      />
    </svg>
  );
}

function EquityChart({ data }: { data: { date: string; value: number }[] }) {
  if (!data.length) return null;
  
  const min = Math.min(...data.map(d => d.value));
  const max = Math.max(...data.map(d => d.value));
  const range = max - min || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full p-4">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(y => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="100"
          y2={y}
          stroke="#2a2a2a"
          strokeWidth="0.2"
        />
      ))}
      {/* Area */}
      <polygon
        points={areaPoints}
        fill="url(#chartGradient)"
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="#c084fc"
        strokeWidth="0.3"
      />
      {/* Labels */}
      <text x="2" y="8" fill="#737373" fontSize="3">{max.toLocaleString()}</text>
      <text x="2" y="95" fill="#737373" fontSize="3">{min.toLocaleString()}</text>
      <text x="85" y="98" fill="#737373" fontSize="3">{data[0]?.date}</text>
      <text x="2" y="50" fill="#737373" fontSize="3">{((max + min) / 2).toLocaleString()}</text>
    </svg>
  );
}
