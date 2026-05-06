/**
 * NEMT Platform - 预设模块导出
 * 
 * 使用方式：
 * import { Colors, ButtonVariants } from '@/presets';
 * import { formatCurrency, formatPercent } from '@/presets';
 */

// ============================================
// 核心预设
// ============================================

export * from './presets';
export * from './templates';

// ============================================
// 动画预设
// ============================================

export * from './animations';

// ============================================
// 加载器预设
// ============================================

export * from './loaders';

// ============================================
// 图表主题预设
// ============================================

export * from './chartThemes';

// ============================================
// 板块预设
// ============================================

export * from './sectors';

// ============================================
// 交易时间预设
// ============================================

export * from './tradingTimes';

// ============================================
// 技术指标预设
// ============================================

export * from './indicators';

// ============================================
// 风险等级预设
// ============================================

export * from './riskLevels';

// ============================================
// 策略模板预设
// ============================================

export * from './strategyTemplates';

// ============================================
// 工具函数预设
// ============================================

export * from './formatters';
export * from './dateUtils';
export * from './mathUtils';

// ============================================
// 类型导出
// ============================================

export type { ChartTheme } from './chartThemes';
export type { IndicatorPreset, IndicatorParam } from './indicators';
export type { RiskLevel, RiskLevelConfig } from './riskLevels';
export type { StrategyTemplate, StrategyTemplateType } from './strategyTemplates';
export type { TimeframePreset, ExchangeTradingHours } from './tradingTimes';
export type { CryptoSectorInfo, StockSectorInfo, ForexPairInfo } from './sectors';
