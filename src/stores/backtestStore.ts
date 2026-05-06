/**
 * NEMT Platform - Backtest Store
 * Manage backtest configurations and results
 */

import { create } from 'zustand';

export interface BacktestConfig {
  id: string;
  strategyId: string;
  strategyName: string;
  // Data source
  sourceId: string;
  symbol: string;
  interval: string;
  // Time range
  startDate: string;
  endDate: string;
  // Settings
  initialCapital: number;
  commission: number;
  slippage: number;
}

export interface BacktestResult {
  id: string;
  configId: string;
  strategyId?: string;
  strategyName?: string;
  status: 'running' | 'completed' | 'failed';
  // Progress
  progress: number;
  currentDate: string;
  // Metrics
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
  // Timeline data
  equityCurve: { date: string; value: number }[];
  trades: BacktestTrade[];
  // Summary
  startDate: string;
  endDate: string;
  duration: number;
}

export interface BacktestTrade {
  id: string;
  date: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  pnl: number;
}

export interface BacktestState {
  configs: BacktestConfig[];
  results: BacktestResult[];
  currentConfig: BacktestConfig | null;
  pendingStrategy: { id: string; name: string } | null;
  
  // Actions
  createConfig: (config: Omit<BacktestConfig, 'id'>) => string;
  updateConfig: (id: string, updates: Partial<BacktestConfig>) => void;
  deleteConfig: (id: string) => void;
  setCurrentConfig: (config: BacktestConfig | null) => void;
  
  addResult: (result: Omit<BacktestResult, 'id'>) => string;
  updateResult: (id: string, updates: Partial<BacktestResult>) => void;
  
  // Strategy passing
  setPendingStrategy: (strategy: { id: string; name: string } | null) => void;
}

// Available data sources
export const BACKTEST_SOURCES = [
  { id: 'binance', name: 'Binance', icon: '₿', assets: '加密货币' },
  { id: 'yahoo', name: 'Yahoo Finance', icon: 'Y', assets: '股票/指数' },
  { id: 'alpaca', name: 'Alpaca', icon: 'A', assets: '股票/期权' },
];

// Available intervals
export const BACKTEST_INTERVALS = [
  { value: '1m', label: '1分钟' },
  { value: '5m', label: '5分钟' },
  { value: '15m', label: '15分钟' },
  { value: '1h', label: '1小时' },
  { value: '4h', label: '4小时' },
  { value: '1d', label: '日线' },
  { value: '1w', label: '周线' },
];

// Popular symbols by source
export const BACKTEST_SYMBOLS: Record<string, string[]> = {
  binance: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'DOGE/USDT', 'AVAX/USDT'],
  yahoo: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'SPY'],
  alpaca: ['AAPL', 'TSLA', 'SPY', 'QQQ', 'AMD', 'NFLX', 'COIN', 'SQ'],
};

// Common time ranges
export const TIME_RANGES = [
  { label: '最近1个月', days: 30 },
  { label: '最近3个月', days: 90 },
  { label: '最近6个月', days: 180 },
  { label: '最近1年', days: 365 },
  { label: '最近2年', days: 730 },
  { label: '最近3年', days: 1095 },
];

export const useBacktestStore = create<BacktestState>((set) => ({
  configs: [],
  results: [],
  currentConfig: null,
  pendingStrategy: null,

  createConfig: (config) => {
    const id = `backtest_${Date.now()}`;
    set(state => ({
      configs: [...state.configs, { ...config, id }],
    }));
    return id;
  },

  updateConfig: (id, updates) => set(state => ({
    configs: state.configs.map(c => c.id === id ? { ...c, ...updates } : c),
  })),

  deleteConfig: (id) => set(state => ({
    configs: state.configs.filter(c => c.id !== id),
    results: state.results.filter(r => r.configId !== id),
  })),

  setCurrentConfig: (config) => set({ currentConfig: config }),

  addResult: (result) => {
    const id = `result_${Date.now()}`;
    set(state => ({
      results: [...state.results, { ...result, id }],
    }));
    return id;
  },

  updateResult: (id, updates) => set(state => ({
    results: state.results.map(r => r.id === id ? { ...r, ...updates } : r),
  })),
  
  setPendingStrategy: (strategy) => set({ pendingStrategy: strategy }),
}));

// Helper: Generate mock backtest result
export function generateMockBacktestResult(configId: string): Omit<BacktestResult, 'id'> {
  const totalReturn = (Math.random() - 0.3) * 100;
  const totalTrades = Math.floor(Math.random() * 50) + 10;
  const profitableTrades = Math.floor(totalTrades * (0.3 + Math.random() * 0.4));
  
  // Generate equity curve
  const equityCurve = [];
  let equity = 100000;
  for (let i = 0; i < 30; i++) {
    equity *= 1 + (Math.random() - 0.45) * 0.05;
    equityCurve.push({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.round(equity),
    });
  }

  // Generate trades
  const trades: BacktestTrade[] = [];
  for (let i = 0; i < totalTrades; i++) {
    trades.push({
      id: `trade_${i}`,
      date: equityCurve[Math.floor(Math.random() * equityCurve.length)].date,
      type: Math.random() > 0.5 ? 'buy' : 'sell',
      price: 45000 + Math.random() * 5000,
      quantity: Math.random() * 2,
      pnl: (Math.random() - 0.5) * 2000,
    });
  }

  return {
    configId,
    status: 'completed',
    progress: 100,
    currentDate: equityCurve[equityCurve.length - 1].date,
    totalReturn: Math.round(totalReturn * 100) / 100,
    sharpeRatio: Math.round((Math.random() * 2 + 0.5) * 100) / 100,
    maxDrawdown: Math.round(Math.random() * 30 * 100) / 100,
    winRate: Math.round((profitableTrades / totalTrades) * 10000) / 100,
    totalTrades,
    profitableTrades,
    equityCurve,
    trades: trades.slice(0, 20),
    startDate: equityCurve[0].date,
    endDate: equityCurve[equityCurve.length - 1].date,
    duration: 30,
  };
}
