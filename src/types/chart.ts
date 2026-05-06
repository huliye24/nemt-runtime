/**
 * NEMT Platform - Chart Types
 * 图表配置相关类型定义
 */

/**
 * 图表类型
 */
export type ChartType = 
  | 'candlestick'    // K线图
  | 'line'          // 折线图
  | 'area'          // 面积图
  | 'bar'           // 柱状图
  | 'histogram'     // 直方图
  | 'baseline'      // 基线图
  | 'markers';      // 标记图

/**
 * 时间周期
 */
export type TimeInterval = 
  | '1m'  | '3m'  | '5m'  | '15m' | '30m'   // 分钟
  | '1h'  | '2h'  | '4h'  | '6h'  | '8h'  | '12h'  // 小时
  | '1d'  | '3d'  | '1w'  | '1M';           // 日以上

/**
 * 指标类型
 */
export type IndicatorType = 
  | 'SMA'      // 简单移动平均
  | 'EMA'      // 指数移动平均
  | 'RSI'      // 相对强弱指数
  | 'MACD'     // MACD
  | 'BB'       // 布林带
  | 'ATR'      // 平均真实波幅
  | 'KDJ'      // KDJ
  | 'WR'       // 威廉指标
  | 'CCI'      // 商品通道指标
  | 'OBV'      // 能量潮
  | 'VWAP'     // 成交量加权均价
  | 'ADX'      // 趋向指标
  | 'SAR'      // 抛物线指标
  | 'STOCH';   // 随机指标

/**
 * 图表主题
 */
export type ChartTheme = 'dark' | 'light' | ' TradingView Dark' | 'TradingView Light';

/**
 * 图表缩放模式
 */
export type ChartZoomMode = 'x' | 'y' | 'xy' | 'none';

/**
 * K线数据
 */
export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 折线数据
 */
export interface LineData {
  time: number;
  value: number;
}

/**
 * 柱状数据
 */
export interface BarData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  color?: string;
}

/**
 * 直方图数据
 */
export interface HistogramData {
  time: number;
  value: number;
  color?: string;
}

/**
 * 标记数据
 */
export interface MarkerData {
  time: number;
  position: 'aboveBar' | 'belowBar' | 'inBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown' | 'circle' | 'square' | 'flag' | 'text';
  text?: string;
  size?: number;
}

/**
 * 指标配置
 */
export interface IndicatorConfig {
  id: string;
  type: IndicatorType;
  name?: string;
  params: Record<string, number>;
  visible: boolean;
  color?: string;
  lineWidth?: number;
  style?: 'line' | 'histogram' | 'cross';
  panel?: string; // 指标所属面板
  scale?: 'normal' | 'logarithmic' | 'percent';
}

/**
 * 指标数据
 */
export interface IndicatorData {
  id: string;
  type: IndicatorType;
  values: LineData[] | HistogramData[];
  upperBand?: LineData[];  // 上轨（如布林带上轨）
  lowerBand?: LineData[];  // 下轨（如布林带下轨）
  middleBand?: LineData[]; // 中轨（如布林带中轨）
}

/**
 * 策略信号标记
 */
export interface StrategyMarker {
  id: string;
  time: number;
  position: 'aboveBar' | 'belowBar' | 'inBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown' | 'circle' | 'square' | 'flag';
  text?: string;
  tooltip?: string;
  orderSide?: 'buy' | 'sell';
  entryPrice?: number;
  exitPrice?: number;
  pnl?: number;
}

/**
 * 订单标记
 */
export interface OrderMarker {
  id: string;
  time: number;
  price: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  status: 'pending' | 'filled' | 'cancelled';
  quantity?: number;
  fillPrice?: number;
}

/**
 * 持仓标记
 */
export interface PositionMarker {
  entryTime: number;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  side: 'long' | 'short';
  unrealizedPnl: number;
  pnlPercent: number;
}

/**
 * 价格线
 */
export interface PriceLine {
  id: string;
  price: number;
  color: string;
  lineWidth: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  title?: string;
  axisLabelVisible?: boolean;
}

/**
 * 价格范围
 */
export interface PriceRange {
  min: number;
  max: number;
  leftPrice?: number;
  rightPrice?: number;
}

/**
 * 图表十字线
 */
export interface CrossHairMode {
  mode: 'normal' | 'magnet' | 'hidden';
  snapToCandle?: boolean;
}

/**
 * 图表缩放
 */
export interface ChartZoom {
  scale: number;
  offset: number;
  minScale: number;
  maxScale: number;
}

/**
 * 时间范围
 */
export interface TimeRange {
  from: number;
  to: number;
}

/**
 * 图表配置
 */
export interface ChartConfig {
  id: string;
  name: string;
  symbol: string;
  interval: TimeInterval;
  
  // 主题
  theme: ChartTheme;
  
  // 数据
  candles?: CandlestickData[];
  lines?: Record<string, LineData[]>;
  indicators?: IndicatorConfig[];
  
  // 标记
  markers?: MarkerData[];
  strategyMarkers?: StrategyMarker[];
  orderMarkers?: OrderMarker[];
  positionMarkers?: PositionMarker[];
  
  // 价格线
  priceLines?: PriceLine[];
  
  // 显示选项
  showVolume: boolean;
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  showCrosshair: boolean;
  showPriceScale: boolean;
  showTimeScale: boolean;
  
  // 缩放
  zoomMode: ChartZoomMode;
  zoom?: ChartZoom;
  
  // 时间范围
  timeRange?: TimeRange;
  
  // 默认视图
  defaultZoom: number;
  defaultOffset: number;
  
  // 更新配置
  realTimeEnabled: boolean;
  updateInterval: number; // 毫秒
  
  // 布局
  layout: ChartLayout;
}

/**
 * 图表布局
 */
export interface ChartLayout {
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  borderColor: string;
  fontSize: number;
  fontFamily: string;
}

/**
 * 多图表配置
 */
export interface MultiChartConfig {
  id: string;
  name: string;
  charts: ChartConfig[];
  syncCrosshair: boolean;
  syncTimeRange: boolean;
  layout: MultiChartLayout;
}

export interface MultiChartLayout {
  type: 'grid' | 'tabs' | 'split';
  columns: number;
  rows: number;
  gap: number;
}

/**
 * 回测图表配置
 */
export interface BacktestChartConfig extends ChartConfig {
  equityLine: LineData[];
  benchmarkLine?: LineData[];
  drawdownLine?: LineData[];
  trades: BacktestTradeMarker[];
}

export interface BacktestTradeMarker {
  id: string;
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  side: 'long' | 'short';
  pnl: number;
  pnlPercent: number;
}

/**
 * 图表视图预设
 */
export interface ChartViewPreset {
  id: string;
  name: string;
  interval: TimeInterval;
  indicators: IndicatorConfig[];
  zoom: number;
  markers: MarkerData[];
}

/**
 * 预定义时间周期标签
 */
export const TIME_INTERVAL_LABELS: Record<TimeInterval, string> = {
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

/**
 * 时间周期秒数映射
 */
export const TIME_INTERVAL_SECONDS: Record<TimeInterval, number> = {
  '1m': 60,
  '3m': 180,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '2h': 7200,
  '4h': 14400,
  '6h': 21600,
  '8h': 28800,
  '12h': 43200,
  '1d': 86400,
  '3d': 259200,
  '1w': 604800,
  '1M': 2592000,
};

/**
 * 图表类型标签
 */
export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  candlestick: 'K 线图',
  line: '折线图',
  area: '面积图',
  bar: '柱状图',
  histogram: '直方图',
  baseline: '基线图',
  markers: '标记图',
};

/**
 * 指标类型标签
 */
export const INDICATOR_TYPE_LABELS: Record<IndicatorType, string> = {
  SMA: '简单移动平均 (SMA)',
  EMA: '指数移动平均 (EMA)',
  RSI: '相对强弱指数 (RSI)',
  MACD: 'MACD',
  BB: '布林带 (BB)',
  ATR: '平均真实波幅 (ATR)',
  KDJ: 'KDJ',
  WR: '威廉指标 (WR)',
  CCI: '商品通道指标 (CCI)',
  OBV: '能量潮 (OBV)',
  VWAP: '成交量加权均价 (VWAP)',
  ADX: '趋向指标 (ADX)',
  SAR: '抛物线指标 (SAR)',
  STOCH: '随机指标 (STOCH)',
};

/**
 * 默认图表配置
 */
export const DEFAULT_CHART_CONFIG: Omit<ChartConfig, 'id' | 'name' | 'symbol'> = {
  interval: '1h',
  theme: 'dark',
  showVolume: true,
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  showCrosshair: true,
  showPriceScale: true,
  showTimeScale: true,
  zoomMode: 'xy',
  defaultZoom: 100,
  defaultOffset: 0,
  realTimeEnabled: true,
  updateInterval: 1000,
  layout: {
    width: 800,
    height: 400,
    backgroundColor: '#131722',
    textColor: '#d1d4dc',
    gridColor: '#1e222d',
    borderColor: '#2a2e39',
    fontSize: 12,
    fontFamily: 'Trebuchet MS, Arial, sans-serif',
  },
};
