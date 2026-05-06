/**
 * NEMT Platform - Market Data Store
 * 市场数据状态管理
 */

import { create } from 'zustand';
import type { Candlestick, OrderBook, Ticker24h, Trade } from '@/types';

/**
 * 市场数据状态
 */
export interface MarketDataState {
  // K线数据
  candles: Record<string, Record<string, Candlestick[]>>; // {symbol: {interval: candles}}
  
  // 订单簿
  orderBooks: Record<string, OrderBook>;
  
  // 24小时行情
  tickers: Record<string, Ticker24h>;
  
  // 实时成交
  recentTrades: Record<string, Trade[]>;
  
  // 收藏的交易对
  favoriteSymbols: string[];
  
  // 当前选中的交易对
  selectedSymbol: string;
  
  // 当前选中的周期
  selectedInterval: string;
  
  // 加载状态
  isLoading: boolean;
  isRefreshing: boolean;
  
  // WebSocket 连接状态
  wsConnected: boolean;
  wsStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

/**
 * 市场数据操作
 */
export interface MarketDataActions {
  // K线数据
  setCandles: (symbol: string, interval: string, candles: Candlestick[]) => void;
  addCandle: (symbol: string, interval: string, candle: Candlestick) => void;
  updateLastCandle: (symbol: string, interval: string, candle: Partial<Candlestick>) => void;
  
  // 订单簿
  setOrderBook: (symbol: string, orderBook: OrderBook) => void;
  updateOrderBook: (symbol: string, updates: Partial<OrderBook>) => void;
  
  // 24小时行情
  setTicker: (symbol: string, ticker: Ticker24h) => void;
  setTickers: (tickers: Ticker24h[]) => void;
  
  // 实时成交
  addTrade: (symbol: string, trade: Trade) => void;
  setTrades: (symbol: string, trades: Trade[]) => void;
  clearTrades: (symbol: string) => void;
  
  // 收藏
  addFavorite: (symbol: string) => void;
  removeFavorite: (symbol: string) => void;
  toggleFavorite: (symbol: string) => void;
  
  // 选择
  setSelectedSymbol: (symbol: string) => void;
  setSelectedInterval: (interval: string) => void;
  
  // 加载状态
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // WebSocket
  setWsStatus: (status: MarketDataState['wsStatus']) => void;
  
  // 清除
  clearSymbolData: (symbol: string) => void;
  clearAll: () => void;
}

/**
 * 创建 Store
 */
export const useMarketDataStore = create<MarketDataState & MarketDataActions>()(
  (set, get) => ({
    // 初始状态
    candles: {},
    orderBooks: {},
    tickers: {},
    recentTrades: {},
    favoriteSymbols: [],
    selectedSymbol: 'BTCUSDT',
    selectedInterval: '1h',
    isLoading: false,
    isRefreshing: false,
    wsConnected: false,
    wsStatus: 'disconnected',
    
    // K线数据
    setCandles: (symbol, interval, candles) => set(state => ({
      candles: {
        ...state.candles,
        [symbol]: {
          ...state.candles[symbol],
          [interval]: candles,
        },
      },
    })),
    
    addCandle: (symbol, interval, candle) => set(state => {
      const existing = state.candles[symbol]?.[interval] || [];
      const lastCandle = existing[existing.length - 1];
      
      // 如果是同一个时间周期的K线，更新
      if (lastCandle && lastCandle.openTime === candle.openTime) {
        return {
          candles: {
            ...state.candles,
            [symbol]: {
              ...state.candles[symbol],
              [interval]: [...existing.slice(0, -1), candle],
            },
          },
        };
      }
      
      // 否则添加新K线
      return {
        candles: {
          ...state.candles,
          [symbol]: {
            ...state.candles[symbol],
            [interval]: [...existing, candle],
          },
        },
      };
    }),
    
    updateLastCandle: (symbol, interval, updates) => set(state => {
      const existing = state.candles[symbol]?.[interval];
      if (!existing || existing.length === 0) return state;
      
      const lastCandle = existing[existing.length - 1];
      const updatedLastCandle = { ...lastCandle, ...updates };
      
      return {
        candles: {
          ...state.candles,
          [symbol]: {
            ...state.candles[symbol],
            [interval]: [...existing.slice(0, -1), updatedLastCandle],
          },
        },
      };
    }),
    
    // 订单簿
    setOrderBook: (symbol, orderBook) => set(state => ({
      orderBooks: {
        ...state.orderBooks,
        [symbol]: orderBook,
      },
    })),
    
    updateOrderBook: (symbol, updates) => set(state => ({
      orderBooks: {
        ...state.orderBooks,
        [symbol]: state.orderBooks[symbol] 
          ? { ...state.orderBooks[symbol], ...updates }
          : updates as OrderBook,
      },
    })),
    
    // 24小时行情
    setTicker: (symbol, ticker) => set(state => ({
      tickers: {
        ...state.tickers,
        [symbol]: ticker,
      },
    })),
    
    setTickers: (tickers) => set(state => {
      const tickersMap = tickers.reduce((acc, t) => {
        acc[t.symbol] = t;
        return acc;
      }, {} as Record<string, Ticker24h>);
      
      return {
        tickers: {
          ...state.tickers,
          ...tickersMap,
        },
      };
    }),
    
    // 实时成交
    addTrade: (symbol, trade) => set(state => {
      const existing = state.recentTrades[symbol] || [];
      return {
        recentTrades: {
          ...state.recentTrades,
          [symbol]: [trade, ...existing].slice(0, 100), // 保留最近100条
        },
      };
    }),
    
    setTrades: (symbol, trades) => set(state => ({
      recentTrades: {
        ...state.recentTrades,
        [symbol]: trades,
      },
    })),
    
    clearTrades: (symbol) => set(state => ({
      recentTrades: {
        ...state.recentTrades,
        [symbol]: [],
      },
    })),
    
    // 收藏
    addFavorite: (symbol) => set(state => ({
      favoriteSymbols: state.favoriteSymbols.includes(symbol)
        ? state.favoriteSymbols
        : [...state.favoriteSymbols, symbol],
    })),
    
    removeFavorite: (symbol) => set(state => ({
      favoriteSymbols: state.favoriteSymbols.filter(s => s !== symbol),
    })),
    
    toggleFavorite: (symbol) => set(state => ({
      favoriteSymbols: state.favoriteSymbols.includes(symbol)
        ? state.favoriteSymbols.filter(s => s !== symbol)
        : [...state.favoriteSymbols, symbol],
    })),
    
    // 选择
    setSelectedSymbol: (selectedSymbol) => set({ selectedSymbol }),
    setSelectedInterval: (selectedInterval) => set({ selectedInterval }),
    
    // 加载状态
    setLoading: (isLoading) => set({ isLoading }),
    setRefreshing: (isRefreshing) => set({ isRefreshing }),
    
    // WebSocket
    setWsStatus: (wsStatus) => set({ 
      wsStatus, 
      wsConnected: wsStatus === 'connected' 
    }),
    
    // 清除
    clearSymbolData: (symbol) => set(state => {
      const { [symbol]: _candles, ...restCandles } = state.candles;
      const { [symbol]: _orderBook, ...restOrderBooks } = state.orderBooks;
      const { [symbol]: _ticker, ...restTickers } = state.tickers;
      const { [symbol]: _trades, ...restTrades } = state.recentTrades;
      
      return {
        candles: restCandles,
        orderBooks: restOrderBooks,
        tickers: restTickers,
        recentTrades: restTrades,
      };
    }),
    
    clearAll: () => set({
      candles: {},
      orderBooks: {},
      tickers: {},
      recentTrades: {},
    }),
  })
);

// ============================================
// 选择器
// ============================================

export const useSelectedSymbol = () => useMarketDataStore(state => state.selectedSymbol);
export const useSelectedInterval = () => useMarketDataStore(state => state.selectedInterval);
export const useFavoriteSymbols = () => useMarketDataStore(state => state.favoriteSymbols);
export const useTickers = () => useMarketDataStore(state => state.tickers);
export const useOrderBooks = () => useMarketDataStore(state => state.orderBooks);
export const useWsStatus = () => useMarketDataStore(state => state.wsStatus);
export const useWsConnected = () => useMarketDataStore(state => state.wsConnected);

// 获取指定交易对的K线
export const useCandles = (symbol: string, interval: string) => useMarketDataStore(state =>
  state.candles[symbol]?.[interval] || []
);

// 获取指定交易对的订单簿
export const useOrderBook = (symbol: string) => useMarketDataStore(state =>
  state.orderBooks[symbol]
);

// 获取指定交易对的24h行情
export const useTicker = (symbol: string) => useMarketDataStore(state =>
  state.tickers[symbol]
);

// 获取指定交易对的实时成交
export const useRecentTrades = (symbol: string) => useMarketDataStore(state =>
  state.recentTrades[symbol] || []
);

// 判断是否收藏
export const useIsFavorite = (symbol: string) => useMarketDataStore(state =>
  state.favoriteSymbols.includes(symbol)
);

// 获取所有收藏交易对的行情
export const useFavoriteTickers = () => useMarketDataStore(state => {
  const favorites = state.favoriteSymbols;
  return favorites.map(s => state.tickers[s]).filter(Boolean);
});
