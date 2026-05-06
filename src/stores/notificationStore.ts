/**
 * NEMT Platform - Notification Store
 * 通知状态管理
 */

import { create } from 'zustand';
import type { NotificationChannel } from '@/types';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // 毫秒，0 表示不自动关闭
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

/**
 * Toast 通知状态
 */
export interface NotificationState {
  // 通知列表
  notifications: Notification[];
  
  // 通知数量
  unreadCount: number;
  
  // 历史通知
  history: Notification[];
  
  // 加载状态
  isLoading: boolean;
  
  // 设置
  settings: NotificationSettings;
}

/**
 * 通知设置
 */
export interface NotificationSettings {
  // 启用状态
  enabled: boolean;
  
  // 渠道
  channels: NotificationChannel[];
  
  // 声音
  soundEnabled: boolean;
  
  // 自动关闭
  autoClose: boolean;
  autoCloseDuration: number; // 毫秒
  
  // 位置
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  
  // 限制
  maxVisible: number;
  maxHistory: number;
}

/**
 * 通知操作
 */
export interface NotificationActions {
  // 添加通知
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  
  // 移除通知
  removeNotification: (id: string) => void;
  
  // 清空所有
  clearAll: () => void;
  
  // 标记已读
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  
  // 添加到历史
  addToHistory: (notification: Notification) => void;
  
  // 设置
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  
  // 预设方法
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  
  // 加载状态
  setLoading: (loading: boolean) => void;
  
  // 重置
  reset: () => void;
}

/**
 * 默认设置
 */
const defaultSettings: NotificationSettings = {
  enabled: true,
  channels: ['in_app'],
  soundEnabled: true,
  autoClose: true,
  autoCloseDuration: 5000,
  position: 'top-right',
  maxVisible: 5,
  maxHistory: 100,
};

/**
 * 创建 Store
 */
export const useNotificationStore = create<NotificationState & NotificationActions>()(
  (set, get) => ({
    // 初始状态
    notifications: [],
    unreadCount: 0,
    history: [],
    isLoading: false,
    settings: defaultSettings,
    
    // 添加通知
    addNotification: (notification) => {
      const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: Notification = {
        ...notification,
        id,
        createdAt: Date.now(),
        dismissible: notification.dismissible ?? true,
        duration: notification.duration ?? get().settings.autoCloseDuration,
      };
      
      set(state => {
        const maxVisible = state.settings.maxVisible;
        const newNotifications = [newNotification, ...state.notifications].slice(0, maxVisible);
        
        return {
          notifications: newNotifications,
          unreadCount: state.unreadCount + 1,
        };
      });
      
      // 自动关闭
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          get().removeNotification(id);
        }, newNotification.duration);
      }
      
      return id;
    },
    
    // 移除通知
    removeNotification: (id) => set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),
    
    // 清空所有
    clearAll: () => set(state => ({
      history: [...state.history, ...state.notifications]
        .slice(0, state.settings.maxHistory),
      notifications: [],
    })),
    
    // 标记已读
    markAsRead: (id) => set(state => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
    
    markAllAsRead: () => set({ unreadCount: 0 }),
    
    // 添加到历史
    addToHistory: (notification) => set(state => ({
      history: [notification, ...state.history].slice(0, state.settings.maxHistory),
    })),
    
    // 设置
    updateSettings: (settings) => set(state => ({
      settings: { ...state.settings, ...settings },
    })),
    
    // 预设方法
    success: (title, message) => get().addNotification({ type: 'success', title, message }),
    error: (title, message) => get().addNotification({ type: 'error', title, message, duration: 0 }),
    warning: (title, message) => get().addNotification({ type: 'warning', title, message }),
    info: (title, message) => get().addNotification({ type: 'info', title, message }),
    
    // 加载状态
    setLoading: (isLoading) => set({ isLoading }),
    
    // 重置
    reset: () => set({
      notifications: [],
      unreadCount: 0,
      history: [],
      isLoading: false,
      settings: defaultSettings,
    }),
  })
);

// ============================================
// 选择器
// ============================================

export const useNotifications = () => useNotificationStore(state => state.notifications);
export const useUnreadCount = () => useNotificationStore(state => state.unreadCount);
export const useNotificationHistory = () => useNotificationStore(state => state.history);
export const useNotificationSettings = () => useNotificationStore(state => state.settings);

// 获取特定类型的通知
export const useNotificationsByType = (type: NotificationType) => useNotificationStore(state =>
  state.notifications.filter(n => n.type === type)
);

// 获取最新通知
export const useLatestNotification = () => useNotificationStore(state =>
  state.notifications[0]
);
