/**
 * NEMT Platform - Alert Store
 * 报警状态管理
 */

import { create } from 'zustand';
import type { Alert, AlertType, AlertSeverity, AlertStatus } from '@/types';

/**
 * 报警状态
 */
export interface AlertState {
  // 报警列表
  alerts: Alert[];
  
  // 当前选中的报警
  selectedAlertId: string | null;
  
  // 未读报警
  unreadAlerts: Alert[];
  
  // 活跃报警（未解决）
  activeAlerts: Alert[];
  
  // 已解决报警
  resolvedAlerts: Alert[];
  
  // 加载状态
  isLoading: boolean;
  isRefreshing: boolean;
  
  // 分页
  page: number;
  pageSize: number;
  total: number;
  
  // 过滤
  filters: AlertFilters;
  
  // 统计
  stats: AlertStats;
  
  // 声音设置
  soundEnabled: boolean;
}

/**
 * 报警过滤
 */
export interface AlertFilters {
  types?: AlertType[];
  severities?: AlertSeverity[];
  statuses?: AlertStatus[];
  sourceIds?: string[];
  search?: string;
  startDate?: number;
  endDate?: number;
}

/**
 * 报警统计
 */
export interface AlertStats {
  total: number;
  bySeverity: Record<AlertSeverity, number>;
  byStatus: Record<AlertStatus, number>;
  byType: Record<AlertType, number>;
  unacknowledged: number;
  averageResolutionTime: number;
  resolutionRate: number;
}

/**
 * 报警操作
 */
export interface AlertActions {
  // CRUD 操作
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  removeAlert: (id: string) => void;
  
  // 选择
  selectAlert: (id: string | null) => void;
  
  // 状态更新
  acknowledgeAlert: (id: string, userId: string) => void;
  resolveAlert: (id: string, userId: string, resolution?: string) => void;
  snoozeAlert: (id: string, duration: number) => void;
  
  // 过滤
  setFilters: (filters: Partial<AlertFilters>) => void;
  clearFilters: () => void;
  
  // 分页
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  
  // 加载状态
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // 声音设置
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  
  // 统计更新
  updateStats: (stats: Partial<AlertStats>) => void;
  
  // 批量操作
  batchAcknowledge: (ids: string[], userId: string) => void;
  batchResolve: (ids: string[], userId: string, resolution?: string) => void;
  
  // 重置
  reset: () => void;
}

/**
 * 初始统计
 */
const initialStats: AlertStats = {
  total: 0,
  bySeverity: {
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
  },
  byStatus: {
    active: 0,
    acknowledged: 0,
    resolved: 0,
    escalated: 0,
    snoozed: 0,
  },
  byType: {
    system: 0,
    trading: 0,
    risk: 0,
    performance: 0,
    strategy: 0,
    container: 0,
    data: 0,
    execution: 0,
    security: 0,
  },
  unacknowledged: 0,
  averageResolutionTime: 0,
  resolutionRate: 0,
};

/**
 * 创建 Store
 */
export const useAlertStore = create<AlertState & AlertActions>()(
  (set, get) => ({
    // 初始状态
    alerts: [],
    selectedAlertId: null,
    unreadAlerts: [],
    activeAlerts: [],
    resolvedAlerts: [],
    isLoading: false,
    isRefreshing: false,
    page: 1,
    pageSize: 20,
    total: 0,
    filters: {},
    stats: initialStats,
    soundEnabled: true,
    
    // CRUD 操作
    setAlerts: (alerts) => {
      const now = Date.now();
      const unreadAlerts = alerts.filter(a => 
        a.status === 'active' && !a.acknowledgedAt
      );
      const activeAlerts = alerts.filter(a => 
        ['active', 'acknowledged', 'snoozed', 'escalated'].includes(a.status)
      );
      const resolvedAlerts = alerts.filter(a => a.status === 'resolved');
      
      set({ alerts, unreadAlerts, activeAlerts, resolvedAlerts });
    },
    
    addAlert: (alert) => {
      const now = Date.now();
      const isActive = ['active', 'acknowledged', 'snoozed', 'escalated'].includes(alert.status);
      const isUnread = alert.status === 'active' && !alert.acknowledgedAt;
      
      set(state => ({
        alerts: [alert, ...state.alerts],
        unreadAlerts: isUnread ? [alert, ...state.unreadAlerts] : state.unreadAlerts,
        activeAlerts: isActive ? [alert, ...state.activeAlerts] : state.activeAlerts,
        resolvedAlerts: alert.status === 'resolved' 
          ? [alert, ...state.resolvedAlerts] 
          : state.resolvedAlerts,
      }));
    },
    
    updateAlert: (id, updates) => set(state => {
      const updateFn = (alerts: Alert[]) => 
        alerts.map(a => a.id === id ? { ...a, ...updates } : a);
      
      return {
        alerts: updateFn(state.alerts),
        unreadAlerts: updateFn(state.unreadAlerts),
        activeAlerts: updateFn(state.activeAlerts),
        resolvedAlerts: updateFn(state.resolvedAlerts),
      };
    }),
    
    removeAlert: (id) => set(state => ({
      alerts: state.alerts.filter(a => a.id !== id),
      unreadAlerts: state.unreadAlerts.filter(a => a.id !== id),
      activeAlerts: state.activeAlerts.filter(a => a.id !== id),
      resolvedAlerts: state.resolvedAlerts.filter(a => a.id !== id),
      selectedAlertId: state.selectedAlertId === id ? null : state.selectedAlertId,
    })),
    
    // 选择
    selectAlert: (id) => set({ selectedAlertId: id }),
    
    // 状态更新
    acknowledgeAlert: (id, userId) => set(state => {
      const now = Date.now();
      return {
        alerts: state.alerts.map(a => 
          a.id === id ? { ...a, status: 'acknowledged' as AlertStatus, acknowledgedAt: now, acknowledgedBy: userId } : a
        ),
        unreadAlerts: state.unreadAlerts.filter(a => a.id !== id),
      };
    }),
    
    resolveAlert: (id, userId, resolution) => set(state => {
      const now = Date.now();
      return {
        alerts: state.alerts.map(a => 
          a.id === id 
            ? { ...a, status: 'resolved' as AlertStatus, resolvedAt: now, resolvedBy: userId, resolution } 
            : a
        ),
        activeAlerts: state.activeAlerts.filter(a => a.id !== id),
        resolvedAlerts: [state.alerts.find(a => a.id === id)!, ...state.resolvedAlerts],
      };
    }),
    
    snoozeAlert: (id, duration) => set(state => {
      const now = Date.now();
      const snoozedUntil = now + duration;
      return {
        alerts: state.alerts.map(a => 
          a.id === id ? { ...a, status: 'snoozed' as AlertStatus, snoozedUntil } : a
        ),
      };
    }),
    
    // 过滤
    setFilters: (filters) => set(state => ({
      filters: { ...state.filters, ...filters },
      page: 1,
    })),
    clearFilters: () => set({ filters: {}, page: 1 }),
    
    // 分页
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    
    // 加载状态
    setLoading: (isLoading) => set({ isLoading }),
    setRefreshing: (isRefreshing) => set({ isRefreshing }),
    
    // 声音设置
    toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
    setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
    
    // 统计更新
    updateStats: (stats) => set(state => ({
      stats: { ...state.stats, ...stats },
    })),
    
    // 批量操作
    batchAcknowledge: (ids, userId) => set(state => {
      const now = Date.now();
      const acknowledgedIds = new Set(ids);
      
      return {
        alerts: state.alerts.map(a => 
          acknowledgedIds.has(a.id) 
            ? { ...a, status: 'acknowledged' as AlertStatus, acknowledgedAt: now, acknowledgedBy: userId }
            : a
        ),
        unreadAlerts: state.unreadAlerts.filter(a => !acknowledgedIds.has(a.id)),
      };
    }),
    
    batchResolve: (ids, userId, resolution) => set(state => {
      const now = Date.now();
      const resolvedIds = new Set(ids);
      const resolvedAlerts = state.activeAlerts.filter(a => resolvedIds.has(a.id));
      
      return {
        alerts: state.alerts.map(a => 
          resolvedIds.has(a.id) 
            ? { ...a, status: 'resolved' as AlertStatus, resolvedAt: now, resolvedBy: userId, resolution }
            : a
        ),
        activeAlerts: state.activeAlerts.filter(a => !resolvedIds.has(a.id)),
        resolvedAlerts: [...resolvedAlerts.map(a => ({
          ...a,
          status: 'resolved' as AlertStatus,
          resolvedAt: now,
          resolvedBy: userId,
          resolution,
        })), ...state.resolvedAlerts],
      };
    }),
    
    // 重置
    reset: () => set({
      alerts: [],
      selectedAlertId: null,
      unreadAlerts: [],
      activeAlerts: [],
      resolvedAlerts: [],
      isLoading: false,
      isRefreshing: false,
      page: 1,
      pageSize: 20,
      total: 0,
      filters: {},
      stats: initialStats,
      soundEnabled: true,
    }),
  })
);

// ============================================
// 选择器
// ============================================

export const useAlerts = () => useAlertStore(state => state.alerts);
export const useUnreadAlerts = () => useAlertStore(state => state.unreadAlerts);
export const useActiveAlerts = () => useAlertStore(state => state.activeAlerts);
export const useResolvedAlerts = () => useAlertStore(state => state.resolvedAlerts);
export const useSelectedAlert = () => useAlertStore(state =>
  state.alerts.find(a => a.id === state.selectedAlertId)
);
export const useAlertFilters = () => useAlertStore(state => state.filters);
export const useAlertStats = () => useAlertStore(state => state.stats);
export const useAlertPagination = () => useAlertStore(state => ({
  page: state.page,
  pageSize: state.pageSize,
  total: state.total,
}));
export const useSoundEnabled = () => useAlertStore(state => state.soundEnabled);

// 按严重级别获取报警
export const useAlertsBySeverity = (severity: AlertSeverity) => useAlertStore(state =>
  state.alerts.filter(a => a.severity === severity)
);

// 按类型获取报警
export const useAlertsByType = (type: AlertType) => useAlertStore(state =>
  state.alerts.filter(a => a.type === type)
);

// 关键报警
export const useCriticalAlerts = () => useAlertStore(state =>
  state.alerts.filter(a => a.severity === 'critical' && a.status === 'active')
);
