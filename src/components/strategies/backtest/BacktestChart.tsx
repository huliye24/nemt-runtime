/**
 * BacktestChart Component
 * 
 * 回测 K 线图表组件 - 增强版
 * 支持场景标注、交易标记、指标叠加
 */

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  Time,
  SeriesMarker,
  SeriesMarkerPosition,
  SeriesMarkerShape,
} from 'lightweight-charts';
import { BarChart3, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Colors } from '../../../presets/presets';
import type { BacktestResult } from '../../../stores/backtestStore';
import { backtestPresets } from '../../../services/backtestPresets';

interface BacktestChartProps {
  candles: CandlestickData<Time>[];
  result: BacktestResult | null;
  symbol?: string;
  interval?: string;
  startDate?: string;
  endDate?: string;
  isPreset?: boolean;
  scenarioId?: string;
}

export function BacktestChart({ 
  candles, 
  result, 
  symbol, 
  interval, 
  startDate, 
  endDate,
  isPreset,
  scenarioId 
}: BacktestChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const equitySeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ma10SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  
  const [showEquity, setShowEquity] = useState(true);

  // 获取场景元数据
  const scenarioMeta = scenarioId ? backtestPresets.getById(scenarioId) : null;

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = createChart(containerRef.current, {
      layout: {
        background: { color: '#141414' },
        textColor: '#737373',
      },
      grid: {
        vertLines: { color: '#2a2a2a' },
        horzLines: { color: '#2a2a2a' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#6b21a8', labelBackgroundColor: '#6b21a8' },
        horzLine: { color: '#6b21a8', labelBackgroundColor: '#6b21a8' },
      },
      rightPriceScale: {
        borderColor: '#2a2a2a',
      },
      timeScale: {
        borderColor: '#2a2a2a',
        timeVisible: true,
      },
    });

    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    equitySeriesRef.current = chartRef.current.addLineSeries({
      color: '#c084fc',
      lineWidth: 2,
      priceScaleId: 'right',
    });

    // MA10 均线
    ma10SeriesRef.current = chartRef.current.addLineSeries({
      color: '#f59e0b',
      lineWidth: 1,
      priceScaleId: 'right',
    });

    // MA20 均线
    ma20SeriesRef.current = chartRef.current.addLineSeries({
      color: '#3b82f6',
      lineWidth: 1,
      priceScaleId: 'right',
    });

    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: 384,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (candlestickSeriesRef.current && candles.length > 0) {
      candlestickSeriesRef.current.setData(candles);
      
      // 计算 MA10/MA20 数据
      const ma10Data: LineData<Time>[] = candles.map((c, i) => ({
        time: c.time,
        value: i >= 9 
          ? candles.slice(i - 9, i + 1).reduce((sum, x) => sum + x.close, 0) / 10 
          : c.close,
      }));

      const ma20Data: LineData<Time>[] = candles.map((c, i) => ({
        time: c.time,
        value: i >= 19 
          ? candles.slice(i - 19, i + 1).reduce((sum, x) => sum + x.close, 0) / 20 
          : c.close,
      }));

      ma10SeriesRef.current?.setData(ma10Data);
      ma20SeriesRef.current?.setData(ma20Data);
      
      // 设置交易标记
      if (result?.trades && result.trades.length > 0) {
        const markers: SeriesMarker<Time>[] = result.trades
          .filter(t => t.date && t.date.trim() !== '')
          .map(trade => ({
            time: Math.floor(new Date(trade.date).getTime() / 1000) as Time,
            position: (trade.type === 'buy' ? 'belowBar' : 'aboveBar') as SeriesMarkerPosition,
            color: trade.type === 'buy' ? '#22c55e' : '#ef4444',
            shape: (trade.type === 'buy' ? 'arrowUp' : 'arrowDown') as SeriesMarkerShape,
            text: trade.type === 'buy' ? 'B' : 'S',
          }));
        candlestickSeriesRef.current.setMarkers(markers);
      }
    }
    if (equitySeriesRef.current && result?.equityCurve) {
      const lineData: LineData<Time>[] = result.equityCurve
        .filter((point) => point.date && point.date.trim() !== '')
        .map((point) => ({
          time: Math.floor(new Date(point.date).getTime() / 1000) as Time,
          value: point.value,
        }));
      equitySeriesRef.current.setData(lineData);
      
      // 显示/隐藏权益曲线
      equitySeriesRef.current.applyOptions({
        visible: showEquity,
      });
    }
    chartRef.current?.timeScale().fitContent();
  }, [candles, result, showEquity]);

  if (!result) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-96 rounded-xl"
        style={{ backgroundColor: '#141414', border: '1px solid #2a2a2a' }}
      >
        <BarChart3 size={48} style={{ color: '#404040' }} />
        <p className="mt-4" style={{ color: '#737373' }}>
          运行回测后查看图表
        </p>
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#141414', border: `1px solid ${scenarioMeta?.color || '#2a2a2a'}` }}
    >
      {/* 场景标注头部 */}
      {scenarioMeta && (
        <div 
          className="flex items-center gap-2 px-4 py-2"
          style={{ backgroundColor: `${scenarioMeta.color}15`, borderBottom: `1px solid ${scenarioMeta.color}30` }}
        >
          <Star size={14} style={{ color: scenarioMeta.color }} />
          <span className="text-xs font-medium" style={{ color: scenarioMeta.color }}>
            {scenarioMeta.icon} {scenarioMeta.name}
          </span>
          <span className="text-xs" style={{ color: '#737373' }}>
            {scenarioMeta.description}
          </span>
        </div>
      )}

      {/* 图表头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#1f1f1f' }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
            {symbol || result?.strategyName || 'K线图表'}
          </span>
          <span 
            className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: '#1a1a1a', color: '#737373' }}
          >
            {interval || '1d'}
          </span>
          
          {/* 收益率标识 */}
          <span 
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
            style={{ 
              backgroundColor: result.totalReturn >= 0 ? '#22c55e20' : '#ef444420',
              color: result.totalReturn >= 0 ? '#22c55e' : '#ef4444',
            }}
          >
            {result.totalReturn >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {result.totalReturn >= 0 ? '+' : ''}{result.totalReturn.toFixed(2)}%
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 权益曲线开关 */}
          <button
            onClick={() => setShowEquity(!showEquity)}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-all"
            style={{ 
              backgroundColor: showEquity ? Colors.accent + '30' : 'transparent',
              color: showEquity ? Colors.accent : '#737373',
            }}
          >
            权益曲线
          </button>
          
          <div className="flex items-center gap-4 text-xs" style={{ color: '#737373' }}>
            <span>{startDate || result?.startDate}</span>
            <span>→</span>
            <span>{endDate || result?.endDate}</span>
          </div>
        </div>
      </div>
      
      {/* 图表 */}
      <div 
        ref={containerRef} 
        className="h-96"
      />
      
      {/* 交易标记图例 */}
      {result.trades && result.trades.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-2 border-t" style={{ borderColor: '#1f1f1f' }}>
          <span className="text-xs" style={{ color: '#737373' }}>图例:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-xs" style={{ color: '#737373' }}>买入</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-xs" style={{ color: '#737373' }}>卖出</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ backgroundColor: '#c084fc' }} />
            <span className="text-xs" style={{ color: '#737373' }}>权益曲线</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ backgroundColor: '#f59e0b' }} />
            <span className="text-xs" style={{ color: '#737373' }}>MA10</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-xs" style={{ color: '#737373' }}>MA20</span>
          </div>
        </div>
      )}
    </div>
  );
}
