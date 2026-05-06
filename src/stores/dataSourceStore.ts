/**
 * NEMT Platform - Data Source Store
 * 数据源状态管理
 */

import { create } from 'zustand';
import type { DataSource, DataSourceStatus, DataSourceStats } from '@/types';

/**
 * 数据源状态
 */
export interface DataSourceState {
  // 数据源列表
  dataSources: DataSource[];
  
  // 当前选中的数据源
  selectedDataSourceId: string | null;
  
  // 加载状态
  isLoading: boolean;
  isRefreshing: boolean;
  
  // 过滤条件
  filters: {
    type?: DataSource['type'];
    status?: DataSourceStatus;
    exchange?: string;
    search?: string;
  };
  
  // 统计数据
  stats: DataSourceStats;
}

/**
 * 数据源操作
 */
export interface DataSourceActions {
  // CRUD 操作
  setDataSources: (dataSources: DataSource[]) => void;
  addDataSource: (dataSource: DataSource) => void;
  updateDataSource: (id: string, updates: Partial<DataSource>) => void;
  removeDataSource: (id: string) => void;
  
  // 选择
  selectDataSource: (id: string | null) => void;
  
  // 状态更新
  updateDataSourceStatus: (id: string, status: DataSourceStatus) => void;
  
  // 统计更新
  updateStats: (id: string, stats: Partial<DataSourceStats>) => void;
  
  // 过滤
  setFilters: (filters: Partial<DataSourceState['filters']>) => void;
  clearFilters: () => void;
  
  // 加载状态
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // 批量操作
  batchEnable: (ids: string[]) => void;
  batchDisable: (ids: string[]) => void;
  batchDelete: (ids: string[]) => void;
  
  // 测试连接
  testConnection: (id: string) => Promise<boolean>;
  
  // 重置
  reset: () => void;
}

/**
 * 创建 Store
 */
export const useDataSourceStore = create<DataSourceState & DataSourceActions>()(
  (set, get) => ({
    // 初始状态
    dataSources: [],
    selectedDataSourceId: null,
    isLoading: false,
    isRefreshing: false,
    filters: {},
    stats: {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      lastLatency: 0,
      dataPointsReceived: 0,
      uptime: 0,
      downtime: 0,
    },
    
    // CRUD 操作
    setDataSources: (dataSources) => set({ dataSources }),
    
    addDataSource: (dataSource) => set(state => ({
      dataSources: [...state.dataSources, dataSource],
    })),
    
    updateDataSource: (id, updates) => set(state => ({
      dataSources: state.dataSources.map(ds => 
        ds.id === id ? { ...ds, ...updates, updatedAt: Date.now() } : ds
      ),
    })),
    
    removeDataSource: (id) => set(state => ({
      dataSources: state.dataSources.filter(ds => ds.id !== id),
      selectedDataSourceId: state.selectedDataSourceId === id ? null : state.selectedDataSourceId,
    })),
    
    // 选择
    selectDataSource: (id) => set({ selectedDataSourceId: id }),
    
    // 状态更新
    updateDataSourceStatus: (id, status) => set(state => ({
      dataSources: state.dataSources.map(ds => 
        ds.id === id ? { ...ds, status, lastConnectedAt: Date.now() } : ds
      ),
    })),
    
    // 统计更新
    updateStats: (id, stats) => set(state => ({
      dataSources: state.dataSources.map(ds => 
        ds.id === id ? { ...ds, stats: { ...ds.stats, ...stats } } : ds
      ),
    })),
    
    // 过滤
    setFilters: (filters) => set(state => ({
      filters: { ...state.filters, ...filters },
    })),
    clearFilters: () => set({ filters: {} }),
    
    // 加载状态
    setLoading: (isLoading) => set({ isLoading }),
    setRefreshing: (isRefreshing) => set({ isRefreshing }),
    
    // 批量操作
    batchEnable: (ids) => set(state => ({
      dataSources: state.dataSources.map(ds => 
        ids.includes(ds.id) ? { ...ds, enabled: true } : ds
      ),
    })),
    
    batchDisable: (ids) => set(state => ({
      dataSources: state.dataSources.map(ds => 
        ids.includes(ds.id) ? { ...ds, enabled: false } : ds
      ),
    })),
    
    batchDelete: (ids) => set(state => ({
      dataSources: state.dataSources.filter(ds => !ids.includes(ds.id)),
      selectedDataSourceId: 
        ids.includes(state.selectedDataSourceId || '') ? null : state.selectedDataSourceId,
    })),
    
    // 测试连接
    testConnection: async (id) => {
      const dataSource = get().dataSources.find(ds => ds.id === id);
      if (!dataSource) return false;
      
      set(state => ({
        dataSources: state.dataSources.map(ds => 
          ds.id === id ? { ...ds, status: 'connecting' } : ds
        ),
      }));
      
      try {
        // 模拟 API 测试
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 模拟 90% 成功率
        const success = Math.random() > 0.1;
        
        set(state => ({
          dataSources: state.dataSources.map(ds => 
            ds.id === id 
              ? { 
                  ...ds, 
                  status: success ? 'active' : 'error',
                  lastConnectedAt: success ? Date.now() : ds.lastConnectedAt,
                  lastError: success ? undefined : '连接超时',
                  errorCount: success ? 0 : ds.errorCount + 1,
                } 
              : ds
          ),
        }));
        
        return success;
      } catch (error) {
        set(state => ({
          dataSources: state.dataSources.map(ds => 
            ds.id === id 
              ? { ...ds, status: 'error', lastError: '连接失败' } 
              : ds
          ),
        }));
        return false;
      }
    },
    
    // 重置
    reset: () => set({
      dataSources: [],
      selectedDataSourceId: null,
      isLoading: false,
      isRefreshing: false,
      filters: {},
      stats: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageLatency: 0,
        lastLatency: 0,
        dataPointsReceived: 0,
        uptime: 0,
        downtime: 0,
      },
    }),
  })
);

// ============================================
// 选择器
// ============================================

export const useDataSources = () => useDataSourceStore(state => state.dataSources);
export const useSelectedDataSource = () => useDataSourceStore(state =>
  state.dataSources.find(ds => ds.id === state.selectedDataSourceId)
);
export const useDataSourceFilters = () => useDataSourceStore(state => state.filters);
export const useDataSourceStats = () => useDataSourceStore(state => state.stats);

// 按状态获取数据源
export const useDataSourcesByStatus = (status: DataSourceStatus) => useDataSourceStore(state =>
  state.dataSources.filter(ds => ds.status === status)
);

// 按类型获取数据源
export const useDataSourcesByType = (type: DataSource['type']) => useDataSourceStore(state =>
  state.dataSources.filter(ds => ds.type === type)
);

// 活跃的数据源
export const useActiveDataSources = () => useDataSourceStore(state =>
  state.dataSources.filter(ds => ds.status === 'active' && ds.enabled)
);

// 默认数据源
export const useDefaultDataSource = () => useDataSourceStore(state =>
  state.dataSources.find(ds => ds.isDefault)
);

// 过滤后的数据源
export const useFilteredDataSources = () => useDataSourceStore(state => {
  const { dataSources, filters } = state;
  
  return dataSources.filter(ds => {
    if (filters.type && ds.type !== filters.type) return false;
    if (filters.status && ds.status !== filters.status) return false;
    if (filters.exchange && ds.exchange !== filters.exchange) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!ds.name.toLowerCase().includes(search) && 
          !ds.description?.toLowerCase().includes(search)) {
        return false;
      }
    }
    return true;
  });
});
