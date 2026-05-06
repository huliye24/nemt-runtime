/**
 * NEMT Platform - User Store
 * 用户状态管理
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Subscription } from '@/types';

/**
 * 用户相关状态
 */
export interface UserState {
  // 用户信息
  profile: User | null;
  
  // 订阅信息
  subscription: Subscription | null;
  
  // 偏好设置
  preferences: UserPreferences;
  
  // 加载状态
  isLoading: boolean;
  isInitialized: boolean;
}

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  // 主题
  theme: 'dark' | 'light' | 'system';
  colorTheme: 'default' | 'purple-deep' | 'purple-gray' | 'purple-bright';
  
  // 语言
  language: 'zh-CN' | 'en-US';
  
  // 通知
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
  };
  
  // 交易设置
  trading: {
    confirmOrders: boolean;
    showProfitLoss: boolean;
    defaultOrderType: 'market' | 'limit';
    defaultLeverage: number;
  };
  
  // 图表设置
  chart: {
    defaultInterval: string;
    showVolume: boolean;
    showGrid: boolean;
    defaultTheme: string;
  };
  
  // 性能设置
  performance: {
    enableAnimations: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
  };
}

/**
 * 用户操作
 */
export interface UserActions {
  // 设置用户
  setUser: (user: User | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  
  // 更新偏好
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateTheme: (theme: UserPreferences['theme']) => void;
  updateColorTheme: (colorTheme: UserPreferences['colorTheme']) => void;
  updateLanguage: (language: UserPreferences['language']) => void;
  
  // 通知设置
  updateNotificationSettings: (settings: Partial<UserPreferences['notifications']>) => void;
  
  // 交易设置
  updateTradingSettings: (settings: Partial<UserPreferences['trading']>) => void;
  
  // 图表设置
  updateChartSettings: (settings: Partial<UserPreferences['chart']>) => void;
  
  // 性能设置
  updatePerformanceSettings: (settings: Partial<UserPreferences['performance']>) => void;
  
  // 状态管理
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

/**
 * 默认偏好设置
 */
const defaultPreferences: UserPreferences = {
  theme: 'dark',
  colorTheme: 'purple-bright',
  language: 'zh-CN',
  notifications: {
    email: true,
    push: true,
    sms: false,
    desktop: true,
  },
  trading: {
    confirmOrders: true,
    showProfitLoss: true,
    defaultOrderType: 'limit',
    defaultLeverage: 1,
  },
  chart: {
    defaultInterval: '1h',
    showVolume: true,
    showGrid: true,
    defaultTheme: 'dark',
  },
  performance: {
    enableAnimations: true,
    autoRefresh: true,
    refreshInterval: 30,
  },
};

/**
 * 创建 Store
 */
export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      // 初始状态
      profile: null,
      subscription: null,
      preferences: defaultPreferences,
      isLoading: false,
      isInitialized: false,
      
      // 设置用户
      setUser: (user) => set({ profile: user }),
      
      setSubscription: (subscription) => set({ subscription }),
      
      // 更新偏好
      updatePreferences: (preferences) => set(state => ({
        preferences: { ...state.preferences, ...preferences },
      })),
      
      updateTheme: (theme) => set(state => ({
        preferences: { ...state.preferences, theme },
      })),
      
      updateColorTheme: (colorTheme) => set(state => ({
        preferences: { ...state.preferences, colorTheme },
      })),
      
      updateLanguage: (language) => set(state => ({
        preferences: { ...state.preferences, language },
      })),
      
      // 通知设置
      updateNotificationSettings: (settings) => set(state => ({
        preferences: {
          ...state.preferences,
          notifications: { ...state.preferences.notifications, ...settings },
        },
      })),
      
      // 交易设置
      updateTradingSettings: (settings) => set(state => ({
        preferences: {
          ...state.preferences,
          trading: { ...state.preferences.trading, ...settings },
        },
      })),
      
      // 图表设置
      updateChartSettings: (settings) => set(state => ({
        preferences: {
          ...state.preferences,
          chart: { ...state.preferences.chart, ...settings },
        },
      })),
      
      // 性能设置
      updatePerformanceSettings: (settings) => set(state => ({
        preferences: {
          ...state.preferences,
          performance: { ...state.preferences.performance, ...settings },
        },
      })),
      
      // 状态管理
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      
      reset: () => set({
        profile: null,
        subscription: null,
        preferences: defaultPreferences,
        isLoading: false,
        isInitialized: false,
      }),
    }),
    {
      name: 'nemt-user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        subscription: state.subscription,
        preferences: state.preferences,
      }),
    }
  )
);

// ============================================
// 选择器
// ============================================

export const useUserProfile = () => useUserStore(state => state.profile);
export const useUserSubscription = () => useUserStore(state => state.subscription);
export const useUserPreferences = () => useUserStore(state => state.preferences);
export const useUserTheme = () => useUserStore(state => state.preferences.theme);
export const useUserColorTheme = () => useUserStore(state => state.preferences.colorTheme);
export const useUserLanguage = () => useUserStore(state => state.preferences.language);
export const useUserTradingSettings = () => useUserStore(state => state.preferences.trading);
export const useUserChartSettings = () => useUserStore(state => state.preferences.chart);
export const useUserNotificationSettings = () => useUserStore(state => state.preferences.notifications);
export const useUserPerformanceSettings = () => useUserStore(state => state.preferences.performance);
