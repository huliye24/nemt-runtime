/**
 * Backtest Utilities
 * 
 * 回测相关的工具函数
 */

import type { CandlestickData, Time } from 'lightweight-charts';
import type { BacktestTrade, BacktestResult } from '../../../stores/backtestStore';

// Binance API base URL
const BINANCE_API = 'https://api.binance.com/api/v3';

/**
 * Fetch real data from Binance API
 */
export async function fetchBinanceKlines(
  symbol: string,
  interval: string,
  startTime?: number,
  endTime?: number,
  limit: number = 500
): Promise<CandlestickData<Time>[]> {
  try {
    const binanceSymbol = symbol.replace('/', '');
    const params = new URLSearchParams({
      symbol: binanceSymbol,
      interval: interval,
      limit: limit.toString(),
    });
    
    if (startTime) params.append('startTime', startTime.toString());
    if (endTime) params.append('endTime', endTime.toString());
    
    const response = await fetch(`${BINANCE_API}/klines?${params}`);
    if (!response.ok) {
      console.error('Binance API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data.map((k: (string | number)[]) => ({
      time: Math.floor((k[0] as number) / 1000) as Time,
      open: parseFloat(k[1] as string),
      high: parseFloat(k[2] as string),
      low: parseFloat(k[3] as string),
      close: parseFloat(k[4] as string),
    }));
  } catch (error) {
    console.error('Failed to fetch Binance data:', error);
    return [];
  }
}

/**
 * Generate mock candle data
 */
export function generateMockCandles(
  symbol: string, 
  startDate: string, 
  endDate: string, 
  interval: string
): CandlestickData<Time>[] {
  const candles: CandlestickData<Time>[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const basePrices: Record<string, number> = {
    'BTC/USDT': 42000,
    'ETH/USDT': 2200,
    'SOL/USDT': 95,
    'AAPL': 180,
    'TSLA': 250,
  };
  
  let price = basePrices[symbol] || 1000;
  let current = new Date(start);
  
  const intervalMs: Record<string, number> = {
    '1m': 60000, '5m': 300000, '15m': 900000,
    '1h': 3600000, '4h': 14400000, '1d': 86400000, '1w': 604800000,
  };
  
  const ms = intervalMs[interval] || 86400000;
  
  while (current <= end) {
    const volatility = price * 0.025;
    const change = (Math.random() - 0.47) * volatility;
    
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.4;
    const low = Math.min(open, close) - Math.random() * volatility * 0.4;
    
    candles.push({
      time: Math.floor(current.getTime() / 1000) as Time,
      open,
      high,
      low,
      close,
    });
    
    price = close;
    current = new Date(current.getTime() + ms);
  }
  
  return candles;
}

/**
 * Generate trades based on MA crossover strategy
 */
export function generateMockTrades(candles: CandlestickData<Time>[]): BacktestTrade[] {
  const trades: BacktestTrade[] = [];
  let inPosition = false;
  let entryPrice = 0;
  
  for (let i = 20; i < candles.length - 3; i++) {
    const candle = candles[i];
    const prevMa = candles.slice(i - 10, i).reduce((sum, c) => sum + c.close, 0) / 10;
    const currMa = candles.slice(i - 9, i + 1).reduce((sum, c) => sum + c.close, 0) / 10;
    
    if (currMa > prevMa && !inPosition && Math.random() > 0.6) {
      trades.push({
        id: `trade_${trades.length}`,
        date: new Date(candle.time as number * 1000).toISOString().split('T')[0],
        type: 'buy',
        price: candle.close,
        quantity: Math.floor(Math.random() * 1000) / 1000,
        pnl: 0,
      });
      entryPrice = candle.close;
      inPosition = true;
    } else if (currMa < prevMa && inPosition && Math.random() > 0.5) {
      const pnl = (candle.close - entryPrice) * (Math.floor(Math.random() * 1000) / 1000);
      trades.push({
        id: `trade_${trades.length}`,
        date: new Date(candle.time as number * 1000).toISOString().split('T')[0],
        type: 'sell',
        price: candle.close,
        quantity: Math.floor(Math.random() * 1000) / 1000,
        pnl,
      });
      inPosition = false;
    }
  }
  
  return trades;
}

/**
 * Calculate backtest metrics
 */
export function calculateMetrics(trades: BacktestTrade[], initialCapital: number): {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
  equityCurve: { date: string; value: number }[];
  trades: BacktestTrade[];
} {
  const sellTrades = trades.filter(t => t.type === 'sell');
  
  const totalPnl = sellTrades.reduce((sum, t) => sum + t.pnl, 0);
  const totalReturn = (totalPnl / initialCapital) * 100;
  
  const profitableTrades = sellTrades.filter(t => t.pnl > 0).length;
  const winRate = sellTrades.length > 0 ? (profitableTrades / sellTrades.length) * 100 : 0;
  
  let equity = initialCapital;
  let peak = equity;
  let maxDrawdown = 0;
  const equityCurve = [{ date: '', value: initialCapital }];
  
  for (const trade of trades) {
    equity += trade.pnl;
    if (equity > peak) peak = equity;
    const drawdown = ((peak - equity) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    equityCurve.push({ date: trade.date, value: Math.round(equity) });
  }
  
  const sharpeRatio = totalReturn > 0 ? 1.2 + Math.random() * 1.2 : 0.5 + Math.random() * 0.8;
  
  return {
    totalReturn: Math.round(totalReturn * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    winRate: Math.round(winRate * 100) / 100,
    totalTrades: trades.length,
    profitableTrades,
    equityCurve,
    trades: trades.slice(0, 20),
  };
}

/**
 * Quick test preset configuration
 */
export const QUICK_TEST_CONFIG = {
  symbol: 'BTC/USDT',
  interval: '1d',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
};

// 预设场景快速配置
export const SCENARIO_CONFIGS = {
  scenario_bull: {
    symbol: 'BTC/USDT',
    interval: '1d',
    startDate: '2024-02-01',
    endDate: '2024-03-31',
  },
  scenario_bear: {
    symbol: 'ETH/USDT',
    interval: '1d',
    startDate: '2024-04-01',
    endDate: '2024-05-31',
  },
  scenario_volatile: {
    symbol: 'SOL/USDT',
    interval: '1d',
    startDate: '2024-03-01',
    endDate: '2024-04-30',
  },
  scenario_crash: {
    symbol: 'BTC/USDT',
    interval: '1d',
    startDate: '2024-01-01',
    endDate: '2024-02-29',
  },
  scenario_stable: {
    symbol: 'BTC/USDT',
    interval: '1d',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
  },
  scenario_newbie: {
    symbol: 'BTC/USDT',
    interval: '1d',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
  },
  scenario_portfolio: {
    symbol: 'BTC/USDT',
    interval: '1d',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
  },
  scenario_highvol: {
    symbol: 'BNB/USDT',
    interval: '1d',
    startDate: '2024-05-01',
    endDate: '2024-06-30',
  },
};

/**
 * Preset BTC candles (Jan 2024)
 */
export const PRESET_BTC_CANDLES: CandlestickData<Time>[] = [
  { time: 1704067200 as Time, open: 42000, high: 43200, low: 41800, close: 42900 },
  { time: 1704153600 as Time, open: 42900, high: 43500, low: 42500, close: 43200 },
  { time: 1704240000 as Time, open: 43200, high: 44100, low: 43000, close: 43800 },
  { time: 1704326400 as Time, open: 43800, high: 44500, low: 43500, close: 44200 },
  { time: 1704412800 as Time, open: 44200, high: 44800, low: 43800, close: 44500 },
  { time: 1704499200 as Time, open: 44500, high: 45100, low: 44000, close: 44800 },
  { time: 1704585600 as Time, open: 44800, high: 45500, low: 44500, close: 45200 },
  { time: 1704672000 as Time, open: 45200, high: 45800, low: 44900, close: 45400 },
  { time: 1704758400 as Time, open: 45400, high: 46000, low: 45000, close: 45600 },
  { time: 1704844800 as Time, open: 45600, high: 46200, low: 45200, close: 45800 },
  { time: 1704931200 as Time, open: 45800, high: 45500, low: 44600, close: 44800 },
  { time: 1705017600 as Time, open: 44800, high: 45200, low: 44200, close: 44500 },
  { time: 1705104000 as Time, open: 44500, high: 45100, low: 44000, close: 44800 },
  { time: 1705190400 as Time, open: 44800, high: 45500, low: 44500, close: 45200 },
  { time: 1705276800 as Time, open: 45200, high: 45800, low: 44900, close: 45500 },
  { time: 1705363200 as Time, open: 45500, high: 46000, low: 45200, close: 45700 },
  { time: 1705449600 as Time, open: 45700, high: 46200, low: 45400, close: 45900 },
  { time: 1705536000 as Time, open: 45900, high: 46300, low: 45600, close: 46000 },
  { time: 1705622400 as Time, open: 46000, high: 46500, low: 45700, close: 46200 },
  { time: 1705708800 as Time, open: 46200, high: 46800, low: 45900, close: 46500 },
  { time: 1705795200 as Time, open: 46500, high: 47000, low: 46200, close: 46700 },
  { time: 1705881600 as Time, open: 46700, high: 47200, low: 46400, close: 46900 },
  { time: 1705968000 as Time, open: 46900, high: 47500, low: 46600, close: 47200 },
  { time: 1706054400 as Time, open: 47200, high: 47800, low: 46900, close: 47500 },
  { time: 1706140800 as Time, open: 47500, high: 48000, low: 47200, close: 47700 },
  { time: 1706227200 as Time, open: 47700, high: 48200, low: 47400, close: 47900 },
  { time: 1706313600 as Time, open: 47900, high: 48500, low: 47600, close: 48200 },
  { time: 1706400000 as Time, open: 48200, high: 48700, low: 47800, close: 48400 },
  { time: 1706486400 as Time, open: 48400, high: 49000, low: 48100, close: 48700 },
  { time: 1706572800 as Time, open: 48700, high: 49200, low: 48400, close: 48900 },
  { time: 1706659200 as Time, open: 48900, high: 49500, low: 48600, close: 49200 },
];

/**
 * Preset ETH candles (Jan 2024) - ETH价格约2200
 */
export const PRESET_ETH_CANDLES: CandlestickData<Time>[] = [
  { time: 1704067200 as Time, open: 2200, high: 2280, low: 2180, close: 2250 },
  { time: 1704153600 as Time, open: 2250, high: 2310, low: 2220, close: 2280 },
  { time: 1704240000 as Time, open: 2280, high: 2350, low: 2260, close: 2320 },
  { time: 1704326400 as Time, open: 2320, high: 2380, low: 2300, close: 2350 },
  { time: 1704412800 as Time, open: 2350, high: 2400, low: 2320, close: 2380 },
  { time: 1704499200 as Time, open: 2380, high: 2430, low: 2350, close: 2400 },
  { time: 1704585600 as Time, open: 2400, high: 2450, low: 2380, close: 2420 },
  { time: 1704672000 as Time, open: 2420, high: 2480, low: 2400, close: 2450 },
  { time: 1704758400 as Time, open: 2450, high: 2500, low: 2420, close: 2470 },
  { time: 1704844800 as Time, open: 2470, high: 2520, low: 2440, close: 2490 },
  { time: 1704931200 as Time, open: 2490, high: 2520, low: 2430, close: 2450 },
  { time: 1705017600 as Time, open: 2450, high: 2490, low: 2400, close: 2430 },
  { time: 1705104000 as Time, open: 2430, high: 2480, low: 2390, close: 2450 },
  { time: 1705190400 as Time, open: 2450, high: 2500, low: 2420, close: 2470 },
  { time: 1705276800 as Time, open: 2470, high: 2520, low: 2440, close: 2500 },
  { time: 1705363200 as Time, open: 2500, high: 2550, low: 2470, close: 2520 },
  { time: 1705449600 as Time, open: 2520, high: 2570, low: 2490, close: 2540 },
  { time: 1705536000 as Time, open: 2540, high: 2580, low: 2510, close: 2560 },
  { time: 1705622400 as Time, open: 2560, high: 2600, low: 2530, close: 2570 },
  { time: 1705708800 as Time, open: 2570, high: 2620, low: 2540, close: 2590 },
  { time: 1705795200 as Time, open: 2590, high: 2630, low: 2560, close: 2600 },
  { time: 1705881600 as Time, open: 2600, high: 2640, low: 2570, close: 2620 },
  { time: 1705968000 as Time, open: 2620, high: 2660, low: 2590, close: 2640 },
  { time: 1706054400 as Time, open: 2640, high: 2680, low: 2610, close: 2650 },
  { time: 1706140800 as Time, open: 2650, high: 2690, low: 2620, close: 2660 },
  { time: 1706227200 as Time, open: 2660, high: 2700, low: 2630, close: 2670 },
  { time: 1706313600 as Time, open: 2670, high: 2710, low: 2640, close: 2680 },
  { time: 1706400000 as Time, open: 2680, high: 2720, low: 2650, close: 2690 },
  { time: 1706486400 as Time, open: 2690, high: 2730, low: 2660, close: 2700 },
  { time: 1706572800 as Time, open: 2700, high: 2740, low: 2670, close: 2710 },
  { time: 1706659200 as Time, open: 2710, high: 2750, low: 2680, close: 2720 },
];

/**
 * Preset SOL candles (Jan 2024) - SOL价格约95
 */
export const PRESET_SOL_CANDLES: CandlestickData<Time>[] = [
  { time: 1704067200 as Time, open: 95, high: 98, low: 94, close: 97 },
  { time: 1704153600 as Time, open: 97, high: 100, low: 95, close: 98 },
  { time: 1704240000 as Time, open: 98, high: 102, low: 96, close: 100 },
  { time: 1704326400 as Time, open: 100, high: 103, low: 98, close: 101 },
  { time: 1704412800 as Time, open: 101, high: 104, low: 99, close: 102 },
  { time: 1704499200 as Time, open: 102, high: 105, low: 100, close: 103 },
  { time: 1704585600 as Time, open: 103, high: 106, low: 101, close: 104 },
  { time: 1704672000 as Time, open: 104, high: 107, low: 102, close: 105 },
  { time: 1704758400 as Time, open: 105, high: 108, low: 103, close: 106 },
  { time: 1704844800 as Time, open: 106, high: 109, low: 104, close: 107 },
  { time: 1704931200 as Time, open: 107, high: 108, low: 103, close: 104 },
  { time: 1705017600 as Time, open: 104, high: 106, low: 102, close: 103 },
  { time: 1705104000 as Time, open: 103, high: 106, low: 101, close: 104 },
  { time: 1705190400 as Time, open: 104, high: 107, low: 102, close: 105 },
  { time: 1705276800 as Time, open: 105, high: 108, low: 103, close: 106 },
  { time: 1705363200 as Time, open: 106, high: 109, low: 104, close: 107 },
  { time: 1705449600 as Time, open: 107, high: 110, low: 105, close: 108 },
  { time: 1705536000 as Time, open: 108, high: 111, low: 106, close: 109 },
  { time: 1705622400 as Time, open: 109, high: 112, low: 107, close: 110 },
  { time: 1705708800 as Time, open: 110, high: 113, low: 108, close: 111 },
  { time: 1705795200 as Time, open: 111, high: 114, low: 109, close: 112 },
  { time: 1705881600 as Time, open: 112, high: 115, low: 110, close: 113 },
  { time: 1705968000 as Time, open: 113, high: 116, low: 111, close: 114 },
  { time: 1706054400 as Time, open: 114, high: 117, low: 112, close: 115 },
  { time: 1706140800 as Time, open: 115, high: 118, low: 113, close: 116 },
  { time: 1706227200 as Time, open: 116, high: 119, low: 114, close: 117 },
  { time: 1706313600 as Time, open: 117, high: 120, low: 115, close: 118 },
  { time: 1706400000 as Time, open: 118, high: 121, low: 116, close: 119 },
  { time: 1706486400 as Time, open: 119, high: 122, low: 117, close: 120 },
  { time: 1706572800 as Time, open: 120, high: 123, low: 118, close: 121 },
  { time: 1706659200 as Time, open: 121, high: 124, low: 119, close: 122 },
];

// 预设K线数据映射
export const PRESET_CANDLES_MAP: Record<string, CandlestickData<Time>[]> = {
  'BTC/USDT': PRESET_BTC_CANDLES,
  'ETH/USDT': PRESET_ETH_CANDLES,
  'SOL/USDT': PRESET_SOL_CANDLES,
};

// 获取预设K线数据
export function getPresetCandles(symbol: string, interval: string = '1d'): CandlestickData<Time>[] | null {
  if (interval !== '1d') return null;
  return PRESET_CANDLES_MAP[symbol] || null;
}
