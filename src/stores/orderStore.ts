/**
 * NEMT Platform - Order Store
 * 订单状态管理
 */

import { create } from 'zustand';
import type { Order, OrderStatus, QueryOrderParams } from '@/types';

/**
 * 订单状态
 */
export interface OrderState {
  // 订单列表
  orders: Order[];
  
  // 当前选中的订单
  selectedOrderId: string | null;
  
  // 活跃订单（未完全成交或未取消）
  activeOrders: Order[];
  
  // 历史订单
  historicalOrders: Order[];
  
  // 加载状态
  isLoading: boolean;
  isRefreshing: boolean;
  
  // 分页
  page: number;
  pageSize: number;
  total: number;
  
  // 过滤条件
  filters: Partial<QueryOrderParams>;
  
  // 统计
  stats: OrderStats;
}

/**
 * 订单统计
 */
export interface OrderStats {
  totalOrders: number;
  openOrders: number;
  filledOrders: number;
  cancelledOrders: number;
  rejectedOrders: number;
  totalFilledQuantity: number;
  totalCommission: number;
  averageExecutionTime: number;
}

/**
 * 订单操作
 */
export interface OrderActions {
  // CRUD 操作
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  removeOrder: (id: string) => void;
  
  // 选择
  selectOrder: (id: string | null) => void;
  
  // 状态更新
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  
  // 过滤
  setFilters: (filters: Partial<QueryOrderParams>) => void;
  clearFilters: () => void;
  
  // 分页
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  
  // 加载状态
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // 统计更新
  updateStats: (stats: Partial<OrderStats>) => void;
  
  // 批量操作
  batchUpdateStatus: (ids: string[], status: OrderStatus) => void;
  
  // 重置
  reset: () => void;
}

/**
 * 初始统计
 */
const initialStats: OrderStats = {
  totalOrders: 0,
  openOrders: 0,
  filledOrders: 0,
  cancelledOrders: 0,
  rejectedOrders: 0,
  totalFilledQuantity: 0,
  totalCommission: 0,
  averageExecutionTime: 0,
};

/**
 * 创建 Store
 */
export const useOrderStore = create<OrderState & OrderActions>()(
  (set, get) => ({
    // 初始状态
    orders: [],
    selectedOrderId: null,
    activeOrders: [],
    historicalOrders: [],
    isLoading: false,
    isRefreshing: false,
    page: 1,
    pageSize: 20,
    total: 0,
    filters: {},
    stats: initialStats,
    
    // CRUD 操作
    setOrders: (orders) => {
      const activeOrders = orders.filter(o => 
        !['filled', 'cancelled', 'rejected', 'expired'].includes(o.status)
      );
      const historicalOrders = orders.filter(o => 
        ['filled', 'cancelled', 'rejected', 'expired'].includes(o.status)
      );
      
      set({ orders, activeOrders, historicalOrders });
    },
    
    addOrder: (order) => set(state => ({
      orders: [order, ...state.orders],
      activeOrders: !['filled', 'cancelled', 'rejected', 'expired'].includes(order.status)
        ? [order, ...state.activeOrders]
        : state.activeOrders,
    })),
    
    updateOrder: (id, updates) => set(state => {
      const updateFn = (orders: Order[]) => 
        orders.map(o => o.id === id ? { ...o, ...updates } : o);
      
      return {
        orders: updateFn(state.orders),
        activeOrders: updateFn(state.activeOrders),
        historicalOrders: updateFn(state.historicalOrders),
      };
    }),
    
    removeOrder: (id) => set(state => ({
      orders: state.orders.filter(o => o.id !== id),
      activeOrders: state.activeOrders.filter(o => o.id !== id),
      historicalOrders: state.historicalOrders.filter(o => o.id !== id),
      selectedOrderId: state.selectedOrderId === id ? null : state.selectedOrderId,
    })),
    
    // 选择
    selectOrder: (id) => set({ selectedOrderId: id }),
    
    // 状态更新
    updateOrderStatus: (id, status) => {
      const order = get().orders.find(o => o.id === id);
      if (!order) return;
      
      // 根据新状态移动订单
      const now = Date.now();
      const updatedOrder = { ...order, status, updatedAt: now };
      
      if (['filled', 'cancelled', 'rejected', 'expired'].includes(status)) {
        set(state => ({
          orders: state.orders.map(o => o.id === id ? updatedOrder : o),
          activeOrders: state.activeOrders.filter(o => o.id !== id),
          historicalOrders: [updatedOrder, ...state.historicalOrders],
        }));
      } else {
        set(state => ({
          orders: state.orders.map(o => o.id === id ? updatedOrder : o),
          activeOrders: [updatedOrder, ...state.activeOrders.filter(o => o.id !== id)],
          historicalOrders: state.historicalOrders.filter(o => o.id !== id),
        }));
      }
    },
    
    // 过滤
    setFilters: (filters) => set({ filters, page: 1 }),
    clearFilters: () => set({ filters: {}, page: 1 }),
    
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
      const updatedOrders = state.orders.map(o => 
        ids.includes(o.id) ? { ...o, status, updatedAt: now } : o
      );
      
      const activeOrders = updatedOrders.filter(o => 
        !['filled', 'cancelled', 'rejected', 'expired'].includes(o.status)
      );
      const historicalOrders = updatedOrders.filter(o => 
        ['filled', 'cancelled', 'rejected', 'expired'].includes(o.status)
      );
      
      return { orders: updatedOrders, activeOrders, historicalOrders };
    }),
    
    // 重置
    reset: () => set({
      orders: [],
      selectedOrderId: null,
      activeOrders: [],
      historicalOrders: [],
      isLoading: false,
      isRefreshing: false,
      page: 1,
      pageSize: 20,
      total: 0,
      filters: {},
      stats: initialStats,
    }),
  })
);

// ============================================
// 选择器
// ============================================

export const useOrders = () => useOrderStore(state => state.orders);
export const useActiveOrders = () => useOrderStore(state => state.activeOrders);
export const useHistoricalOrders = () => useOrderStore(state => state.historicalOrders);
export const useSelectedOrder = () => useOrderStore(state => 
  state.orders.find(o => o.id === state.selectedOrderId)
);
export const useOrderFilters = () => useOrderStore(state => state.filters);
export const useOrderStats = () => useOrderStore(state => state.stats);
export const useOrderPagination = () => useOrderStore(state => ({
  page: state.page,
  pageSize: state.pageSize,
  total: state.total,
}));

// 按状态获取订单
export const useOrdersByStatus = (status: OrderStatus) => useOrderStore(state =>
  state.orders.filter(o => o.status === status)
);

// 按交易对获取订单
export const useOrdersBySymbol = (symbol: string) => useOrderStore(state =>
  state.orders.filter(o => o.symbol === symbol)
);
