/**
 * NEMT Platform - Mock Backtest Results Data
 * 预设回测结果数据，包含权益曲线和交易记录
 */

import type { BacktestResult, BacktestTrade, BacktestConfig } from '../stores/backtestStore';

// 市场行情类型
export type MarketCondition = 'bull' | 'bear' | 'volatile' | 'stable' | 'crash';

// 简化版回测配置（用于 Mock 数据）
export interface MockBacktestConfig {
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
}

// 预设场景元数据
export interface BacktestScenarioMeta {
  id: string;
  name: string;
  description: string;
  marketCondition: MarketCondition;
  icon: string;
  color: string;
}

// 生成权益曲线数据
function generateEquityCurve(
  startDate: string,
  endDate: string,
  initialCapital: number,
  curveType: 'stable' | 'aggressive' | 'conservative' | 'volatile' | 'bull' | 'bear' | 'crash'
): { date: string; value: number }[] {
  const curve: { date: string; value: number }[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));

  let value = initialCapital;
  const configs: Record<string, { drift: number; volatility: number; trend: number }> = {
    stable: { drift: 0.0012, volatility: 0.015, trend: 0.6 },
    aggressive: { drift: 0.0025, volatility: 0.035, trend: 0.65 },
    conservative: { drift: 0.0007, volatility: 0.008, trend: 0.5 },
    volatile: { drift: 0.001, volatility: 0.025, trend: 0.55 },
    // 牛市：强趋势上涨
    bull: { drift: 0.0028, volatility: 0.02, trend: 0.75 },
    // 熊市：震荡下跌
    bear: { drift: -0.0015, volatility: 0.022, trend: 0.6 },
    // 暴跌：快速下跌后反弹
    crash: { drift: -0.001, volatility: 0.04, trend: 0.4 },
  };

  const cfg = configs[curveType] || configs.stable;

  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);

    // 使用几何布朗运动模型
    const random = (Math.random() - 0.5) * 2;
    const change = cfg.drift + cfg.volatility * random * cfg.trend;

    // 添加周期性波动
    const cycleEffect = Math.sin((i / 30) * Math.PI * 2) * 0.005;

    value *= (1 + change + cycleEffect);

    // 确保不会低于初始资本的50%
    value = Math.max(value, initialCapital * 0.5);

    curve.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
    });
  }

  return curve;
}

// 生成交易记录
function generateTrades(
  equityCurve: { date: string; value: number }[],
  totalTrades: number,
  winRate: number
): BacktestTrade[] {
  const trades: BacktestTrade[] = [];
  const startIndex = Math.floor(equityCurve.length * 0.1);
  const endIndex = Math.floor(equityCurve.length * 0.9);
  const range = endIndex - startIndex;

  let pnl = 0;
  let wins = 0;

  for (let i = 0; i < totalTrades; i++) {
    const idx = startIndex + Math.floor((i / totalTrades) * range);
    const point = equityCurve[Math.min(idx, equityCurve.length - 1)];
    const isWin = wins / (i + 1) < winRate;
    const tradePnl = isWin
      ? Math.random() * 500 + 100
      : -(Math.random() * 300 + 50);
    pnl += tradePnl;

    trades.push({
      id: `trade_${i}`,
      date: point.date,
      type: tradePnl >= 0 ? 'buy' : 'sell',
      price: 45000 + Math.random() * 20000,
      quantity: Math.random() * 2 + 0.1,
      pnl: Math.round(tradePnl * 100) / 100,
    });
  }

  return trades;
}

// 计算回测指标
function calculateMetrics(equityCurve: { date: string; value: number }[], trades: BacktestTrade[]) {
  const startValue = equityCurve[0].value;
  const endValue = equityCurve[equityCurve.length - 1].value;
  const totalReturn = ((endValue - startValue) / startValue) * 100;

  // 计算最大回撤
  let maxDrawdown = 0;
  let peak = startValue;
  for (const point of equityCurve) {
    if (point.value > peak) peak = point.value;
    const drawdown = ((peak - point.value) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  // 计算夏普比率
  const returns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    returns.push((equityCurve[i].value - equityCurve[i - 1].value) / equityCurve[i - 1].value);
  }
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdReturn = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  );
  const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(252) : 0;

  // 计算胜率
  const winningTrades = trades.filter(t => t.pnl > 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

  return {
    totalReturn: Math.round(totalReturn * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    winRate: Math.round(winRate * 100) / 100,
    totalTrades: trades.length,
    profitableTrades: winningTrades.length,
  };
}

export interface MockBacktestResult {
  id: string;
  strategyId: string;
  strategyName: string;
  config: MockBacktestConfig;
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    profitableTrades: number;
  };
  equityCurve: { date: string; value: number }[];
  trades: BacktestTrade[];
  status: 'completed' | 'running' | 'failed';
  completedAt: number;
}

// 预设回测结果
const startDate = '2024-01-01';
const endDate = '2024-12-31';
const initialCapital = 10000;

export const MOCK_BACKTEST_RESULTS: MockBacktestResult[] = [
  // 1. BTC 稳定增长型 - 年化 45%
  (() => {
    const equityCurve = generateEquityCurve(startDate, endDate, initialCapital, 'stable');
    const trades = generateTrades(equityCurve, 45, 0.65);
    const metrics = calculateMetrics(equityCurve, trades);
    return {
      id: 'backtest_btc_stable',
      strategyId: 'mkt_2',
      strategyName: '趋势猎手 Pro',
      config: {
        symbol: 'BTC/USDT',
        startDate,
        endDate,
        initialCapital,
        commission: 0.1,
      },
      metrics,
      equityCurve,
      trades,
      status: 'completed' as const,
      completedAt: Date.now() - 86400000 * 5,
    };
  })(),

  // 2. ETH 高收益型 - 年化 120%
  (() => {
    const equityCurve = generateEquityCurve(startDate, endDate, initialCapital, 'aggressive');
    const trades = generateTrades(equityCurve, 38, 0.58);
    const metrics = calculateMetrics(equityCurve, trades);
    return {
      id: 'backtest_eth_aggressive',
      strategyId: 'mkt_9',
      strategyName: '波动率突破策略',
      config: {
        symbol: 'ETH/USDT',
        startDate,
        endDate,
        initialCapital,
        commission: 0.1,
      },
      metrics,
      equityCurve,
      trades,
      status: 'completed' as const,
      completedAt: Date.now() - 86400000 * 3,
    };
  })(),

  // 3. SOL 低风险型 - 年化 25%
  (() => {
    const equityCurve = generateEquityCurve(startDate, endDate, initialCapital, 'conservative');
    const trades = generateTrades(equityCurve, 52, 0.72);
    const metrics = calculateMetrics(equityCurve, trades);
    return {
      id: 'backtest_sol_conservative',
      strategyId: 'mkt_6',
      strategyName: 'RSI 超卖策略',
      config: {
        symbol: 'SOL/USDT',
        startDate,
        endDate,
        initialCapital,
        commission: 0.1,
      },
      metrics,
      equityCurve,
      trades,
      status: 'completed' as const,
      completedAt: Date.now() - 86400000 * 2,
    };
  })(),

  // 4. BNB 震荡型 - 年化 35%
  (() => {
    const equityCurve = generateEquityCurve(startDate, endDate, initialCapital, 'volatile');
    const trades = generateTrades(equityCurve, 67, 0.55);
    const metrics = calculateMetrics(equityCurve, trades);
    return {
      id: 'backtest_bnb_volatile',
      strategyId: 'mkt_1',
      strategyName: '智能网格 v3.0',
      config: {
        symbol: 'BNB/USDT',
        startDate,
        endDate,
        initialCapital,
        commission: 0.1,
      },
      metrics,
      equityCurve,
      trades,
      status: 'completed' as const,
      completedAt: Date.now() - 86400000,
    };
  })(),

  // 5. 组合回测 - BTC+ETH
  (() => {
    const equityCurve = generateEquityCurve(startDate, endDate, initialCapital * 2, 'stable');
    const trades = generateTrades(equityCurve, 89, 0.68);
    const metrics = calculateMetrics(equityCurve, trades);
    return {
      id: 'backtest_portfolio',
      strategyId: 'mkt_10',
      strategyName: '做市商对冲策略',
      config: {
        symbol: 'BTC+ETH/USDT',
        startDate,
        endDate,
        initialCapital: initialCapital * 2,
        commission: 0.1,
      },
      metrics,
      equityCurve,
      trades,
      status: 'completed' as const,
      completedAt: Date.now() - 86400000 * 7,
    };
  })(),

  // 6. 跨品种回测
  (() => {
    const equityCurve = generateEquityCurve(startDate, endDate, initialCapital, 'aggressive');
    const trades = generateTrades(equityCurve, 112, 0.62);
    const metrics = calculateMetrics(equityCurve, trades);
    return {
      id: 'backtest_cross',
      strategyId: 'mkt_3',
      strategyName: '跨所套利机器人',
      config: {
        symbol: 'BTC/USDT',
        startDate,
        endDate,
        initialCapital,
        commission: 0.05,
      },
      metrics,
      equityCurve,
      trades,
      status: 'completed' as const,
      completedAt: Date.now() - 86400000 * 10,
    };
  })(),
];

// ============ 新增：预设回测场景 ============

// 预设场景元数据
export const BACKTEST_SCENARIOS: BacktestScenarioMeta[] = [
  { id: 'scenario_bull', name: '牛市趋势型', description: '2024年2-3月BTC强势上涨行情', marketCondition: 'bull', icon: '📈', color: '#22c55e' },
  { id: 'scenario_bear', name: '熊市反弹型', description: '2024年4-5月ETH震荡下跌行情', marketCondition: 'bear', icon: '📉', color: '#f97316' },
  { id: 'scenario_volatile', name: '震荡行情型', description: '2024年3-4月SOL区间震荡行情', marketCondition: 'volatile', icon: '📊', color: '#a855f7' },
  { id: 'scenario_crash', name: '暴跌行情型', description: '2024年1-2月BTC急跌行情', marketCondition: 'crash', icon: '⚡', color: '#ef4444' },
  { id: 'scenario_stable', name: '稳健增长型', description: '2024年全年BTC稳定增长', marketCondition: 'stable', icon: '🛡️', color: '#3b82f6' },
  { id: 'scenario_newbie', name: '新手体验型', description: '2024上半年综合行情体验', marketCondition: 'stable', icon: '🎯', color: '#06b6d4' },
  { id: 'scenario_portfolio', name: '组合策略型', description: 'BTC+ETH+SOL组合配置', marketCondition: 'stable', icon: '💼', color: '#eab308' },
  { id: 'scenario_highvol', name: '高波动型', description: 'BNB高波动突破行情', marketCondition: 'volatile', icon: '🔥', color: '#ec4899' },
];

// 生成新增预设场景的回测结果
const SCENARIO_CONFIG = {
  scenario_bull: { symbol: 'BTC/USDT', strategyId: 'mkt_2', strategyName: '趋势猎手 Pro', curveType: 'bull' as const, trades: 52, winRate: 0.68, startDate: '2024-02-01', endDate: '2024-03-31' },
  scenario_bear: { symbol: 'ETH/USDT', strategyId: 'mkt_9', strategyName: '波动率突破策略', curveType: 'bear' as const, trades: 38, winRate: 0.55, startDate: '2024-04-01', endDate: '2024-05-31' },
  scenario_volatile: { symbol: 'SOL/USDT', strategyId: 'mkt_1', strategyName: '智能网格 v3.0', curveType: 'volatile' as const, trades: 78, winRate: 0.72, startDate: '2024-03-01', endDate: '2024-04-30' },
  scenario_crash: { symbol: 'BTC/USDT', strategyId: 'mkt_10', strategyName: '做市商对冲策略', curveType: 'crash' as const, trades: 25, winRate: 0.45, startDate: '2024-01-01', endDate: '2024-02-29' },
  scenario_stable: { symbol: 'BTC/USDT', strategyId: 'mkt_2', strategyName: '趋势猎手 Pro', curveType: 'stable' as const, trades: 45, winRate: 0.65, startDate: '2024-01-01', endDate: '2024-06-30' },
  scenario_newbie: { symbol: 'BTC/USDT', strategyId: 'mkt_7', strategyName: '双均线趋势策略', curveType: 'stable' as const, trades: 35, winRate: 0.62, startDate: '2024-01-01', endDate: '2024-06-30' },
  scenario_portfolio: { symbol: 'BTC+ETH+SOL', strategyId: 'mkt_10', strategyName: '做市商对冲策略', curveType: 'stable' as const, trades: 65, winRate: 0.68, startDate: '2024-01-01', endDate: '2024-06-30' },
  scenario_highvol: { symbol: 'BNB/USDT', strategyId: 'mkt_9', strategyName: '波动率突破策略', curveType: 'aggressive' as const, trades: 58, winRate: 0.58, startDate: '2024-05-01', endDate: '2024-06-30' },
};

export const PRESET_SCENARIO_RESULTS: MockBacktestResult[] = Object.entries(SCENARIO_CONFIG).map(([scenarioId, cfg]) => {
  const equityCurve = generateEquityCurve(cfg.startDate, cfg.endDate, initialCapital, cfg.curveType);
  const trades = generateTrades(equityCurve, cfg.trades, cfg.winRate);
  const metrics = calculateMetrics(equityCurve, trades);
  
  return {
    id: `${scenarioId}_result`,
    strategyId: cfg.strategyId,
    strategyName: cfg.strategyName,
    config: {
      symbol: cfg.symbol,
      startDate: cfg.startDate,
      endDate: cfg.endDate,
      initialCapital,
      commission: 0.1,
    },
    metrics,
    equityCurve,
    trades,
    status: 'completed' as const,
    completedAt: Date.now() - Math.floor(Math.random() * 86400000 * 10),
  };
});

// 合并所有预设结果
export const ALL_PRESET_RESULTS = [...MOCK_BACKTEST_RESULTS, ...PRESET_SCENARIO_RESULTS];

// 辅助函数
export function getBacktestById(id: string): MockBacktestResult | undefined {
  return MOCK_BACKTEST_RESULTS.find(b => b.id === id);
}

export function getBacktestsByStrategy(strategyId: string): MockBacktestResult[] {
  return MOCK_BACKTEST_RESULTS.filter(b => b.strategyId === strategyId);
}

export function getTopPerformers(limit: number = 3): MockBacktestResult[] {
  return [...MOCK_BACKTEST_RESULTS]
    .sort((a, b) => b.metrics.totalReturn - a.metrics.totalReturn)
    .slice(0, limit);
}

export function getLowestDrawdown(limit: number = 3): MockBacktestResult[] {
  return [...MOCK_BACKTEST_RESULTS]
    .sort((a, b) => a.metrics.maxDrawdown - b.metrics.maxDrawdown)
    .slice(0, limit);
}

// ============ 场景查询函数 ============

export function getScenarioById(id: string): BacktestScenarioMeta | undefined {
  return BACKTEST_SCENARIOS.find(s => s.id === id);
}

export function getScenarioResult(scenarioId: string): MockBacktestResult | undefined {
  return PRESET_SCENARIO_RESULTS.find(r => r.id === `${scenarioId}_result`);
}

export function getScenariosByCondition(condition: MarketCondition): BacktestScenarioMeta[] {
  return BACKTEST_SCENARIOS.filter(s => s.marketCondition === condition);
}

export function getScenarioWithResult(scenarioId: string): { meta: BacktestScenarioMeta; result: MockBacktestResult } | undefined {
  const meta = getScenarioById(scenarioId);
  const result = getScenarioResult(scenarioId);
  if (meta && result) {
    return { meta, result };
  }
  return undefined;
}

export function getAllScenariosWithResults(): { meta: BacktestScenarioMeta; result: MockBacktestResult }[] {
  return BACKTEST_SCENARIOS.map(meta => ({
    meta,
    result: PRESET_SCENARIO_RESULTS.find(r => r.id === `${meta.id}_result`)!,
  })).filter(s => s.result);
}

// 导出权益曲线生成器供外部使用
export { generateEquityCurve, generateTrades, calculateMetrics };
