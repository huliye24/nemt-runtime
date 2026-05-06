/**
 * NEMT Platform - Indicator Presets
 * 技术指标默认参数预设
 */

// ============================================
// 指标参数类型
// ============================================

export interface IndicatorParam {
  name: string;
  label: string;
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export interface IndicatorPreset {
  id: string;
  name: string;
  nameEn: string;
  category: 'trend' | 'momentum' | 'volatility' | 'volume' | 'custom';
  params: IndicatorParam[];
  description: string;
}

// ============================================
// 趋势指标预设
// ============================================

export const TrendIndicators: IndicatorPreset[] = [
  {
    id: 'SMA',
    name: '简单移动平均',
    nameEn: 'Simple Moving Average',
    category: 'trend',
    params: [
      { name: 'period', label: '周期', default: 20, min: 2, max: 200, step: 1, description: '计算周期' },
    ],
    description: '简单平均价格',
  },
  {
    id: 'EMA',
    name: '指数移动平均',
    nameEn: 'Exponential Moving Average',
    category: 'trend',
    params: [
      { name: 'period', label: '周期', default: 12, min: 2, max: 200, step: 1, description: '计算周期' },
    ],
    description: '近期价格权重更大',
  },
  {
    id: 'WMA',
    name: '加权移动平均',
    nameEn: 'Weighted Moving Average',
    category: 'trend',
    params: [
      { name: 'period', label: '周期', default: 9, min: 2, max: 200, step: 1, description: '计算周期' },
    ],
    description: '线性加权平均',
  },
  {
    id: 'VWMA',
    name: '成交量加权平均',
    nameEn: 'Volume Weighted MA',
    category: 'trend',
    params: [
      { name: 'period', label: '周期', default: 20, min: 2, max: 200, step: 1, description: '计算周期' },
    ],
    description: '考虑成交量权重',
  },
  {
    id: 'TEMA',
    name: '三重指数平均',
    nameEn: 'Triple EMA',
    category: 'trend',
    params: [
      { name: 'period', label: '周期', default: 20, min: 2, max: 200, step: 1, description: '计算周期' },
    ],
    description: '三重平滑移动平均',
  },
  {
    id: 'Ichimoku',
    name: '一目均衡表',
    nameEn: 'Ichimoku Cloud',
    category: 'trend',
    params: [
      { name: 'tenkan', label: '转换线周期', default: 9, min: 5, max: 30, step: 1 },
      { name: 'kijun', label: '基准线周期', default: 26, min: 15, max: 60, step: 1 },
      { name: 'senkouB', label: '延展线B周期', default: 52, min: 30, max: 120, step: 1 },
      { name: 'displacement', label: '偏移', default: 26, min: 0, max: 52, step: 1 },
    ],
    description: '日本技术分析系统',
  },
  {
    id: 'Supertrend',
    name: '超级趋势',
    nameEn: 'Supertrend',
    category: 'trend',
    params: [
      { name: 'period', label: 'ATR 周期', default: 10, min: 5, max: 50, step: 1 },
      { name: 'multiplier', label: '倍数', default: 3, min: 1, max: 10, step: 0.5 },
    ],
    description: '趋势跟踪指标',
  },
  {
    id: 'ParabolicSAR',
    name: '抛物线指标',
    nameEn: 'Parabolic SAR',
    category: 'trend',
    params: [
      { name: 'start', label: '起始', default: 0.02, min: 0.001, max: 0.1, step: 0.001, description: '初始步长' },
      { name: 'increment', label: '增量', default: 0.02, min: 0.001, max: 0.1, step: 0.001, description: '步长增量' },
      { name: 'max', label: '最大值', default: 0.2, min: 0.05, max: 0.5, step: 0.01, description: '最大步长' },
    ],
    description: '止损转向指标',
  },
];

// ============================================
// 动量指标预设
// ============================================

export const MomentumIndicators: IndicatorPreset[] = [
  {
    id: 'RSI',
    name: '相对强弱指数',
    nameEn: 'Relative Strength Index',
    category: 'momentum',
    params: [
      { name: 'period', label: '周期', default: 14, min: 2, max: 50, step: 1, description: '计算周期' },
      { name: 'overbought', label: '超买', default: 70, min: 50, max: 90, step: 1 },
      { name: 'oversold', label: '超卖', default: 30, min: 10, max: 50, step: 1 },
    ],
    description: '0-100 超买超卖指标',
  },
  {
    id: 'Stochastic',
    name: '随机指标',
    nameEn: 'Stochastic Oscillator',
    category: 'momentum',
    params: [
      { name: 'kPeriod', label: 'K 周期', default: 14, min: 5, max: 30, step: 1 },
      { name: 'dPeriod', label: 'D 周期', default: 3, min: 1, max: 10, step: 1 },
      { name: 'smoothK', label: 'K 平滑', default: 3, min: 1, max: 10, step: 1 },
    ],
    description: 'K/D 线动量指标',
  },
  {
    id: 'MACD',
    name: 'MACD',
    nameEn: 'Moving Average Convergence Divergence',
    category: 'momentum',
    params: [
      { name: 'fastPeriod', label: '快线周期', default: 12, min: 5, max: 30, step: 1 },
      { name: 'slowPeriod', label: '慢线周期', default: 26, min: 10, max: 50, step: 1 },
      { name: 'signalPeriod', label: '信号线周期', default: 9, min: 5, max: 20, step: 1 },
    ],
    description: '移动平均收敛发散',
  },
  {
    id: 'CCI',
    name: '顺势指标',
    nameEn: 'Commodity Channel Index',
    category: 'momentum',
    params: [
      { name: 'period', label: '周期', default: 20, min: 5, max: 50, step: 1 },
    ],
    description: '超买超卖动量指标',
  },
  {
    id: 'ROC',
    name: '变动率',
    nameEn: 'Rate of Change',
    category: 'momentum',
    params: [
      { name: 'period', label: '周期', default: 12, min: 1, max: 50, step: 1 },
    ],
    description: '价格变化率',
  },
  {
    id: 'Momentum',
    name: '动量',
    nameEn: 'Momentum',
    category: 'momentum',
    params: [
      { name: 'period', label: '周期', default: 10, min: 1, max: 50, step: 1 },
    ],
    description: '价格动量指标',
  },
  {
    id: 'WilliamsR',
    name: '威廉指标',
    nameEn: "Williams %R",
    category: 'momentum',
    params: [
      { name: 'period', label: '周期', default: 14, min: 5, max: 30, step: 1 },
    ],
    description: '威廉超买超卖指标',
  },
  {
    id: 'StochRSI',
    name: '随机 RSI',
    nameEn: 'Stochastic RSI',
    category: 'momentum',
    params: [
      { name: 'period', label: 'RSI 周期', default: 14, min: 5, max: 30, step: 1 },
      { name: 'kPeriod', label: 'K 周期', default: 3, min: 1, max: 10, step: 1 },
      { name: 'dPeriod', label: 'D 周期', default: 3, min: 1, max: 10, step: 1 },
    ],
    description: 'RSI 的随机指标',
  },
];

// ============================================
// 波动率指标预设
// ============================================

export const VolatilityIndicators: IndicatorPreset[] = [
  {
    id: 'BB',
    name: '布林带',
    nameEn: 'Bollinger Bands',
    category: 'volatility',
    params: [
      { name: 'period', label: '周期', default: 20, min: 5, max: 50, step: 1 },
      { name: 'stdDev', label: '标准差倍数', default: 2, min: 0.5, max: 4, step: 0.1 },
    ],
    description: '价格波动带',
  },
  {
    id: 'ATR',
    name: '平均真实波幅',
    nameEn: 'Average True Range',
    category: 'volatility',
    params: [
      { name: 'period', label: '周期', default: 14, min: 5, max: 50, step: 1 },
    ],
    description: '市场波动性指标',
  },
  {
    id: 'KC',
    name: '肯特纳通道',
    nameEn: 'Keltner Channel',
    category: 'volatility',
    params: [
      { name: 'emaPeriod', label: 'EMA 周期', default: 20, min: 5, max: 50, step: 1 },
      { name: 'atrPeriod', label: 'ATR 周期', default: 10, min: 5, max: 30, step: 1 },
      { name: 'multiplier', label: '倍数', default: 2, min: 0.5, max: 5, step: 0.1 },
    ],
    description: 'ATR 通道指标',
  },
  {
    id: 'DC',
    name: '唐奇安通道',
    nameEn: 'Donchian Channel',
    category: 'volatility',
    params: [
      { name: 'period', label: '周期', default: 20, min: 5, max: 100, step: 1 },
    ],
    description: '价格通道指标',
  },
];

// ============================================
// 成交量指标预设
// ============================================

export const VolumeIndicators: IndicatorPreset[] = [
  {
    id: 'OBV',
    name: '能量潮',
    nameEn: 'On Balance Volume',
    category: 'volume',
    params: [
      { name: 'smoothPeriod', label: '平滑周期', default: 10, min: 1, max: 30, step: 1 },
    ],
    description: '成交量累计指标',
  },
  {
    id: 'VWAP',
    name: '成交量加权平均价',
    nameEn: 'Volume Weighted Average Price',
    category: 'volume',
    params: [
      { name: 'resetPeriod', label: '重置周期', default: 'D', min: undefined, max: undefined, step: undefined, description: 'D=日, W=周, M=月' },
    ],
    description: '加权平均价格',
  },
  {
    id: 'MFI',
    name: '资金流量指标',
    nameEn: 'Money Flow Index',
    category: 'volume',
    params: [
      { name: 'period', label: '周期', default: 14, min: 5, max: 30, step: 1 },
    ],
    description: '量能动量指标',
  },
  {
    id: 'ADL',
    name: '累积派发线',
    nameEn: 'Accumulation/Distribution',
    category: 'volume',
    params: [],
    description: '资金流入流出',
  },
  {
    id: 'CMF',
    name: '钱德动量摆动',
    nameEn: 'Chaikin Money Flow',
    category: 'volume',
    params: [
      { name: 'period', label: '周期', default: 20, min: 5, max: 50, step: 1 },
    ],
    description: '资金流指标',
  },
  {
    id: 'EOM',
    name: '简易波动指标',
    nameEn: 'Ease of Movement',
    category: 'volume',
    params: [
      { name: 'period', label: '周期', default: 14, min: 5, max: 50, step: 1 },
      { name: 'divisor', label: '除数', default: 1000000, min: 1000, max: 10000000, step: 1000 },
    ],
    description: '价格与成交量关系',
  },
];

// ============================================
// 所有指标预设
// ============================================

export const AllIndicators: IndicatorPreset[] = [
  ...TrendIndicators,
  ...MomentumIndicators,
  ...VolatilityIndicators,
  ...VolumeIndicators,
];

// ============================================
// 指标分类标签
// ============================================

export const IndicatorCategoryLabels: Record<IndicatorPreset['category'], { label: string; color: string }> = {
  trend: { label: '趋势', color: '#2196f3' },
  momentum: { label: '动量', color: '#ff9800' },
  volatility: { label: '波动', color: '#9c27b0' },
  volume: { label: '成交量', color: '#4caf50' },
  custom: { label: '自定义', color: '#607d8b' },
};

// ============================================
// 工具函数
// ============================================

/**
 * 获取指标预设
 */
export function getIndicatorPreset(id: string): IndicatorPreset | undefined {
  return AllIndicators.find(i => i.id === id);
}

/**
 * 按分类获取指标
 */
export function getIndicatorsByCategory(category: IndicatorPreset['category']): IndicatorPreset[] {
  return AllIndicators.filter(i => i.category === category);
}

/**
 * 获取指标参数默认值
 */
export function getIndicatorDefaults(id: string): Record<string, number | string> {
  const preset = getIndicatorPreset(id);
  if (!preset) return {};
  
  return preset.params.reduce((acc, param) => {
    acc[param.name] = param.default;
    return acc;
  }, {} as Record<string, number | string>);
}

/**
 * 验证指标参数
 */
export function validateIndicatorParams(id: string, params: Record<string, number>): boolean {
  const preset = getIndicatorPreset(id);
  if (!preset) return false;
  
  for (const param of preset.params) {
    const value = params[param.name];
    if (value === undefined) continue;
    
    if (param.min !== undefined && value < param.min) return false;
    if (param.max !== undefined && value > param.max) return false;
  }
  
  return true;
}

/**
 * 常用指标组合预设
 */
export const IndicatorCombos = {
  // 趋势跟踪
  trendFollowing: {
    label: '趋势跟踪',
    indicators: [
      { id: 'EMA', params: { period: 20 } },
      { id: 'EMA', params: { period: 50 } },
      { id: 'EMA', params: { period: 200 } },
    ],
  },
  
  // 均线交叉
  maCross: {
    label: '均线交叉',
    indicators: [
      { id: 'SMA', params: { period: 20 } },
      { id: 'SMA', params: { period: 50 } },
    ],
  },
  
  // 布林带策略
  bollingerBands: {
    label: '布林带策略',
    indicators: [
      { id: 'BB', params: { period: 20, stdDev: 2 } },
      { id: 'RSI', params: { period: 14 } },
    ],
  },
  
  // MACD 策略
  macdStrategy: {
    label: 'MACD 策略',
    indicators: [
      { id: 'MACD', params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } },
      { id: 'RSI', params: { period: 14 } },
    ],
  },
  
  // 动量策略
  momentumStrategy: {
    label: '动量策略',
    indicators: [
      { id: 'RSI', params: { period: 14 } },
      { id: 'Stochastic', params: { kPeriod: 14, dPeriod: 3, smoothK: 3 } },
      { id: 'CCI', params: { period: 20 } },
    ],
  },
  
  // 波段交易
  swingTrading: {
    label: '波段交易',
    indicators: [
      { id: 'EMA', params: { period: 50 } },
      { id: 'ATR', params: { period: 14 } },
      { id: 'RSI', params: { period: 14 } },
    ],
  },
  
  // 突破策略
  breakoutStrategy: {
    label: '突破策略',
    indicators: [
      { id: 'BB', params: { period: 20, stdDev: 2 } },
      { id: 'Volume', params: { period: 20 } },
    ],
  },
};
