/**
 * NEMT Platform - Loader Presets
 * 加载状态预设
 */

import { Colors } from './presets';

// ============================================
// 加载器颜色
// ============================================

export const LoaderColors = {
  primary: Colors.accent,
  secondary: Colors.textSecondary,
  white: '#ffffff',
  black: '#000000',
} as const;

// ============================================
// Spinner 预设
// ============================================

export const SpinnerPresets = {
  sm: {
    size: 16,
    strokeWidth: 2,
    color: LoaderColors.primary,
  },
  md: {
    size: 24,
    strokeWidth: 2.5,
    color: LoaderColors.primary,
  },
  lg: {
    size: 32,
    strokeWidth: 3,
    color: LoaderColors.primary,
  },
  xl: {
    size: 48,
    strokeWidth: 3.5,
    color: LoaderColors.primary,
  },
} as const;

// ============================================
// 骨架屏预设
// ============================================

export const SkeletonPresets = {
  text: {
    height: 16,
    width: '100%',
    borderRadius: 'rounded',
    backgroundColor: Colors.bgTertiary,
    animation: 'pulse',
  },
  title: {
    height: 24,
    width: '60%',
    borderRadius: 'rounded',
    backgroundColor: Colors.bgTertiary,
    animation: 'pulse',
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 'rounded-full',
    backgroundColor: Colors.bgTertiary,
    animation: 'pulse',
  },
  thumbnail: {
    height: 80,
    width: 80,
    borderRadius: 'rounded-lg',
    backgroundColor: Colors.bgTertiary,
    animation: 'pulse',
  },
  card: {
    height: 200,
    width: '100%',
    borderRadius: 'rounded-xl',
    backgroundColor: Colors.bgTertiary,
    animation: 'pulse',
  },
  button: {
    height: 40,
    width: 120,
    borderRadius: 'rounded-xl',
    backgroundColor: Colors.bgTertiary,
    animation: 'pulse',
  },
  chart: {
    height: 300,
    width: '100%',
    borderRadius: 'rounded-xl',
    backgroundColor: Colors.bgTertiary,
    animation: 'pulse',
  },
  table: {
    rows: 5,
    columns: 4,
    rowHeight: 48,
    borderRadius: 'rounded-xl',
    backgroundColor: Colors.bgTertiary,
    animation: 'pulse',
  },
} as const;

// ============================================
// 加载文本预设
// ============================================

export const LoadingTextPresets = {
  default: {
    text: '加载中...',
    color: Colors.textSecondary,
  },
  strategy: {
    text: '策略加载中...',
    color: Colors.textSecondary,
  },
  backtest: {
    text: '回测运行中...',
    color: Colors.textSecondary,
  },
  market: {
    text: '市场数据加载中...',
    color: Colors.textSecondary,
  },
  portfolio: {
    text: '投资组合加载中...',
    color: Colors.textSecondary,
  },
} as const;

// ============================================
// 进度条预设
// ============================================

export const ProgressPresets = {
  linear: {
    height: 4,
    borderRadius: 'rounded-full',
    backgroundColor: Colors.bgTertiary,
    fillColor: Colors.accent,
    animation: 'none',
  },
  circular: {
    size: 48,
    strokeWidth: 4,
    backgroundColor: Colors.bgTertiary,
    fillColor: Colors.accent,
    animation: 'spin',
  },
  indeterminate: {
    height: 4,
    borderRadius: 'rounded-full',
    backgroundColor: Colors.bgTertiary,
    animation: 'progress-indeterminate',
    keyframes: `
      @keyframes progress-indeterminate {
        0% { left: -35%; }
        100% { left: 100%; }
      }
    `,
  },
} as const;

// ============================================
// 占位符预设
// ============================================

export const PlaceholderPresets = {
  // 空状态占位符
  empty: {
    icon: 'inbox',
    title: '暂无数据',
    description: '暂无相关数据，请稍后再试',
  },
  
  // 搜索无结果
  searchEmpty: {
    icon: 'search',
    title: '未找到结果',
    description: '请尝试其他关键词',
  },
  
  // 策略空状态
  strategyEmpty: {
    icon: 'layers',
    title: '暂无策略',
    description: '创建你的第一个策略开始交易',
  },
  
  // 回测空状态
  backtestEmpty: {
    icon: 'play',
    title: '暂无回测记录',
    description: '运行回测来评估你的策略表现',
  },
  
  // 持仓空状态
  positionEmpty: {
    icon: 'briefcase',
    title: '暂无持仓',
    description: '你的持仓将显示在这里',
  },
  
  // 订单空状态
  orderEmpty: {
    icon: 'file-text',
    title: '暂无订单',
    description: '你的订单历史将显示在这里',
  },
  
  // 数据市场空状态
  dataMarketEmpty: {
    icon: 'database',
    title: '暂无数据源',
    description: '添加数据源以获取市场数据',
  },
} as const;

// ============================================
// 加载状态组件 Props 预设
// ============================================

export const LoadingStatePresets = {
  // 页面级加载
  page: {
    overlay: true,
    spinner: true,
    spinnerSize: 'lg' as const,
    text: '加载中...',
    blur: true,
    backgroundColor: 'rgba(13, 13, 13, 0.8)',
  },
  
  // 组件级加载
  component: {
    overlay: false,
    spinner: true,
    spinnerSize: 'md' as const,
    text: undefined,
    blur: false,
  },
  
  // 按钮内加载
  button: {
    overlay: false,
    spinner: true,
    spinnerSize: 'sm' as const,
    text: undefined,
    inline: true,
  },
  
  // 全屏加载
  fullscreen: {
    overlay: true,
    spinner: true,
    spinnerSize: 'xl' as const,
    text: '加载中，请稍候...',
    blur: false,
    backgroundColor: Colors.bg,
  },
} as const;

// ============================================
// 异步操作状态预设
// ============================================

export const AsyncStatePresets = {
  idle: {
    status: 'idle' as const,
    loading: false,
    error: null,
  },
  pending: {
    status: 'pending' as const,
    loading: true,
    error: null,
  },
  fulfilled: {
    status: 'fulfilled' as const,
    loading: false,
    error: null,
  },
  rejected: {
    status: 'rejected' as const,
    loading: false,
    error: null,
  },
} as const;

// ============================================
// 工具函数
// ============================================

/**
 * 获取骨架屏样式
 */
export function getSkeletonStyle(preset: keyof typeof SkeletonPresets): React.CSSProperties {
  const config = SkeletonPresets[preset];
  return {
    height: 'height' in config ? config.height : undefined,
    width: 'width' in config ? config.width : undefined,
    borderRadius: 'borderRadius' in config ? undefined : undefined,
    backgroundColor: 'backgroundColor' in config ? config.backgroundColor : Colors.bgTertiary,
  };
}

/**
 * 生成随机骨架屏变化
 */
export function generateSkeletonVariants(count: number, variant: keyof typeof SkeletonPresets = 'text') {
  return Array.from({ length: count }, (_, i) => ({
    ...SkeletonPresets[variant],
    key: i,
    width: `${Math.random() * 40 + 60}%`,
  }));
}
