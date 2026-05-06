/**
 * NEMT Platform - Risk Store
 * 风险状态管理
 */

import { create } from 'zustand';
import type { RiskMetrics, RiskExposure, RiskLimit, RiskLevel } from '@/types';

/**
 * 风险状态
 */
export interface RiskState {
  // 当前风险指标
  metrics: RiskMetrics | null;
  
  // 风险敞口
  exposure: RiskExposure | null;
  
  // 风险限额
  limits: RiskLimit[];
  
  // 当前风险等级
  currentLevel: RiskLevel;
  
  // 活跃警告
  activeWarnings: RiskWarning[];
  
  // 加载状态
  isLoading: boolean;
  isRefreshing: boolean;
  
  // 告警设置
  alertEnabled: boolean;
  alertChannels: string[];
}

/**
 * 风险警告
 */
export interface RiskWarning {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: RiskLevel;
  triggeredAt: number;
  acknowledged: boolean;
}

/**
 * 风险操作
 */
export interface RiskActions {
  // 设置数据
  setMetrics: (metrics: RiskMetrics | null) => void;
  setExposure: (exposure: RiskExposure | null) => void;
  setLimits: (limits: RiskLimit[]) => void;
  
  // 限额操作
  updateLimitUsage: (limitId: string, current: number) => void;
  checkLimitBreach: (limitId: string) => { breached: boolean; percent: number };
  
  // 警告操作
  addWarning: (warning: RiskWarning) => void;
  acknowledgeWarning: (id: string) => void;
  clearWarning: (id: string) => void;
  
  // 风险等级
  setCurrentLevel: (level: RiskLevel) => void;
  
  // 告警设置
  setAlertEnabled: (enabled: boolean) => void;
  setAlertChannels: (channels: string[]) => void;
  
  // 加载状态
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // 检查风险状态
  checkRiskStatus: () => RiskStatus;
  
  // 重置
  reset: () => void;
}

/**
 * 风险状态
 */
export interface RiskStatus {
  level: RiskLevel;
  warnings: string[];
  limitBreaches: string[];
  recommendations: string[];
}

/**
 * 创建 Store
 */
export const useRiskStore = create<RiskState & RiskActions>()(
  (set, get) => ({
    // 初始状态
    metrics: null,
    exposure: null,
    limits: [],
    currentLevel: 'low',
    activeWarnings: [],
    isLoading: false,
    isRefreshing: false,
    alertEnabled: true,
    alertChannels: ['in_app'],
    
    // 设置数据
    setMetrics: (metrics) => {
      set({ metrics });
      
      // 更新风险等级
      if (metrics?.riskLevel) {
        get().setCurrentLevel(metrics.riskLevel);
      }
    },
    
    setExposure: (exposure) => set({ exposure }),
    
    setLimits: (limits) => set({ limits }),
    
    // 限额操作
    updateLimitUsage: (limitId, current) => set(state => ({
      limits: state.limits.map(limit => {
        if (limit.id !== limitId) return limit;
        
        const currentPercent = (current / limit.limit) * 100;
        let status: RiskLimit['status'] = 'normal';
        
        if (currentPercent >= 100) status = 'exceeded';
        else if (currentPercent >= limit.criticalThreshold) status = 'critical';
        else if (currentPercent >= limit.warningThreshold) status = 'warning';
        
        return {
          ...limit,
          current,
          currentPercent,
          status,
        };
      }),
    })),
    
    checkLimitBreach: (limitId) => {
      const limit = get().limits.find(l => l.id === limitId);
      if (!limit) return { breached: false, percent: 0 };
      
      return {
        breached: limit.currentPercent >= 100,
        percent: limit.currentPercent,
      };
    },
    
    // 警告操作
    addWarning: (warning) => set(state => ({
      activeWarnings: [warning, ...state.activeWarnings].slice(0, 50), // 最多保留50条
    })),
    
    acknowledgeWarning: (id) => set(state => ({
      activeWarnings: state.activeWarnings.map(w =>
        w.id === id ? { ...w, acknowledged: true } : w
      ),
    })),
    
    clearWarning: (id) => set(state => ({
      activeWarnings: state.activeWarnings.filter(w => w.id !== id),
    })),
    
    // 风险等级
    setCurrentLevel: (level) => set({ currentLevel: level }),
    
    // 告警设置
    setAlertEnabled: (enabled) => set({ alertEnabled: enabled }),
    setAlertChannels: (channels) => set({ alertChannels: channels }),
    
    // 加载状态
    setLoading: (isLoading) => set({ isLoading }),
    setRefreshing: (isRefreshing) => set({ isRefreshing }),
    
    // 检查风险状态
    checkRiskStatus: () => {
      const state = get();
      
      const warnings = state.activeWarnings
        .filter(w => !w.acknowledged)
        .map(w => w.message);
      
      const limitBreaches = state.limits
        .filter(l => l.status === 'exceeded')
        .map(l => l.name);
      
      const recommendations: string[] = [];
      
      // 根据风险等级添加建议
      if (state.currentLevel === 'high' || state.currentLevel === 'extreme') {
        recommendations.push('建议降低整体仓位');
        recommendations.push('考虑减少杠杆倍数');
      }
      
      if (limitBreaches.length > 0) {
        recommendations.push('需要调整或增加相关限额');
      }
      
      if (warnings.length > 0) {
        recommendations.push('请关注活跃的风险警告');
      }
      
      return {
        level: state.currentLevel,
        warnings,
        limitBreaches,
        recommendations,
      };
    },
    
    // 重置
    reset: () => set({
      metrics: null,
      exposure: null,
      limits: [],
      currentLevel: 'low',
      activeWarnings: [],
      isLoading: false,
      isRefreshing: false,
      alertEnabled: true,
      alertChannels: ['in_app'],
    }),
  })
);

// ============================================
// 选择器
// ============================================

export const useRiskMetrics = () => useRiskStore(state => state.metrics);
export const useRiskExposure = () => useRiskStore(state => state.exposure);
export const useRiskLimits = () => useRiskStore(state => state.limits);
export const useCurrentRiskLevel = () => useRiskStore(state => state.currentLevel);
export const useActiveWarnings = () => useRiskStore(state => state.activeWarnings);
export const useRiskAlertEnabled = () => useRiskStore(state => state.alertEnabled);
export const useRiskAlertChannels = () => useRiskStore(state => state.alertChannels);

// 获取限额使用率
export const useLimitUsage = (limitId: string) => useRiskStore(state => {
  const limit = state.limits.find(l => l.id === limitId);
  if (!limit) return { used: 0, remaining: 0, percent: 0 };
  
  return {
    used: limit.current,
    remaining: limit.limit - limit.current,
    percent: limit.currentPercent,
  };
});

// 获取所有警告限额
export const useBreachedLimits = () => useRiskStore(state =>
  state.limits.filter(l => l.status === 'exceeded')
);

// 获取警告中的限额
export const useWarningLimits = () => useRiskStore(state =>
  state.limits.filter(l => l.status === 'warning')
);

// 获取 VaR 数据
export const useVaR = () => useRiskStore(state => state.metrics?.valueAtRisk);

// 获取回撤数据
export const useDrawdownRisk = () => useRiskStore(state => ({
  maxDrawdown: state.metrics?.maxDrawdown,
  maxDrawdownPercent: state.metrics?.maxDrawdownPercent,
  currentDrawdown: state.metrics?.currentDrawdown,
  currentDrawdownPercent: state.metrics?.currentDrawdownPercent,
}));

// 获取杠杆使用情况
export const useLeverageUsage = () => useRiskStore(state => ({
  leverageRatio: state.exposure?.portfolioLeverage,
  effectiveLeverage: state.exposure?.effectiveLeverage,
  marginUsage: state.metrics?.marginUsage,
}));
