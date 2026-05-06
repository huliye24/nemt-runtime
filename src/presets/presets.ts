/**
 * NEMT Platform - 组件预设
 * 常用组件的样式预设，快速复用
 * 所有颜色必须从本模块导入，禁止硬编码
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

// ============================================
// 基础颜色（必须使用，禁止硬编码）
// ============================================

export const Colors = {
  // 背景
  bg: '#0d0d0d',
  bgSecondary: '#141414',
  bgTertiary: '#1a1a1a',

  // 边框
  border: '#2a2a2a',
  borderHover: '#3d3660',
  borderFocus: '#6b21a8',

  // 文字
  text: '#ffffff',
  textSecondary: '#a3a3a3',
  textMuted: '#737373',
  textDisabled: '#525252',

  // 强调色
  accent: '#c084fc',
  accentHover: '#a855f7',

  // 语义色
  success: '#22c55e',
  successBg: '#052e16',
  warning: '#fbbf24',
  warningBg: '#451a03',
  error: '#ef4444',
  errorBg: '#450a0a',
  info: '#3b82f6',
  infoBg: '#172554',
} as const;

export type ColorKey = keyof typeof Colors;

// ============================================
// CSS 变量映射（用于 CSS-in-JS）
// ============================================

export const CSSVars = {
  bg: 'var(--nemt-bg)',
  bgSecondary: 'var(--nemt-bg-secondary)',
  bgTertiary: 'var(--nemt-bg-tertiary)',
  border: 'var(--nemt-border)',
  borderHover: 'var(--nemt-border-hover)',
  text: 'var(--nemt-text)',
  textSecondary: 'var(--nemt-text-secondary)',
  textMuted: 'var(--nemt-text-muted)',
  accent: 'var(--nemt-accent)',
} as const;

// ============================================
// 按钮预设
// ============================================

export const ButtonVariants = {
  primary: {
    bg: '#6b21a8',
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    bg: '#262626',
    color: '#a3a3a3',
    border: '1px solid #2a2a2a',
  },
  ghost: {
    bg: 'transparent',
    color: '#737373',
    border: 'none',
  },
  success: {
    bg: '#052e16',
    color: '#22c55e',
    border: 'none',
  },
  danger: {
    bg: '#450a0a',
    color: '#ef4444',
    border: 'none',
  },
} as const;

export type ButtonVariant = keyof typeof ButtonVariants;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: LucideIcon;
  iconSize?: number;
  loading?: boolean;
}

// ============================================
// 卡片预设
// ============================================

export const CardStyles = {
  default: {
    bg: Colors.bgSecondary,
    border: Colors.border,
    borderHover: Colors.borderHover,
    padding: 'p-5',
    radius: 'rounded-xl',
  },
  elevated: {
    bg: Colors.bgTertiary,
    border: Colors.border,
    borderHover: Colors.borderHover,
    padding: 'p-4',
    radius: 'rounded-2xl',
  },
  compact: {
    bg: Colors.bgSecondary,
    border: Colors.border,
    borderHover: Colors.borderHover,
    padding: 'p-3',
    radius: 'rounded-lg',
  },
} as const;

export type CardStyle = keyof typeof CardStyles;

// ============================================
// 输入框预设
// ============================================

export const InputStyles = {
  default: {
    bg: Colors.bgTertiary,
    border: Colors.border,
    borderFocus: Colors.borderFocus,
    color: Colors.text,
    placeholderColor: Colors.textMuted,
    padding: 'px-4 py-3',
    radius: 'rounded-xl',
  },
  compact: {
    bg: Colors.bgTertiary,
    border: Colors.border,
    borderFocus: Colors.borderFocus,
    color: Colors.text,
    placeholderColor: Colors.textMuted,
    padding: 'px-3 py-2',
    radius: 'rounded-lg',
  },
} as const;

// ============================================
// 状态标签预设
// ============================================

export const StatusConfig = {
  draft: { label: '草稿', color: Colors.textMuted, bg: Colors.bgTertiary },
  ready: { label: '就绪', color: Colors.success, bg: Colors.successBg },
  running: { label: '运行中', color: Colors.info, bg: Colors.infoBg },
  paused: { label: '已暂停', color: Colors.warning, bg: Colors.warningBg },
  error: { label: '错误', color: Colors.error, bg: Colors.errorBg },
  archived: { label: '已归档', color: Colors.textMuted, bg: Colors.bgSecondary },
} as const;

export type Status = keyof typeof StatusConfig;

// ============================================
// 布局预设
// ============================================

export const Layout = {
  maxWidth: 'max-w-4xl',
  contentPadding: 'px-8 py-10',
  sectionGap: 'space-y-6',
  gridCols2: 'grid grid-cols-2 gap-4',
  gridCols3: 'grid grid-cols-3 gap-4',
} as const;

// ============================================
// 动画预设
// ============================================

export const Transitions = {
  fast: 'transition-all duration-150',
  normal: 'transition-all duration-200',
  slow: 'transition-all duration-300',
} as const;

// ============================================
// 圆角预设
// ============================================

export const Radius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
} as const;

// ============================================
// 通用组件预设
// ============================================

export const ComponentStyles = {
  card: {
    default: {
      bg: Colors.bgSecondary,
      border: Colors.border,
      borderHover: Colors.borderHover,
      padding: 'p-5',
      radius: 'rounded-xl',
    },
    elevated: {
      bg: Colors.bgTertiary,
      border: Colors.border,
      borderHover: Colors.borderHover,
      padding: 'p-4',
      radius: 'rounded-2xl',
    },
    interactive: {
      onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.borderColor = Colors.borderHover;
      },
      onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.borderColor = Colors.border;
      },
    },
  },
  button: {
    padding: 'px-4 py-2.5',
    radius: 'rounded-xl',
    fontSize: 'text-sm',
    fontWeight: 'font-medium',
    transition: Transitions.normal,
  },
  input: {
    padding: 'px-4 py-3',
    radius: 'rounded-xl',
    fontSize: 'text-sm',
    transition: Transitions.fast,
  },
} as const;

// ============================================
// 阴影预设
// ============================================

export const Shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  glow: `0 0 20px ${Colors.accent}30`,
} as const;

// ============================================
// Z-Index 层级
// ============================================

export const ZIndex = {
  dropdown: 40,
  sticky: 50,
  modal: 60,
  popover: 70,
  tooltip: 80,
  toast: 90,
} as const;
