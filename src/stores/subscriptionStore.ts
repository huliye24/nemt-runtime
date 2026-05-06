/**
 * NEMT Platform - Subscription Store
 * 订阅状态管理
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Subscription, SubscriptionPlan, SubscriptionUsage, SubscriptionLimits } from '@/types';
import { SUBSCRIPTION_PLANS } from '@/types';

type NumericSubscriptionLimitKey = {
  [K in keyof SubscriptionLimits]: SubscriptionLimits[K] extends number ? K : never;
}[keyof SubscriptionLimits];

const USAGE_TO_LIMIT_KEY: Record<keyof SubscriptionUsage, NumericSubscriptionLimitKey> = {
  strategies: 'maxStrategies',
  runningStrategies: 'maxStrategiesRunning',
  backtestsToday: 'maxBacktestsPerDay',
  dataStorage: 'maxDataStorage',
  apiCallsToday: 'maxApiCallsPerDay',
  portfolios: 'maxPortfolios',
  containers: 'maxContainers',
  teamMembers: 'maxTeamMembers',
};

/**
 * 订阅状态
 */
export interface SubscriptionState {
  // 当前订阅
  subscription: Subscription | null;
  
  // 加载状态
  isLoading: boolean;
  
  // 错误
  error: string | null;
  
  // 试用状态
  isTrialActive: boolean;
  trialDaysRemaining: number;
}

/**
 * 订阅操作
 */
export interface SubscriptionActions {
  // 设置订阅
  setSubscription: (subscription: Subscription | null) => void;
  
  // 更新使用量
  updateUsage: (usage: Partial<SubscriptionUsage>) => void;
  incrementUsage: (key: keyof SubscriptionUsage, amount?: number) => void;
  resetDailyUsage: () => void;
  
  // 检查限额
  checkLimit: (key: keyof SubscriptionLimits) => { allowed: boolean; message?: string };
  canUseFeature: (feature: string) => boolean;
  
  // 订阅操作
  upgradePlan: (plan: SubscriptionPlan) => Promise<void>;
  cancelSubscription: (reason?: string) => Promise<void>;
  renewSubscription: () => Promise<void>;
  
  // 试用
  startTrial: () => Promise<void>;
  endTrial: () => void;
  
  // 状态
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 重置
  reset: () => void;
}

/**
 * 创建 Store
 */
export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>()(
  persist(
    (set, get) => ({
      // 初始状态
      subscription: null,
      isLoading: false,
      error: null,
      isTrialActive: false,
      trialDaysRemaining: 0,
      
      // 设置订阅
      setSubscription: (subscription) => {
        set({ subscription });
        
        // 计算试用剩余天数
        if (subscription?.trialEndDate) {
          const remaining = Math.ceil(
            (subscription.trialEndDate - Date.now()) / (24 * 60 * 60 * 1000)
          );
          set({ 
            isTrialActive: remaining > 0, 
            trialDaysRemaining: Math.max(0, remaining) 
          });
        }
      },
      
      // 更新使用量
      updateUsage: (usage) => set(state => {
        if (!state.subscription) return state;
        
        return {
          subscription: {
            ...state.subscription,
            usage: { ...state.subscription.usage, ...usage },
          },
        };
      }),
      
      incrementUsage: (key, amount = 1) => set(state => {
        if (!state.subscription) return state;
        
        const current = state.subscription.usage[key];
        if (typeof current !== 'number') return state;
        
        return {
          subscription: {
            ...state.subscription,
            usage: { 
              ...state.subscription.usage, 
              [key]: current + amount 
            },
          },
        };
      }),
      
      resetDailyUsage: () => set(state => {
        if (!state.subscription) return state;
        
        return {
          subscription: {
            ...state.subscription,
            usage: {
              ...state.subscription.usage,
              backtestsToday: 0,
              apiCallsToday: 0,
            },
          },
        };
      }),
      
      // 检查限额
      checkLimit: (key) => {
        const subscription = get().subscription;
        if (!subscription) {
          // 未订阅用户，检查免费版限额
          const freeLimits = SUBSCRIPTION_PLANS.free.limits;
          const limitValue = freeLimits[key];
          if (typeof limitValue !== 'number') {
            return { allowed: Boolean(limitValue) };
          }
          if (limitValue === -1) return { allowed: true };
          
          const usage = getFreeUsage()[key];
          if (usage >= limitValue) {
            return { 
              allowed: false, 
              message: `已达到免费版限额，请升级套餐` 
            };
          }
          return { allowed: true };
        }
        
        const limits = subscription.limits;
        const limitValue = limits[key];
        if (typeof limitValue !== 'number') {
          return { allowed: Boolean(limitValue) };
        }
        
        // -1 表示无限制
        if (limitValue === -1) return { allowed: true };
        
        const usage = subscription.usage[key as keyof SubscriptionUsage];
        if (typeof usage !== 'number') return { allowed: true };
        
        if (usage >= limitValue) {
          return { 
            allowed: false, 
            message: `已达到限额 (${usage}/${limitValue})` 
          };
        }
        
        return { allowed: true };
      },
      
      canUseFeature: (feature) => {
        const subscription = get().subscription;
        
        // 功能映射
        const featureLimits: Record<string, keyof SubscriptionLimits> = {
          'cloudSync': 'allowCloudSync',
          'apiAccess': 'allowApiAccess',
          'customDataSources': 'allowCustomDataSources',
        };
        
        const limitKey = featureLimits[feature];
        if (!limitKey) return true;
        
        if (!subscription) {
          return SUBSCRIPTION_PLANS.free.limits[limitKey] === true;
        }
        
        return subscription.limits[limitKey] === true;
      },
      
      // 订阅操作
      upgradePlan: async (plan) => {
        set({ isLoading: true, error: null });
        
        try {
          // 模拟 API 调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const planDetails = SUBSCRIPTION_PLANS[plan];
          
          set(state => ({
            subscription: state.subscription 
              ? {
                  ...state.subscription,
                  plan,
                  status: 'active',
                  limits: planDetails.limits,
                  updatedAt: Date.now(),
                }
              : {
                  id: `sub_${Date.now()}`,
                  userId: 'current_user',
                  plan,
                  status: 'active',
                  startDate: Date.now(),
                  expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 天
                  autoRenew: true,
                  currentPeriodStart: Date.now(),
                  currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
                  usage: {
                    strategies: 0,
                    runningStrategies: 0,
                    backtestsToday: 0,
                    dataStorage: 0,
                    apiCallsToday: 0,
                    portfolios: 0,
                    containers: 0,
                    teamMembers: 1,
                  },
                  limits: planDetails.limits,
                },
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: '订阅升级失败，请重试' 
          });
        }
      },
      
      cancelSubscription: async (reason) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({
            subscription: state.subscription 
              ? {
                  ...state.subscription,
                  status: 'cancelled',
                  cancelledAt: Date.now(),
                  autoRenew: false,
                }
              : null,
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: '取消订阅失败，请重试' 
          });
        }
      },
      
      renewSubscription: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => {
            if (!state.subscription) return { isLoading: false };
            
            const newExpiryDate = state.subscription.expiryDate 
              ? state.subscription.expiryDate + 30 * 24 * 60 * 60 * 1000
              : Date.now() + 30 * 24 * 60 * 60 * 1000;
            
            return {
              subscription: {
                ...state.subscription,
                expiryDate: newExpiryDate,
                currentPeriodEnd: newExpiryDate,
                status: 'active',
              },
              isLoading: false,
            };
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: '续订失败，请重试' 
          });
        }
      },
      
      // 试用
      startTrial: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const trialEndDate = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 天试用
          
          set({
            subscription: {
              id: `sub_trial_${Date.now()}`,
              userId: 'current_user',
              plan: 'pro',
              status: 'trial',
              startDate: Date.now(),
              expiryDate: trialEndDate,
              trialEndDate,
              autoRenew: false,
              currentPeriodStart: Date.now(),
              currentPeriodEnd: trialEndDate,
              usage: {
                strategies: 0,
                runningStrategies: 0,
                backtestsToday: 0,
                dataStorage: 0,
                apiCallsToday: 0,
                portfolios: 0,
                containers: 0,
                teamMembers: 1,
              },
              limits: SUBSCRIPTION_PLANS.pro.limits,
            },
            isTrialActive: true,
            trialDaysRemaining: 7,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: '启动试用失败，请重试' 
          });
        }
      },
      
      endTrial: () => set({
        isTrialActive: false,
        trialDaysRemaining: 0,
      }),
      
      // 状态
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // 重置
      reset: () => set({
        subscription: null,
        isLoading: false,
        error: null,
        isTrialActive: false,
        trialDaysRemaining: 0,
      }),
    }),
    {
      name: 'nemt-subscription-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        subscription: state.subscription,
        isTrialActive: state.isTrialActive,
        trialDaysRemaining: state.trialDaysRemaining,
      }),
    }
  )
);

// ============================================
// 选择器
// ============================================

export const useSubscription = () => useSubscriptionStore(state => state.subscription);
export const useIsTrialActive = () => useSubscriptionStore(state => state.isTrialActive);
export const useTrialDaysRemaining = () => useSubscriptionStore(state => state.trialDaysRemaining);
export const useSubscriptionLoading = () => useSubscriptionStore(state => state.isLoading);
export const useSubscriptionError = () => useSubscriptionStore(state => state.error);

// 获取当前套餐详情
export const useCurrentPlanDetails = () => useSubscriptionStore(state => {
  if (!state.subscription) return SUBSCRIPTION_PLANS.free;
  return SUBSCRIPTION_PLANS[state.subscription.plan];
});

// 检查是否可以使用功能
export const useCanUseFeature = (feature: string) => {
  const canUse = useSubscriptionStore(state => state.canUseFeature(feature));
  return canUse;
};

// 获取剩余限额
export const useRemainingLimits = () => useSubscriptionStore(state => {
  const subscription = state.subscription;
  const freeLimits = SUBSCRIPTION_PLANS.free.limits;
  
  if (!subscription) {
    return Object.keys(getFreeUsage()).reduce((acc, key) => {
      const usageKey = key as keyof SubscriptionUsage;
      const limitKey = USAGE_TO_LIMIT_KEY[usageKey];
      const value = freeLimits[limitKey];
      acc[limitKey] = value === -1 ? Infinity : value;
      return acc;
    }, {} as Record<NumericSubscriptionLimitKey, number>);
  }
  
  return Object.keys(getFreeUsage()).reduce((acc, key) => {
    const usageKey = key as keyof SubscriptionUsage;
    const limitKey = USAGE_TO_LIMIT_KEY[usageKey];
    const limit = subscription.limits[limitKey];
    const usage = subscription.usage[usageKey];
    acc[limitKey] = limit === -1 ? Infinity : limit - (usage || 0);
    return acc;
  }, {} as Record<NumericSubscriptionLimitKey, number>);
});

// 辅助函数：获取免费版使用量
function getFreeUsage(): Record<string, number> {
  return {
    strategies: 0,
    runningStrategies: 0,
    backtestsToday: 0,
    dataStorage: 0,
    apiCallsToday: 0,
    portfolios: 0,
    containers: 0,
    teamMembers: 1,
  };
}
