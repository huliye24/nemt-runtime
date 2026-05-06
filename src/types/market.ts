/**
 * NEMT Platform - Market Types
 * 市场数据相关类型定义
 */

/**
 * 交易市场
 */
export type MarketType = 'spot' | 'futures' | 'perpetual' | 'options';

/**
 * 交易对状态
 */
export type SymbolStatus = 'trading' | 'halt' | 'break' | 'closed';

/**
 * 订单簿深度
 */
export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;       // 累计数量
  percent: number;     // 占总量百分比
}

/**
 * 订单簿
 */
export interface OrderBook {
  symbol: string;
  lastUpdateId: number;
  timestamp: number;
  
  bids: OrderBookLevel[];    // 买方深度
  asks: OrderBookLevel[];    // 卖方深度
  
  // 汇总
  spread: number;
  spreadPercent: number;
  midPrice: number;
  bestBid: number;
  bestAsk: number;
  
  // 统计
  totalBidQuantity: number;
  totalAskQuantity: number;
  bidAskRatio: number;
  imbalance: number;        // 订单簿不平衡度
}

/**
 * K线数据
 */
export interface Candlestick {
  symbol: string;
  interval: string;
  
  // 时间
  openTime: number;
  closeTime: number;
  
  // 价格
  open: number;
  high: number;
  low: number;
  close: number;
  
  // 成交量
  volume: number;
  quoteVolume: number;       // 成交额 (USDT)
  trades: number;            // 成交笔数
  takerBuyVolume: number;   // 主动买入量
  takerBuyQuoteVolume: number;
  
  // 确认
  isClosed: boolean;
}

/**
 * Tick 数据
 */
export interface Tick {
  symbol: string;
  price: number;
  quantity: number;
  timestamp: number;
  
  // 附加
  side: 'buy' | 'sell';
  isMaker: boolean;
  tradeId: number;
}

/**
 * 成交记录
 */
export interface Trade {
  id: string;
  symbol: string;
  
  price: number;
  quantity: number;
  quoteQuantity: number;
  
  // 时间
  timestamp: number;
  
  // 附加
  side: 'buy' | 'sell';
  isBuyerMaker: boolean;
  isBestMatch: boolean;
}

/**
 * 24小时行情
 */
export interface Ticker24h {
  symbol: string;
  
  // 价格
  lastPrice: number;
  openPrice: number;        // 24小时前价格
  highPrice: number;
  lowPrice: number;
  
  // 变化
  priceChange: number;
  priceChangePercent: number;
  
  // 成交量
  volume: number;           // 成交量
  quoteVolume: number;      // 成交额
  
  // 时间
  timestamp: number;
  
  // 附加
  bidPrice: number;
  bidQty: number;
  askPrice: number;
  askQty: number;
  
  // 统计
  weightedAvgPrice: number;
  count: number;            // 成交笔数
}

/**
 * 交易对信息
 */
export interface SymbolInfo {
  symbol: string;
  baseAsset: string;       // 基础资产，如 BTC
  quoteAsset: string;       // 计价资产，如 USDT
  
  // 状态
  status: SymbolStatus;
  marketType: MarketType;
  
  // 精度
  pricePrecision: number;   // 价格精度
  quantityPrecision: number; // 数量精度
  quotePrecision: number;   // 计价精度
  
  // 限额
  minQuantity: number;
  maxQuantity: number;
  stepSize: number;
  
  // 价格限额
  minPrice: number;
  maxPrice: number;
  tickSize: number;
  
  // 合约特有
  contractType?: 'perpetual' | 'delivery';
  deliveryDate?: number;
  fundingRate?: number;
  nextFundingTime?: number;
  leverageRange?: { min: number; max: number };
  
  // 其他
  isTrading: boolean;
  allowMargin: boolean;
  allowSpot: boolean;
  allowFutures: boolean;
}

/**
 * 交易所信息
 */
export interface ExchangeInfo {
  name: string;
  code: string;            // 如 binance, bybit
  
  // 状态
  status: 'online' | 'maintenance' | 'offline';
  serverTime: number;
  timeOffset: number;
  
  // 版本
  apiVersion: string;
  firmwareVersion?: string;
  
  // 限额
  rateLimit: {
    weight: number;
    interval: string;
  };
  
  // 交易对
  symbols: SymbolInfo[];
  
  // 时间
  timestamp: number;
}

/**
 * 市场概览
 */
export interface MarketOverview {
  // 交易所
  exchange: string;
  timestamp: number;
  
  // 统计数据
  totalSymbols: number;
  tradingSymbols: number;
  
  // 24h汇总
  totalVolume24h: number;
  totalQuoteVolume24h: number;
  
  // 涨跌统计
  gainers: number;
  losers: number;
  unchanged: number;
  
  // BTC 主导
  btcDominance: number;
  ethDominance: number;
  
  // 热门
  topGainers: MarketTicker[];
  topLosers: MarketTicker[];
  topVolume: MarketTicker[];
}

export interface MarketTicker {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
}

/**
 * 持仓量/未平仓合约
 */
export interface OpenInterest {
  symbol: string;
  
  // 持仓量
  openInterest: number;      // BTC 数量
  openInterestValue: number; // USDT 价值
  
  // 变化
  change24h: number;
  changePercent24h: number;
  
  // 时间
  timestamp: number;
}

/**
 * 资金费率
 */
export interface FundingRate {
  symbol: string;
  
  // 当前费率
  fundingRate: number;      // 如 0.0001 = 0.01%
  
  // 预测
  nextFundingRate?: number;
  
  // 时间
  fundingTime: number;
  nextFundingTime: number;
  
  // 历史
  predictedRate?: number;
  fairPrice?: number;
  markPrice?: number;
  indexPrice?: number;
  
  // 时间
  timestamp: number;
}

/**
 * 市场深度统计
 */
export interface DepthStats {
  symbol: string;
  timestamp: number;
  
  // 买方深度
  bidDepth: number;
  bidDepthLevels: number;
  largestBidLevel: number;
  
  // 卖方深度
  askDepth: number;
  askDepthLevels: number;
  largestAskLevel: number;
  
  // 深度比
  depthRatio: number;
  depthImbalance: number;
  
  // VWAP
  bidVWAP: number;
  askVWAP: number;
  midVWAP: number;
}

/**
 * 成交量分布
 */
export interface VolumeProfile {
  symbol: string;
  interval: string;         // 如 '5m', '1h'
  
  bins: {
    priceLow: number;
    priceHigh: number;
    volume: number;
    trades: number;
    buyVolume: number;
    sellVolume: number;
    isPointOfControl: boolean; // POC 价格区间
    isValueArea: boolean;      // 价值区域
  }[];
  
  // 统计
  totalVolume: number;
  totalTrades: number;
  pointOfControl: number;   // POC 价格
  valueAreaHigh: number;
  valueAreaLow: number;
  
  // 时间
  startTime: number;
  endTime: number;
}

/**
 * K线聚合 (Ticker)
 */
export interface AggregatedTicker {
  symbol: string;
  interval: string;
  
  open: number;
  high: number;
  low: number;
  close: number;
  
  volume: number;
  trades: number;
  
  startTime: number;
  endTime: number;
}

/**
 * 多交易所价格
 */
export interface MultiExchangePrice {
  symbol: string;
  timestamp: number;
  
  prices: {
    exchange: string;
    price: number;
    volume: number;
    timestamp: number;
  }[];
  
  // 汇总
  averagePrice: number;
  bestBid: { exchange: string; price: number };
  bestAsk: { exchange: string; price: number };
  spread: number;
  arbitrage?: {
    buyExchange: string;
    sellExchange: string;
    profitPercent: number;
  };
}

/**
 * 市场状态标签
 */
export const SYMBOL_STATUS_LABELS: Record<SymbolStatus, string> = {
  trading: '交易中',
  halt: '暂停交易',
  break: '暂停中间',
  closed: '已关闭',
};

/**
 * 市场类型标签
 */
export const MARKET_TYPE_LABELS: Record<MarketType, string> = {
  spot: '现货',
  futures: '期货',
  perpetual: '永续',
  options: '期权',
};

/**
 * 时间周期标签
 */
export const CANDLE_INTERVAL_LABELS: Record<string, string> = {
  '1m': '1 分钟',
  '3m': '3 分钟',
  '5m': '5 分钟',
  '15m': '15 分钟',
  '30m': '30 分钟',
  '1h': '1 小时',
  '2h': '2 小时',
  '4h': '4 小时',
  '6h': '6 小时',
  '8h': '8 小时',
  '12h': '12 小时',
  '1d': '1 日',
  '3d': '3 日',
  '1w': '1 周',
  '1M': '1 月',
};
