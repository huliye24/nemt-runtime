/**
 * NEMT Platform - Animation Presets
 * 动画预设
 */

// ============================================
// 动画时长
// ============================================

export const AnimationDurations = {
  instant: '50ms',
  fast: '100ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '1000ms',
} as const;

// ============================================
// 缓动函数
// ============================================

export const EasingFunctions = {
  // 标准
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // 特殊
  linear: 'linear',
  
  // 弹性
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  
  // 渐进
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  snappy: 'cubic-bezier(0.2, 0, 0, 1)',
} as const;

// ============================================
// 基础动画类名
// ============================================

export const AnimationClasses = {
  // 过渡
  transition: 'transition-all duration-200 ease-out',
  transitionFast: 'transition-all duration-100 ease-out',
  transitionSlow: 'transition-all duration-300 ease-out',
  
  // 变换
  transform: 'transform transition-transform',
  scale: 'transform scale-100 hover:scale-105',
  scaleDown: 'transform hover:scale-95',
  
  // 旋转
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  ping: 'animate-ping',
  
  // 渐变
  fade: 'transition-opacity duration-200',
  slideUp: 'transition-all duration-200 translate-y-0',
  slideDown: 'transition-all duration-200',
} as const;

// ============================================
// 成功/失败动画
// ============================================

export const SuccessAnimations = {
  scale: {
    keyframes: `
      @keyframes success-scale {
        0% { transform: scale(0.8); opacity: 0; }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }
    `,
    className: 'animate-[success-scale_0.3s_ease-out_forwards]',
  },
  checkmark: {
    keyframes: `
      @keyframes success-check {
        0% { stroke-dashoffset: 24; }
        100% { stroke-dashoffset: 0; }
      }
    `,
    className: 'animate-[success-check_0.4s_ease-out_0.1s_forwards]',
  },
  confetti: {
    keyframes: `
      @keyframes confetti-fall {
        0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100px) rotate(720deg); opacity: 0; }
      }
    `,
    className: 'animate-[confetti-fall_1s_ease-out_forwards]',
  },
} as const;

export const FailureAnimations = {
  shake: {
    keyframes: `
      @keyframes failure-shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
        20%, 40%, 60%, 80% { transform: translateX(4px); }
      }
    `,
    className: 'animate-[failure-shake_0.5s_ease-in-out]',
  },
  pulse: {
    keyframes: `
      @keyframes failure-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
    className: 'animate-[failure-pulse_0.5s_ease-in-out]',
  },
} as const;

// ============================================
// 加载动画
// ============================================

export const LoadingAnimations = {
  spinner: {
    keyframes: `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
    className: 'animate-spin',
  },
  dots: {
    keyframes: `
      @keyframes dot-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
    `,
    className: 'animate-bounce',
  },
  progress: {
    keyframes: `
      @keyframes progress-indeterminate {
        0% { left: -35%; }
        100% { left: 100%; }
      }
    `,
    className: 'animate-[progress-indeterminate_1.5s_ease-in-out_infinite]',
  },
  pulse: {
    keyframes: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
    className: 'animate-pulse',
  },
} as const;

// ============================================
// 过渡动画预设
// ============================================

export const TransitionPresets = {
  // 淡入淡出
  fade: {
    enter: 'opacity-0',
    enterActive: 'opacity-100 transition-opacity duration-200',
    exit: 'opacity-100',
    exitActive: 'opacity-0 transition-opacity duration-200',
  },
  
  // 滑入
  slideUp: {
    enter: 'opacity-0 translate-y-4',
    enterActive: 'opacity-100 translate-y-0 transition-all duration-200',
    exit: 'opacity-100 translate-y-0',
    exitActive: 'opacity-0 translate-y-4 transition-all duration-200',
  },
  slideDown: {
    enter: 'opacity-0 -translate-y-4',
    enterActive: 'opacity-100 translate-y-0 transition-all duration-200',
    exit: 'opacity-100 translate-y-0',
    exitActive: 'opacity-0 -translate-y-4 transition-all duration-200',
  },
  slideLeft: {
    enter: 'opacity-0 translate-x-4',
    enterActive: 'opacity-100 translate-x-0 transition-all duration-200',
    exit: 'opacity-100 translate-x-0',
    exitActive: 'opacity-0 translate-x-4 transition-all duration-200',
  },
  slideRight: {
    enter: 'opacity-0 -translate-x-4',
    enterActive: 'opacity-100 translate-x-0 transition-all duration-200',
    exit: 'opacity-100 translate-x-0',
    exitActive: 'opacity-0 -translate-x-4 transition-all duration-200',
  },
  
  // 缩放
  scale: {
    enter: 'opacity-0 scale-95',
    enterActive: 'opacity-100 scale-100 transition-all duration-200',
    exit: 'opacity-100 scale-100',
    exitActive: 'opacity-0 scale-95 transition-all duration-200',
  },
  scaleUp: {
    enter: 'opacity-0 scale-90',
    enterActive: 'opacity-100 scale-100 transition-all duration-300',
    exit: 'opacity-100 scale-100',
    exitActive: 'opacity-0 scale-90 transition-all duration-200',
  },
  
  // 展开
  expand: {
    enter: 'opacity-0 max-h-0',
    enterActive: 'opacity-100 max-h-[1000px] transition-all duration-300 overflow-hidden',
    exit: 'opacity-100 max-h-[1000px]',
    exitActive: 'opacity-0 max-h-0 transition-all duration-300 overflow-hidden',
  },
} as const;

// ============================================
// 微交互动画
// ============================================

export const MicroInteractions = {
  // 按钮悬停
  buttonHover: {
    transform: 'scale(1.02)',
    transition: 'transform 100ms ease-out',
  },
  buttonActive: {
    transform: 'scale(0.98)',
    transition: 'transform 50ms ease-out',
  },
  
  // 卡片悬停
  cardHover: {
    borderColor: '#3d3660',
    transform: 'translateY(-2px)',
    transition: 'all 200ms ease-out',
  },
  cardLeave: {
    borderColor: '#2a2a2a',
    transform: 'translateY(0)',
    transition: 'all 200ms ease-out',
  },
  
  // 输入框聚焦
  inputFocus: {
    borderColor: '#6b21a8',
    boxShadow: '0 0 0 2px rgba(107, 33, 168, 0.2)',
    transition: 'all 150ms ease-out',
  },
  
  // 图标旋转
  iconRotate: {
    transform: 'rotate(180deg)',
    transition: 'transform 200ms ease-out',
  },
  
  // 开关
  toggleOn: {
    backgroundColor: '#6b21a8',
    transform: 'translateX(100%)',
    transition: 'all 200ms ease-out',
  },
  toggleOff: {
    backgroundColor: '#525252',
    transform: 'translateX(0)',
    transition: 'all 200ms ease-out',
  },
} as const;

// ============================================
// 页面过渡动画
// ============================================

export const PageTransitions = {
  fade: {
    enter: 'opacity-0',
    enterActive: 'opacity-100 transition-opacity duration-300',
    exit: 'opacity-100',
    exitActive: 'opacity-0 transition-opacity duration-200',
  },
  slide: {
    enter: 'opacity-0 translate-x-8',
    enterActive: 'opacity-100 translate-x-0 transition-all duration-300',
    exit: 'opacity-100 translate-x-0',
    exitActive: 'opacity-0 -translate-x-8 transition-all duration-200',
  },
  zoom: {
    enter: 'opacity-0 scale-95',
    enterActive: 'opacity-100 scale-100 transition-all duration-300',
    exit: 'opacity-100 scale-100',
    exitActive: 'opacity-0 scale-95 transition-all duration-200',
  },
} as const;

// ============================================
// 数字滚动动画
// ============================================

export const NumberAnimations = {
  count: {
    keyframes: `
      @keyframes count-up {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
    className: 'animate-[count-up_0.3s_ease-out_forwards]',
  },
  decrement: {
    keyframes: `
      @keyframes count-down {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
    className: 'animate-[count-down_0.3s_ease-out_forwards]',
  },
} as const;

// ============================================
// 通知动画
// ============================================

export const NotificationAnimations = {
  slideIn: {
    enter: 'translate-x-full opacity-0',
    enterActive: 'translate-x-0 opacity-100 transition-all duration-300',
    exit: 'translate-x-0 opacity-100',
    exitActive: 'translate-x-full opacity-0 transition-all duration-200',
  },
  fade: {
    enter: 'opacity-0',
    enterActive: 'opacity-100 transition-opacity duration-200',
    exit: 'opacity-100',
    exitActive: 'opacity-0 transition-opacity duration-200',
  },
  bounce: {
    enter: 'translate-y-8 opacity-0',
    enterActive: 'translate-y-0 opacity-100 transition-all duration-300',
    exit: 'translate-y-0 opacity-100',
    exitActive: 'translate-y-8 opacity-0 transition-all duration-200',
  },
} as const;

// ============================================
// 图表动画
// ============================================

export const ChartAnimations = {
  draw: {
    duration: 1000,
    easing: 'easeOutQuart',
  },
  update: {
    duration: 300,
    easing: 'easeInOutQuad',
  },
  hover: {
    duration: 150,
    easing: 'easeOut',
  },
} as const;

// ============================================
// 工具函数
// ============================================

/**
 * 生成内联样式动画
 */
export function getAnimationStyle(
  keyframes: string,
  className: string,
  duration: string = '0.3s'
): React.CSSProperties {
  return {
    animation: `${keyframes} ${duration} ease-out forwards`,
  };
}

/**
 * 生成过渡样式
 */
export function getTransitionStyle(
  property: string | string[] = 'all',
  duration: string = '200ms',
  easing: string = 'ease-out'
): React.CSSProperties {
  const properties = Array.isArray(property) ? property.join(', ') : property;
  return {
    transition: `${properties} ${duration} ${easing}`,
  };
}

/**
 * 生成悬停效果
 */
export function getHoverStyle(
  base: React.CSSProperties,
  hover: React.CSSProperties,
  active?: React.CSSProperties
): { base: React.CSSProperties; hover: React.CSSProperties; active?: React.CSSProperties } {
  return { base, hover, active };
}
