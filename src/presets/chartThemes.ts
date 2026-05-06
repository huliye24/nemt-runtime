/**
 * NEMT Platform - Chart Theme Presets
 * 图表主题预设
 */

import { Colors } from './presets';

// ============================================
// 基础图表主题
// ============================================

export interface ChartTheme {
  name: string;
  
  // 背景
  background: string;
  backgroundTransparent: string;
  
  // 文字
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // 网格
  grid: string;
  gridMinor: string;
  
  // 边框
  border: string;
  
  // 蜡烛图
  candle: {
    upColor: string;
    upBorderColor: string;
    downColor: string;
    downBorderColor: string;
    wickColor: string;
  };
  
  // 线条
  line: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  
  // 柱状图
  histogram: {
    positive: string;
    negative: string;
  };
  
  // 区域
  area: {
    top: string;
    bottom: string;
  };
  
  // 指标
  indicator: {
    primary: string;
    secondary: string;
    tertiary: string;
    fill: string;
  };
  
  // 标记
  marker: {
    buy: string;
    sell: string;
    neutral: string;
  };
  
  // 十字线
  crosshair: string;
  
  // 缩放
  scrollbar: {
    background: string;
    thumb: string;
  };
}

// ============================================
// 深色主题（默认）
// ============================================

export const DarkChartTheme: ChartTheme = {
  name: 'dark',
  
  background: '#131722',
  backgroundTransparent: 'transparent',
  
  text: '#d1d4dc',
  textSecondary: '#787b86',
  textMuted: '#5c5e6a',
  
  grid: '#1e222d',
  gridMinor: '#2a2e39',
  
  border: '#2a2e39',
  
  candle: {
    upColor: '#26a69a',
    upBorderColor: '#26a69a',
    downColor: '#ef5350',
    downBorderColor: '#ef5350',
    wickColor: '#737375',
  },
  
  line: {
    primary: '#26a69a',
    secondary: '#2196f3',
    tertiary: '#9c27b0',
  },
  
  histogram: {
    positive: 'rgba(38, 166, 154, 0.5)',
    negative: 'rgba(239, 83, 80, 0.5)',
  },
  
  area: {
    top: 'rgba(38, 166, 154, 0.4)',
    bottom: 'rgba(38, 166, 154, 0.0)',
  },
  
  indicator: {
    primary: '#2196f3',
    secondary: '#ff9800',
    tertiary: '#9c27b0',
    fill: 'rgba(33, 150, 243, 0.2)',
  },
  
  marker: {
    buy: '#26a69a',
    sell: '#ef5350',
    neutral: '#9c27b0',
  },
  
  crosshair: '#758696',
  
  scrollbar: {
    background: '#1e222d',
    thumb: '#5c5e6a',
  },
};

// ============================================
// 浅色主题
// ============================================

export const LightChartTheme: ChartTheme = {
  name: 'light',
  
  background: '#ffffff',
  backgroundTransparent: 'transparent',
  
  text: '#131722',
  textSecondary: '#787b86',
  textMuted: '#9b9b9b',
  
  grid: '#e0e0e0',
  gridMinor: '#f0f0f0',
  
  border: '#d1d4dc',
  
  candle: {
    upColor: '#26a69a',
    upBorderColor: '#26a69a',
    downColor: '#ef5350',
    downBorderColor: '#ef5350',
    wickColor: '#737375',
  },
  
  line: {
    primary: '#2196f3',
    secondary: '#ff9800',
    tertiary: '#9c27b0',
  },
  
  histogram: {
    positive: 'rgba(38, 166, 154, 0.5)',
    negative: 'rgba(239, 83, 80, 0.5)',
  },
  
  area: {
    top: 'rgba(33, 150, 243, 0.4)',
    bottom: 'rgba(33, 150, 243, 0.0)',
  },
  
  indicator: {
    primary: '#2196f3',
    secondary: '#ff9800',
    tertiary: '#9c27b0',
    fill: 'rgba(33, 150, 243, 0.2)',
  },
  
  marker: {
    buy: '#26a69a',
    sell: '#ef5350',
    neutral: '#9c27b0',
  },
  
  crosshair: '#758696',
  
  scrollbar: {
    background: '#f0f0f0',
    thumb: '#d1d4dc',
  },
};

// ============================================
// TradingView 风格主题
// ============================================

export const TradingViewDarkTheme: ChartTheme = {
  name: 'TradingView Dark',
  
  background: '#131722',
  backgroundTransparent: 'transparent',
  
  text: '#d1d4dc',
  textSecondary: '#787b86',
  textMuted: '#5c5e6a',
  
  grid: '#1e222d',
  gridMinor: '#2a2e39',
  
  border: '#2a2e39',
  
  candle: {
    upColor: '#26a69a',
    upBorderColor: '#26a69a',
    downColor: '#ef5350',
    downBorderColor: '#ef5350',
    wickColor: '#737375',
  },
  
  line: {
    primary: '#26a69a',
    secondary: '#2196f3',
    tertiary: '#9c27b0',
  },
  
  histogram: {
    positive: 'rgba(38, 166, 154, 0.5)',
    negative: 'rgba(239, 83, 80, 0.5)',
  },
  
  area: {
    top: 'rgba(38, 166, 154, 0.4)',
    bottom: 'rgba(38, 166, 154, 0.0)',
  },
  
  indicator: {
    primary: '#2196f3',
    secondary: '#ff9800',
    tertiary: '#9c27b0',
    fill: 'rgba(33, 150, 243, 0.2)',
  },
  
  marker: {
    buy: '#26a69a',
    sell: '#ef5350',
    neutral: '#9c27b0',
  },
  
  crosshair: '#758696',
  
  scrollbar: {
    background: '#1e222d',
    thumb: '#5c5e6a',
  },
};

// ============================================
// K线配色预设
// ============================================

export const CandleColorPresets = {
  // 经典绿涨红跌
  classic: {
    upColor: '#26a69a',
    upBorderColor: '#26a69a',
    downColor: '#ef5350',
    downBorderColor: '#ef5350',
  },
  
  // 白涨红跌
  whiteRed: {
    upColor: '#ffffff',
    upBorderColor: '#ffffff',
    downColor: '#ef5350',
    downBorderColor: '#ef5350',
  },
  
  // 蓝涨红跌
  blueRed: {
    upColor: '#2196f3',
    upBorderColor: '#2196f3',
    downColor: '#ef5350',
    downBorderColor: '#ef5350',
  },
  
  // 绿涨灰跌
  greenGray: {
    upColor: '#26a69a',
    upBorderColor: '#26a69a',
    downColor: '#787b86',
    downBorderColor: '#787b86',
  },
  
  // 自定义主题色
  theme: {
    upColor: Colors.success,
    upBorderColor: Colors.success,
    downColor: Colors.error,
    downBorderColor: Colors.error,
  },
} as const;

// ============================================
// 指标配色预设
// ============================================

export const IndicatorColorPresets = {
  // 默认
  default: {
    primary: '#2196f3',
    secondary: '#ff9800',
    tertiary: '#9c27b0',
    quaternary: '#4caf50',
  },
  
  // 彩虹
  rainbow: {
    primary: '#ef5350',
    secondary: '#ff9800',
    tertiary: '#ffeb3b',
    quaternary: '#4caf50',
  },
  
  // 柔和
  soft: {
    primary: '#64b5f6',
    secondary: '#81c784',
    tertiary: '#ffb74d',
    quaternary: '#ba68c8',
  },
  
  // 高对比
  highContrast: {
    primary: '#00bcd4',
    secondary: '#ff5722',
    tertiary: '#8bc34a',
    quaternary: '#e91e63',
  },
  
  // 单色
  monochrome: {
    primary: '#90caf9',
    secondary: '#64b5f6',
    tertiary: '#42a5f5',
    quaternary: '#2196f3',
  },
} as const;

// ============================================
// 主题预设映射
// ============================================

export const ChartThemePresets = {
  dark: DarkChartTheme,
  light: LightChartTheme,
  'TradingView Dark': TradingViewDarkTheme,
} as const;

// ============================================
// 工具函数
// ============================================

/**
 * 获取主题
 */
export function getChartTheme(theme: keyof typeof ChartThemePresets): ChartTheme {
  return ChartThemePresets[theme] || DarkChartTheme;
}

/**
 * 获取颜色（带透明度）
 */
export function withOpacity(color: string, opacity: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * 主题颜色转 TradingView 格式
 */
export function toTradingViewColor(color: string): string {
  return color.replace('#', '');
}
