/**
 * NEMT Platform - Signal Store
 * 信号状态管理
 */

import { create } from 'zustand';
import type { Signal, SignalStatus, SignalFilterConfig } from '@/types';

/**
 * 信号状态
 */
export interface SignalState {
  // 信号列表
  signals: Signal[];
  
  // 当前选中的信号
  selectedSignalId: string | null;
  
  // 活跃信号（待处理）
  pendingSignals: Signal[];
  
  // 已处理信号
  processedSignals: Signal[];
  
  // 加载状态
  isLoading: boolean;
  isRefreshing: boolean;
  
  // 分页
  page: number;
  pageSize: number;
  total: number;
  
  // 过滤配置
  filters: SignalFilterConfig;
  
  // 统计
  stats: SignalStats;
}

/**
 * 信号统计
 */
export interface SignalStats {
  totalSignals: number;
  signalsByType: Record<string, number>;
  signalsByDirection: Record<string, number>;
  signalsByStatus: Record<string, number>;
  averageConfidence: number;
  executionRate: number;
  averageExecutionTime: number;
}

/**
 * 信号操作
 */
export interface SignalActions {
  // CRUD 操作
  setSignals: (signals: Signal[]) => void;
  addSignal: (signal: Signal) => void;
  updateSignal: (id: string, updates: Partial<Signal>) => void;
  removeSignal: (id: string) => void;
  
  // 选择
  selectSignal: (id: string | null) => void;
  
  // 状态更新
  updateSignalStatus: (id: string, status: SignalStatus) => void;
  
  // 过滤
  setFilters: (filters: Partial<SignalFilterConfig>) => void;
  clearFilters: () => void;
  
  // 分页
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  
  // 加载状态
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // 统计更新
  updateStats: (stats: Partial<SignalStats>) => void;
  
  // 批量操作
  batchUpdateStatus: (ids: string[], status: SignalStatus) => void;
  
  // 重置
  reset: () => void;
}

/**
 * 默认过滤配置
 */
const defaultFilters: SignalFilterConfig = {
  minConfidence: 0,
  allowedDirections: ['long', 'short', 'close', 'neutral'],
  allowedTypes: ['entry', 'exit', 'adjust', 'alert'],
};

/**
 * 初始统计
 */
const initialStats: SignalStats = {
  totalSignals: 0,
  signalsByType: {},
  signalsByDirection: {},
  signalsByStatus: {},
  averageConfidence: 0,
  executionRate: 0,
  averageExecutionTime: 0,
};

/**
 * 创建 Store
 */
export const useSignalStore = create<SignalState & SignalActions>()(
  (set, get) => ({
    // 初始状态
    signals: [],
    selectedSignalId: null,
    pendingSignals: [],
    processedSignals: [],
    isLoading: false,
    isRefreshing: false,
    page: 1,
    pageSize: 20,
    total: 0,
    filters: defaultFilters,
    stats: initialStats,
    
    // CRUD 操作
    setSignals: (signals) => {
      const pendingSignals = signals.filter(s => 
        ['pending', 'generated', 'validated', 'sent'].includes(s.status)
      );
      const processedSignals = signals.filter(s => 
        ['executed', 'rejected', 'expired', 'cancelled'].includes(s.status)
      );
      
      set({ signals, pendingSignals, processedSignals });
    },
    
    addSignal: (signal) => set(state => {
      const newSignals = [signal, ...state.signals];
      const isPending = ['pending', 'generated', 'validated', 'sent'].includes(signal.status);
      
      return {
        signals: newSignals,
        pendingSignals: isPending ? [signal, ...state.pendingSignals] : state.pendingSignals,
        processedSignals: !isPending ? [signal, ...state.processedSignals] : state.processedSignals,
      };
    }),
    
    updateSignal: (id, updates) => set(state => {
      const updateFn = (signals: Signal[]) => 
        signals.map(s => s.id === id ? { ...s, ...updates } : s);
      
      return {
        signals: updateFn(state.signals),
        pendingSignals: updateFn(state.pendingSignals),
        processedSignals: updateFn(state.processedSignals),
      };
    }),
    
    removeSignal: (id) => set(state => ({
      signals: state.signals.filter(s => s.id !== id),
      pendingSignals: state.pendingSignals.filter(s => s.id !== id),
      processedSignals: state.processedSignals.filter(s => s.id !== id),
      selectedSignalId: state.selectedSignalId === id ? null : state.selectedSignalId,
    })),
    
    // 选择
    selectSignal: (id) => set({ selectedSignalId: id }),
    
    // 状态更新
    updateSignalStatus: (id, status) => {
      const signal = get().signals.find(s => s.id === id);
      if (!signal) return;
      
      const now = Date.now();
      const updatedSignal = { ...signal, status, ...(status === 'executed' ? { executedAt: now } : {}) };
      const isPending = ['pending', 'generated', 'validated', 'sent'].includes(status);
      
      set(state => ({
        signals: state.signals.map(s => s.id === id ? updatedSignal : s),
        pendingSignals: isPending 
          ? [updatedSignal, ...state.pendingSignals.filter(s => s.id !== id)]
          : state.pendingSignals.filter(s => s.id !== id),
        processedSignals: !isPending 
          ? [updatedSignal, ...state.processedSignals.filter(s => s.id !== id)]
          : state.processedSignals,
      }));
    },
    
    // 过滤
    setFilters: (filters) => set(state => ({
      filters: { ...state.filters, ...filters },
      page: 1,
    })),
    clearFilters: () => set({ filters: defaultFilters, page: 1 }),
    
    // 分页
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    
    // 加载状态
    setLoading: (isLoading) => set({ isLoading }),
    setRefreshing: (isRefreshing) => set({ isRefreshing }),
    
    // 统计更新
    updateStats: (stats) => set(state => ({
      stats: { ...state.stats, ...stats },
    })),
    
    // 批量操作
    batchUpdateStatus: (ids, status) => set(state => {
      const now = Date.now();
      const updatedSignals = state.signals.map(s => 
        ids.includes(s.id) ? { ...s, status } : s
      );
      
      const pendingSignals = updatedSignals.filter(s => 
        ['pending', 'generated', 'validated', 'sent'].includes(s.status)
      );
      const processedSignals = updatedSignals.filter(s => 
        ['executed', 'rejected', 'expired', 'cancelled'].includes(s.status)
      );
      
      return { signals: updatedSignals, pendingSignals, processedSignals };
    }),
    
    // 重置
    reset: () => set({
      signals: [],
      selectedSignalId: null,
      pendingSignals: [],
      processedSignals: [],
      isLoading: false,
      isRefreshing: false,
      page: 1,
      pageSize: 20,
      total: 0,
      filters: defaultFilters,
      stats: initialStats,
    }),
  })
);

// ============================================
// 选择器
// ============================================

export const useSignals = () => useSignalStore(state => state.signals);
export const usePendingSignals = () => useSignalStore(state => state.pendingSignals);
export const useProcessedSignals = () => useSignalStore(state => state.processedSignals);
export const useSelectedSignal = () => useSignalStore(state =>
  state.signals.find(s => s.id === state.selectedSignalId)
);
export const useSignalFilters = () => useSignalStore(state => state.filters);
export const useSignalStats = () => useSignalStore(state => state.stats);
export const useSignalPagination = () => useSignalStore(state => ({
  page: state.page,
  pageSize: state.pageSize,
  total: state.total,
}));

// 按类型获取信号
export const useSignalsByType = (type: string) => useSignalStore(state =>
  state.signals.filter(s => s.type === type)
);

// 按方向获取信号
export const useSignalsByDirection = (direction: string) => useSignalStore(state =>
  state.signals.filter(s => s.direction === direction)
);

// 按策略获取信号
export const useSignalsByStrategy = (strategyId: string) => useSignalStore(state =>
  state.signals.filter(s => s.strategyId === strategyId)
);

// 高置信度信号
export const useHighConfidenceSignals = (threshold: number = 70) => useSignalStore(state =>
  state.signals.filter(s => s.confidence.score >= threshold)
);
