/**
 * NEMT Platform - Mock Execution Data
 * 持仓、订单和实时信号数据
 */

// 持仓类型
export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  amount: number;
  pnl: number;
  pnlPercent: number;
  strategyId: string;
  strategyName: string;
  openTime: Date;
}

// 订单类型
export interface Order {
  id: string;
  time: Date;
  symbol: string;
  type: 'buy' | 'sell';
  side: 'long' | 'short';
  price: number;
  amount: number;
  filled: number;
  status: 'pending' | 'partial' | 'filled' | 'cancelled';
  strategyId: string;
  strategyName: string;
}

// 信号类型
export interface Signal {
  id: string;
  time: Date;
  type: 'buy' | 'sell' | 'hold';
  symbol: string;
  price: number;
  reason: string;
  strength: number;
  strategyId: string;
  strategyName: string;
}

// 初始持仓数据
export const INITIAL_POSITIONS: Position[] = [
  {
    id: 'pos_1',
    symbol: 'BTC/USDT',
    side: 'long',
    entryPrice: 62500,
    currentPrice: 67234,
    amount: 0.5,
    pnl: 2367,
    pnlPercent: 7.57,
    strategyId: 'strat_1',
    strategyName: '双均线策略',
    openTime: new Date(Date.now() - 3600000 * 24 * 3),
  },
  {
    id: 'pos_2',
    symbol: 'ETH/USDT',
    side: 'long',
    entryPrice: 3200,
    currentPrice: 3456,
    amount: 3.2,
    pnl: 819.2,
    pnlPercent: 8.0,
    strategyId: 'strat_2',
    strategyName: '趋势猎手 Pro',
    openTime: new Date(Date.now() - 3600000 * 24 * 5),
  },
  {
    id: 'pos_3',
    symbol: 'SOL/USDT',
    side: 'short',
    entryPrice: 145,
    currentPrice: 138,
    amount: 25,
    pnl: 175,
    pnlPercent: 4.83,
    strategyId: 'strat_3',
    strategyName: '网格套利策略',
    openTime: new Date(Date.now() - 3600000 * 24 * 2),
  },
  {
    id: 'pos_4',
    symbol: 'BNB/USDT',
    side: 'long',
    entryPrice: 580,
    currentPrice: 595,
    amount: 8,
    pnl: 120,
    pnlPercent: 2.59,
    strategyId: 'strat_4',
    strategyName: '布林带策略',
    openTime: new Date(Date.now() - 3600000 * 24 * 1),
  },
  {
    id: 'pos_5',
    symbol: 'XRP/USDT',
    side: 'long',
    entryPrice: 0.52,
    currentPrice: 0.48,
    amount: 5000,
    pnl: -200,
    pnlPercent: -7.69,
    strategyId: 'strat_5',
    strategyName: 'RSI超卖策略',
    openTime: new Date(Date.now() - 3600000 * 12),
  },
];

// 初始订单数据
export const INITIAL_ORDERS: Order[] = [
  // 已成交订单
  {
    id: 'ord_1',
    time: new Date(Date.now() - 3600000 * 2),
    symbol: 'BTC/USDT',
    type: 'buy',
    side: 'long',
    price: 66500,
    amount: 0.1,
    filled: 0.1,
    status: 'filled',
    strategyId: 'strat_1',
    strategyName: '双均线策略',
  },
  {
    id: 'ord_2',
    time: new Date(Date.now() - 3600000 * 4),
    symbol: 'ETH/USDT',
    type: 'sell',
    side: 'long',
    price: 3420,
    amount: 1.0,
    filled: 1.0,
    status: 'filled',
    strategyId: 'strat_2',
    strategyName: '趋势猎手 Pro',
  },
  {
    id: 'ord_3',
    time: new Date(Date.now() - 3600000 * 6),
    symbol: 'SOL/USDT',
    type: 'sell',
    side: 'short',
    price: 140,
    amount: 10,
    filled: 10,
    status: 'filled',
    strategyId: 'strat_3',
    strategyName: '网格套利策略',
  },
  // 部分成交订单
  {
    id: 'ord_4',
    time: new Date(Date.now() - 3600000 * 1),
    symbol: 'BTC/USDT',
    type: 'buy',
    side: 'long',
    price: 67000,
    amount: 0.2,
    filled: 0.08,
    status: 'partial',
    strategyId: 'strat_1',
    strategyName: '双均线策略',
  },
  {
    id: 'ord_5',
    time: new Date(Date.now() - 3600000 * 3),
    symbol: 'BNB/USDT',
    type: 'buy',
    side: 'long',
    price: 590,
    amount: 5,
    filled: 2.5,
    status: 'partial',
    strategyId: 'strat_4',
    strategyName: '布林带策略',
  },
  {
    id: 'ord_6',
    time: new Date(Date.now() - 3600000 * 5),
    symbol: 'DOGE/USDT',
    type: 'buy',
    side: 'long',
    price: 0.085,
    amount: 10000,
    filled: 3500,
    status: 'partial',
    strategyId: 'strat_5',
    strategyName: 'RSI超卖策略',
  },
  {
    id: 'ord_7',
    time: new Date(Date.now() - 3600000 * 7),
    symbol: 'ADA/USDT',
    type: 'sell',
    side: 'long',
    price: 0.45,
    amount: 3000,
    filled: 1200,
    status: 'partial',
    strategyId: 'strat_6',
    strategyName: '趋势策略',
  },
  {
    id: 'ord_8',
    time: new Date(Date.now() - 3600000 * 8),
    symbol: 'AVAX/USDT',
    type: 'buy',
    side: 'short',
    price: 35,
    amount: 50,
    filled: 15,
    status: 'partial',
    strategyId: 'strat_3',
    strategyName: '网格套利策略',
  },
  // 待成交订单
  {
    id: 'ord_9',
    time: new Date(Date.now() - 3600000 * 0.5),
    symbol: 'BTC/USDT',
    type: 'sell',
    side: 'long',
    price: 68000,
    amount: 0.15,
    filled: 0,
    status: 'pending',
    strategyId: 'strat_1',
    strategyName: '双均线策略',
  },
  {
    id: 'ord_10',
    time: new Date(Date.now() - 3600000 * 1.5),
    symbol: 'ETH/USDT',
    type: 'sell',
    side: 'long',
    price: 3500,
    amount: 2.0,
    filled: 0,
    status: 'pending',
    strategyId: 'strat_2',
    strategyName: '趋势猎手 Pro',
  },
  {
    id: 'ord_11',
    time: new Date(Date.now() - 3600000 * 2.5),
    symbol: 'LINK/USDT',
    type: 'buy',
    side: 'long',
    price: 14.5,
    amount: 200,
    filled: 0,
    status: 'pending',
    strategyId: 'strat_7',
    strategyName: '波段策略',
  },
  {
    id: 'ord_12',
    time: new Date(Date.now() - 3600000 * 3.5),
    symbol: 'MATIC/USDT',
    type: 'sell',
    side: 'long',
    price: 0.72,
    amount: 5000,
    filled: 0,
    status: 'pending',
    strategyId: 'strat_8',
    strategyName: '突破策略',
  },
];

// 初始信号数据
export const INITIAL_SIGNALS: Signal[] = [
  {
    id: 'sig_1',
    time: new Date(Date.now() - 5000),
    type: 'buy',
    symbol: 'BTC/USDT',
    price: 67234,
    reason: 'MA5 上穿 MA20',
    strength: 0.85,
    strategyId: 'strat_1',
    strategyName: '双均线策略',
  },
  {
    id: 'sig_2',
    time: new Date(Date.now() - 15000),
    type: 'sell',
    symbol: 'ETH/USDT',
    price: 3456,
    reason: 'RSI 超买',
    strength: 0.72,
    strategyId: 'strat_2',
    strategyName: '趋势猎手 Pro',
  },
  {
    id: 'sig_3',
    time: new Date(Date.now() - 25000),
    type: 'hold',
    symbol: 'SOL/USDT',
    price: 138,
    reason: '布林带中轨',
    strength: 0.45,
    strategyId: 'strat_3',
    strategyName: '网格套利策略',
  },
  {
    id: 'sig_4',
    time: new Date(Date.now() - 35000),
    type: 'buy',
    symbol: 'BNB/USDT',
    price: 595,
    reason: '趋势确认',
    strength: 0.68,
    strategyId: 'strat_4',
    strategyName: '布林带策略',
  },
  {
    id: 'sig_5',
    time: new Date(Date.now() - 45000),
    type: 'sell',
    symbol: 'XRP/USDT',
    price: 0.48,
    reason: '止损触发',
    strength: 0.92,
    strategyId: 'strat_5',
    strategyName: 'RSI超卖策略',
  },
];

// 信号生成器工厂函数
export type SignalGenerator = () => Signal;

export function createSignalGenerator(): SignalGenerator {
  const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];
  const strategies = [
    { id: 'strat_1', name: '双均线策略' },
    { id: 'strat_2', name: '趋势猎手 Pro' },
    { id: 'strat_3', name: '网格套利策略' },
    { id: 'strat_4', name: '布林带策略' },
    { id: 'strat_5', name: 'RSI超卖策略' },
  ];
  const reasons = {
    buy: ['MA5 上穿 MA20', 'RSI 超卖反弹', '布林带下轨', '趋势确认', '突破阻力位'],
    sell: ['MA5 下穿 MA20', 'RSI 超买', '布林带上轨', '止损触发', '突破支撑位'],
    hold: ['布林带中轨', '观望等待', '信号模糊', '波动收窄', '趋势不明'],
  };
  const prices: Record<string, number> = {
    'BTC/USDT': 67234,
    'ETH/USDT': 3456,
    'SOL/USDT': 138,
    'BNB/USDT': 595,
    'XRP/USDT': 0.48,
  };

  let signalIndex = 0;

  return () => {
    signalIndex++;
    const typeRoll = Math.random();
    const type: Signal['type'] = typeRoll < 0.4 ? 'buy' : typeRoll < 0.7 ? 'sell' : 'hold';
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    return {
      id: `sig_live_${signalIndex}_${Date.now()}`,
      time: new Date(),
      type,
      symbol,
      price: prices[symbol] + (Math.random() - 0.5) * prices[symbol] * 0.01,
      reason: reasons[type][Math.floor(Math.random() * reasons[type].length)],
      strength: 0.5 + Math.random() * 0.5,
      strategyId: strategy.id,
      strategyName: strategy.name,
    };
  };
}

// 辅助函数
export function calculateTotalPnl(positions: Position[]): number {
  return positions.reduce((sum, pos) => sum + pos.pnl, 0);
}

export function calculateTotalValue(positions: Position[]): number {
  return positions.reduce((sum, pos) => sum + pos.currentPrice * pos.amount, 0);
}

export function getPositionsBySymbol(positions: Position[], symbol: string): Position[] {
  return positions.filter(p => p.symbol === symbol);
}

export function getPositionsByStrategy(positions: Position[], strategyId: string): Position[] {
  return positions.filter(p => p.strategyId === strategyId);
}

export function getOrdersByStatus(orders: Order[], status: Order['status']): Order[] {
  return orders.filter(o => o.status === status);
}

export function getRecentSignals(signals: Signal[], limit: number = 20): Signal[] {
  return [...signals].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, limit);
}
