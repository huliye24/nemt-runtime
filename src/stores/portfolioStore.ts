/**
 * NEMT Platform - Portfolio Store
 *
 * Manages Portfolio Manager state
 * Portfolio Manager automatically allocates capital to strategies based on their performance
 */

import { create } from 'zustand';
import {
  PortfolioData,
  PortfolioConfig,
  StrategyPerformance,
  AllocationResult,
  MarketPortfolio,
  DEFAULT_PORTFOLIO_CONFIG,
} from '../types/portfolio';

interface PortfolioState {
  portfolios: PortfolioData[];
  selectedPortfolioId: string | null;
  marketPortfolios: MarketPortfolio[];
  performanceHistory: Record<string, StrategyPerformance[]>;
  lastRecalculation: Date | null;
  isRecalculating: boolean;
}

interface PortfolioActions {
  // CRUD
  addPortfolio: (portfolio: PortfolioData) => void;
  updatePortfolio: (id: string, updates: Partial<PortfolioData>) => void;
  deletePortfolio: (id: string) => void;
  selectPortfolio: (id: string | null) => void;

  // Market
  publishPortfolio: (portfolio: PortfolioData, marketPortfolio: MarketPortfolio) => void;
  setMarketPortfolios: (portfolios: MarketPortfolio[]) => void;
  purchasePortfolio: (marketPortfolio: MarketPortfolio) => PortfolioData;

  // Capital Management
  setTotalCapital: (id: string, capital: number) => void;
  
  // Performance & Scoring
  updateStrategyPerformance: (strategyId: string, perf: StrategyPerformance) => void;
  getStrategyPerformance: (strategyId: string, period: string) => StrategyPerformance[];
  
  // Allocation
  recalculateAllocations: (strategyPerformances: StrategyPerformance[]) => void;
  executeReallocation: () => void;
  getCurrentAllocations: () => AllocationResult[];
  getSelectedPortfolio: () => PortfolioData | null;
}

export const usePortfolioStore = create<PortfolioState & PortfolioActions>()(
  (set, get) => ({
    portfolios: getDefaultPortfolios(),
    selectedPortfolioId: 'portfolio_default_aggressive',
    marketPortfolios: [],
    performanceHistory: {},
    lastRecalculation: null,
    isRecalculating: false,

    // CRUD Operations
    addPortfolio: (portfolio) => set((state) => ({
      portfolios: [...state.portfolios, portfolio],
    })),

    updatePortfolio: (id, updates) => set((state) => ({
      portfolios: state.portfolios.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
    })),

    deletePortfolio: (id) => set((state) => ({
      portfolios: state.portfolios.filter((p) => p.id !== id),
      selectedPortfolioId: state.selectedPortfolioId === id ? null : state.selectedPortfolioId,
    })),

    selectPortfolio: (id) => set({ selectedPortfolioId: id }),

    // Market Operations
    publishPortfolio: (portfolio, marketPortfolio) => set((state) => ({
      marketPortfolios: [marketPortfolio, ...state.marketPortfolios],
      portfolios: state.portfolios.map((p) =>
        p.id === portfolio.id ? { ...p, status: 'active' as const } : p
      ),
    })),

    setMarketPortfolios: (portfolios) => set({ marketPortfolios: portfolios }),

    purchasePortfolio: (marketPortfolio) => {
      const newPortfolio: PortfolioData = {
        id: `portfolio_${Date.now()}`,
        name: marketPortfolio.name,
        description: marketPortfolio.description,
        author: marketPortfolio.author,
        config: marketPortfolio.config,
        status: 'active',
        totalCapital: 10000,
        allocations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      get().addPortfolio(newPortfolio);
      return newPortfolio;
    },

    // Capital Management
    setTotalCapital: (id, capital) => set((state) => ({
      portfolios: state.portfolios.map((p) =>
        p.id === id ? { ...p, totalCapital: capital, updatedAt: new Date() } : p
      ),
    })),

    // Performance Tracking
    updateStrategyPerformance: (strategyId, perf) => set((state) => {
      const existing = state.performanceHistory[strategyId] || [];
      return {
        performanceHistory: {
          ...state.performanceHistory,
          [strategyId]: [...existing, perf],
        },
      };
    }),

    getStrategyPerformance: (strategyId, period) => {
      const history = get().performanceHistory[strategyId] || [];
      const now = new Date();
      const cutoff = new Date();

      switch (period) {
        case '1d':
          cutoff.setDate(now.getDate() - 1);
          break;
        case '7d':
          cutoff.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoff.setDate(now.getDate() - 30);
          break;
        default:
          return history;
      }

      return history.filter((p) => p.periodEnd && new Date(p.periodEnd) >= cutoff);
    },

    // Allocation Calculation
    recalculateAllocations: (strategyPerformances) => {
      const portfolio = get().getSelectedPortfolio();
      if (!portfolio) return;

      set({ isRecalculating: true });

      const { scoring, rules } = portfolio.config;
      const scores = new Map<string, number>();

      // Calculate scores for each strategy
      strategyPerformances.forEach((perf) => {
        const score = calculateScore(perf, scoring.weights);
        scores.set(perf.strategyId, score);
      });

      // Normalize scores
      const totalScore = Array.from(scores.values()).reduce((a, b) => a + b, 0);
      if (totalScore === 0) {
        set({ isRecalculating: false });
        return;
      }

      // Calculate allocations
      const newAllocations: AllocationResult[] = Array.from(scores.entries()).map(
        ([strategyId, score]) => {
          const perf = strategyPerformances.find((p) => p.strategyId === strategyId);
          const percentage = (score / totalScore) * 100;
          const rawAllocation = (percentage / 100) * portfolio.totalCapital;

          // Apply allocation rules
          const minAlloc = portfolio.totalCapital * (rules.minAllocation / 100);
          const maxAlloc = portfolio.totalCapital * (rules.maxAllocation / 100);
          let allocation = Math.max(minAlloc, Math.min(maxAlloc, rawAllocation));

          // Apply stop loss rule
          if (perf && perf.returns < rules.stopLossPercent) {
            allocation = portfolio.totalCapital * (rules.minOnLoss / 100);
          }

          const previousAllocation = portfolio.allocations.find(
            (a) => a.strategyId === strategyId
          );
          const prevAlloc = previousAllocation?.allocation || 0;

          return {
            strategyId,
            strategyName: perf?.strategyName || strategyId,
            allocation,
            percentage: (allocation / portfolio.totalCapital) * 100,
            score,
            previousAllocation: prevAlloc,
            change: allocation - prevAlloc,
            reason: generateReason(perf, percentage, rules),
          };
        }
      );

      // Normalize allocations to match total capital
      const totalAllocated = newAllocations.reduce((sum, a) => sum + a.allocation, 0);
      const scaleFactor = portfolio.totalCapital / totalAllocated;

      const normalizedAllocations = newAllocations.map((a) => ({
        ...a,
        allocation: a.allocation * scaleFactor,
        percentage: a.percentage * scaleFactor,
      }));

      set((state) => ({
        portfolios: state.portfolios.map((p) =>
          p.id === portfolio.id
            ? { ...p, allocations: normalizedAllocations, updatedAt: new Date() }
            : p
        ),
        lastRecalculation: new Date(),
        isRecalculating: false,
      }));
    },

    executeReallocation: () => {
      // This would trigger actual fund movements
      // For now, just mark as executed
      console.log('Reallocation executed at', new Date());
    },

    getCurrentAllocations: () => {
      const portfolio = get().getSelectedPortfolio();
      return portfolio?.allocations || [];
    },

    getSelectedPortfolio: () => {
      const state = get();
      return state.portfolios.find((p) => p.id === state.selectedPortfolioId) || null;
    },
  })
);

// Helper functions
function calculateScore(
  perf: StrategyPerformance,
  weights: { return: number; sharpe: number; winRate: number; drawdown: number; stability: number }
): number {
  // Normalize metrics to 0-1 scale
  const normalizedReturn = Math.max(0, Math.min(1, perf.returns / 100)); // -100% to 100% -> 0 to 1
  const normalizedSharpe = Math.max(0, Math.min(1, perf.sharpeRatio / 3)); // 0 to 3 -> 0 to 1
  const normalizedWinRate = perf.winRate; // 0 to 1
  const normalizedDrawdown = Math.max(0, Math.min(1, 1 - perf.maxDrawdown / 50)); // 0-50% -> 1 to 0
  const normalizedStability = perf.consistency; // 0 to 1

  return (
    normalizedReturn * weights.return +
    normalizedSharpe * weights.sharpe +
    normalizedWinRate * weights.winRate +
    normalizedDrawdown * weights.drawdown +
    normalizedStability * weights.stability
  );
}

function generateReason(
  perf: StrategyPerformance | undefined,
  percentage: number,
  rules: { minAllocation: number; maxAllocation: number; stopLossPercent: number }
): string {
  if (!perf) return '新策略加入';

  if (perf.returns < rules.stopLossPercent) {
    return '触发止损规则';
  }

  if (percentage > rules.maxAllocation) {
    return '达到最大分配限制';
  }

  if (percentage < rules.minAllocation) {
    return '达到最小分配限制';
  }

  if (perf.returns > 10) {
    return '表现优秀，增加分配';
  }

  if (perf.returns < 0) {
    return '表现不佳，减少分配';
  }

  return '按评分自动调整';
}

// Selectors
export const usePortfolios = () => usePortfolioStore((state) => state.portfolios);
export const useSelectedPortfolioId = () => usePortfolioStore((state) => state.selectedPortfolioId);
export const useSelectedPortfolio = () => usePortfolioStore((state) => state.getSelectedPortfolio());
export const useMarketPortfolios = () => usePortfolioStore((state) => state.marketPortfolios);
export const useCurrentAllocations = () => usePortfolioStore((state) => state.getCurrentAllocations());
export const useIsRecalculating = () => usePortfolioStore((state) => state.isRecalculating);

// Default preset portfolios
function getDefaultPortfolios(): PortfolioData[] {
  return [
    {
      id: 'portfolio_default_aggressive',
      name: '激进型配置',
      description: '高收益追求型，重点关注收益率，激进调整仓位',
      author: '系统',
      config: {
        scoring: {
          period: '7d',
          weights: { return: 0.5, sharpe: 0.15, winRate: 0.1, drawdown: 0.15, stability: 0.1 },
          decayFactor: 0.7,
        },
        rules: { minAllocation: 0, maxAllocation: 60, stopLossPercent: -15, minOnLoss: 0 },
        frequency: 'daily',
        scoringCode: '',
      },
      status: 'active',
      totalCapital: 10000,
      allocations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'portfolio_default_conservative',
      name: '保守型配置',
      description: '稳健收益型，重视风险控制，回撤限制严格',
      author: '系统',
      config: {
        scoring: {
          period: '30d',
          weights: { return: 0.2, sharpe: 0.3, winRate: 0.15, drawdown: 0.3, stability: 0.05 },
          decayFactor: 0.9,
        },
        rules: { minAllocation: 5, maxAllocation: 30, stopLossPercent: -10, minOnLoss: 5 },
        frequency: 'hourly',
        scoringCode: '',
      },
      status: 'active',
      totalCapital: 10000,
      allocations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'portfolio_default_balanced',
      name: '平衡型配置',
      description: '均衡配置，各指标平衡考量',
      author: '系统',
      config: {
        scoring: {
          period: '7d',
          weights: { return: 0.25, sharpe: 0.25, winRate: 0.2, drawdown: 0.2, stability: 0.1 },
          decayFactor: 0.8,
        },
        rules: { minAllocation: 5, maxAllocation: 40, stopLossPercent: -15, minOnLoss: 2 },
        frequency: 'daily',
        scoringCode: '',
      },
      status: 'active',
      totalCapital: 10000,
      allocations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'portfolio_default_highfreq',
      name: '高频交易配置',
      description: '针对高频策略优化，实时响应，快速调整',
      author: '系统',
      config: {
        scoring: {
          period: '1d',
          weights: { return: 0.35, sharpe: 0.25, winRate: 0.25, drawdown: 0.1, stability: 0.05 },
          decayFactor: 0.6,
        },
        rules: { minAllocation: 2, maxAllocation: 50, stopLossPercent: -20, minOnLoss: 0 },
        frequency: 'realtime',
        scoringCode: '',
      },
      status: 'active',
      totalCapital: 10000,
      allocations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'portfolio_default_longterm',
      name: '长线投资配置',
      description: '注重长期稳定收益，减少频繁调整',
      author: '系统',
      config: {
        scoring: {
          period: 'all',
          weights: { return: 0.2, sharpe: 0.3, winRate: 0.1, drawdown: 0.25, stability: 0.15 },
          decayFactor: 0.95,
        },
        rules: { minAllocation: 10, maxAllocation: 35, stopLossPercent: -25, minOnLoss: 10 },
        frequency: 'daily',
        scoringCode: '',
      },
      status: 'active',
      totalCapital: 10000,
      allocations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}
