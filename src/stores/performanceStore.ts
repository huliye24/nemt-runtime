/**
 * NEMT Platform - Performance Store
 * 绩效状态管理
 */

import { create } from 'zustand';
import type { PerformanceSummary, PerformancePeriod } from '@/types';

/**
 * 绩效状态
 */
export interface PerformanceState {
  // 当前绩效
  current: PerformanceSummary | null;
  
  // 绩效历史
  history: PerformanceDataPoint[];
  
  // 月度绩效
  monthlyPerformance: MonthlyPerformanceData[];
  
  // 当前选择的时间周期
  selectedPeriod: PerformancePeriod;
  
  // 加载状态
  isLoading: boolean;
  isRefreshing: boolean;
  
  // 对比
  comparisonEnabled: boolean;
  benchmarkSymbol: string | null;
}

/**
 * 绩效数据点
 */
export interface PerformanceDataPoint {
  timestamp: number;
  equity: number;
  cash: number;
  return: number;
  returnPercent: number;
  drawdown: number;
  drawdownPercent: number;
}

/**
 * 月度绩效数据
 */
export interface MonthlyPerformanceData {
  year: number;
  month: number;
  return: number;
  returnPercent: number;
  trades: number;
  wins: number;
  losses: number;
  isBest: boolean;
  isWorst: boolean;
}

/**
 * 绩效操作
 */
export interface PerformanceActions {
  // 设置绩效数据
  setCurrent: (summary: PerformanceSummary | null) => void;
  setHistory: (history: PerformanceDataPoint[]) => void;
  setMonthlyPerformance: (data: MonthlyPerformanceData[]) => void;
  
  // 添加数据点
  addDataPoint: (point: PerformanceDataPoint) => void;
  
  // 时间周期
  setSelectedPeriod: (period: PerformancePeriod) => void;
  
  // 对比
  setComparisonEnabled: (enabled: boolean) => void;
  setBenchmarkSymbol: (symbol: string | null) => void;
  
  // 加载状态
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // 更新当前绩效
  updateReturn: (returnValue: number, returnPercent: number) => void;
  updateDrawdown: (drawdown: number, drawdownPercent: number) => void;
  
  // 重置
  reset: () => void;
}

/**
 * 创建 Store
 */
export const usePerformanceStore = create<PerformanceState & PerformanceActions>()(
  (set) => ({
    // 初始状态
    current: null,
    history: [],
    monthlyPerformance: [],
    selectedPeriod: '7d',
    isLoading: false,
    isRefreshing: false,
    comparisonEnabled: false,
    benchmarkSymbol: null,
    
    // 设置数据
    setCurrent: (summary) => set({ current: summary }),
    
    setHistory: (history) => set({ history }),
    
    setMonthlyPerformance: (data) => set({ monthlyPerformance: data }),
    
    // 添加数据点
    addDataPoint: (point) => set(state => ({
      history: [...state.history, point].slice(-365), // 保留最多365天
    })),
    
    // 时间周期
    setSelectedPeriod: (period) => set({ selectedPeriod: period }),
    
    // 对比
    setComparisonEnabled: (enabled) => set({ comparisonEnabled: enabled }),
    setBenchmarkSymbol: (symbol) => set({ benchmarkSymbol: symbol }),
    
    // 加载状态
    setLoading: (isLoading) => set({ isLoading }),
    setRefreshing: (isRefreshing) => set({ isRefreshing }),
    
    // 更新当前绩效
    updateReturn: (returnValue, returnPercent) => set(state => {
      if (!state.current) return state;
      return {
        current: {
          ...state.current,
          dayReturn: returnValue,
          weekReturn: returnPercent,
        },
      };
    }),
    
    updateDrawdown: (drawdown, drawdownPercent) => set(state => {
      if (!state.current) return state;
      return {
        current: {
          ...state.current,
          currentDrawdown: drawdown,
          currentDrawdownDuration: drawdownPercent,
        },
      };
    }),
    
    // 重置
    reset: () => set({
      current: null,
      history: [],
      monthlyPerformance: [],
      selectedPeriod: '7d',
      isLoading: false,
      isRefreshing: false,
      comparisonEnabled: false,
      benchmarkSymbol: null,
    }),
  })
);

// ============================================
// 选择器
// ============================================

export const useCurrentPerformance = () => usePerformanceStore(state => state.current);
export const usePerformanceHistory = () => usePerformanceStore(state => state.history);
export const useMonthlyPerformance = () => usePerformanceStore(state => state.monthlyPerformance);
export const useSelectedPeriod = () => usePerformanceStore(state => state.selectedPeriod);
export const useComparisonEnabled = () => usePerformanceStore(state => state.comparisonEnabled);
export const useBenchmarkSymbol = () => usePerformanceStore(state => state.benchmarkSymbol);

// 获取权益曲线
export const useEquityCurve = () => usePerformanceStore(state =>
  state.history.map(h => ({ timestamp: h.timestamp, value: h.equity }))
);

// 获取回撤曲线
export const useDrawdownCurve = () => usePerformanceStore(state =>
  state.history.map(h => ({ timestamp: h.timestamp, value: h.drawdownPercent }))
);

// 获取收益率曲线
export const useReturnCurve = () => usePerformanceStore(state =>
  state.history.map(h => ({ timestamp: h.timestamp, value: h.returnPercent }))
);

// 计算累计收益率
export const useCumulativeReturn = () => usePerformanceStore(state => {
  if (state.history.length === 0) return 0;
  const firstEquity = state.history[0].equity;
  const lastEquity = state.history[state.history.length - 1].equity;
  return ((lastEquity - firstEquity) / firstEquity) * 100;
});
