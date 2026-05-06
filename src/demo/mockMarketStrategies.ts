/**
 * NEMT Platform - Mock Market Strategies Data
 * 12 个市场策略数据
 */

import { MOCK_USERS, type MockUser } from './mockUsers';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface MockMarketStrategy {
  id: string;
  name: string;
  authorId: string;
  author: MockUser;
  description: string;
  code: string;
  price: number;
  rating: number;
  ratingCount: number;
  purchases: number;
  tags: string[];
  metrics: {
    avgReturn: number;
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
    avgTrades: number;
  };
  reviews: Review[];
  featured: boolean;
}

// 策略代码片段
const STRATEGY_CODES = {
  dualMa: `# 双均线趋势策略
class DualMAStrategy:
    def __init__(self, fast=10, slow=30):
        self.fast = fast
        self.slow = slow
        self.position = 0
        
    def next(self, bar):
        fast_ma = bar.close[-self.fast:].mean()
        slow_ma = bar.close[-self.slow:].mean()
        
        if fast_ma > slow_ma and self.position <= 0:
            self.buy()
            self.position = 1
        elif fast_ma < slow_ma and self.position >= 0:
            self.sell()
            self.position = -1`,
  grid: `# 智能网格策略
class GridStrategy:
    def __init__(self, grid_count=10, price_range=0.1):
        self.grid_count = grid_count
        self.price_range = price_range
        self.grids = []
        
    def next(self, bar):
        price = bar.close[-1]
        for grid_price in self.grids:
            if price <= grid_price and self.position > 0:
                self.sell()
            elif price >= grid_price and self.position < 0:
                self.buy()`,
  bollinger: `# 布林带均值回归
class BollingerStrategy:
    def __init__(self, window=20, std_mult=2.0):
        self.window = window
        self.std_mult = std_mult
        
    def next(self, bar):
        sma = bar.close[-self.window:].mean()
        std = bar.close[-self.window:].std()
        
        upper = sma + self.std_mult * std
        lower = sma - self.std_mult * std
        
        if bar.close[-1] < lower:
            self.buy()
        elif bar.close[-1] > upper:
            self.sell()`,
  rsi: `# RSI 超卖策略
class RSIStrategy:
    def __init__(self, period=14, oversold=30, overbought=70):
        self.period = period
        self.oversold = oversold
        self.overbought = overbought
        
    def next(self, bar):
        rsi = self.calculate_rsi(bar, self.period)
        
        if rsi < self.oversold:
            self.buy()
        elif rsi > self.overbought:
            self.sell()`,
  marketMaker: `# 做市商策略
class MarketMakerStrategy:
    def __init__(self, spread=0.001, inventory_limit=100):
        self.spread = spread
        self.inventory_limit = inventory_limit
        
    def next(self, bar):
        mid = bar.close[-1]
        bid = mid * (1 - self.spread)
        ask = mid * (1 + self.spread)
        
        self.place_limit_order('buy', bid)
        self.place_limit_order('sell', ask)`,
  arbitrage: `# 三角套利策略
class TriangularArbitrage:
    def __init__(self):
        self.pairs = ['BTC/USDT', 'ETH/BTC', 'ETH/USDT']
        
    def next(self, prices):
        btc_usdt = prices['BTC/USDT']
        eth_btc = prices['ETH/BTC']
        eth_usdt = prices['ETH/USDT']
        
        implied = eth_btc * btc_usdt
        diff = (eth_usdt - implied) / implied
        
        if diff > 0.001:
            self.execute_arbitrage()`,
  breakout: `# 波动率突破策略
class BreakoutStrategy:
    def __init__(self, lookback=20):
        self.lookback = lookback
        
    def next(self, bar):
        highs = bar.high[-self.lookback:]
        lows = bar.low[-self.lookback:]
        
        upper = highs.max()
        lower = lows.min()
        
        if bar.close[-1] > upper:
            self.buy()
        elif bar.close[-1] < lower:
            self.sell()`,
  hedge: `# 对冲策略
class HedgeStrategy:
    def __init__(self, hedge_ratio=0.5):
        self.hedge_ratio = hedge_ratio
        
    def next(self, bar):
        spot = self.get_spot_position()
        futures = self.get_futures_position()
        
        beta = self.calculate_beta()
        target_hedge = spot * beta * self.hedge_ratio
        
        self.adjust_futures(target_hedge - futures)`,
  ml: `# 机器学习预测策略
class MLStrategy:
    def __init__(self, model):
        self.model = model
        self.features = ['ma5', 'ma20', 'rsi', 'macd']
        
    def next(self, bar):
        features = self.extract_features(bar)
        prediction = self.model.predict([features])[0]
        
        if prediction > 0.6:
            self.buy()
        elif prediction < 0.4:
            self.sell()`,
  neural: `# 神经网络策略
class NeuralStrategy:
    def __init__(self):
        self.window = 30
        self.model = self.build_lstm()
        
    def next(self, bar):
        seq = self.prepare_sequence(bar)
        prob = self.model.predict(seq)
        
        if prob[0] > 0.7:
            self.buy()
        elif prob[0] < 0.3:
            self.sell()`,
  volume: `# 成交量异常策略
class VolumeStrategy:
    def __init__(self, vol_threshold=2.0):
        self.vol_threshold = vol_threshold
        
    def next(self, bar):
        avg_vol = bar.volume[-20:].mean()
        current_vol = bar.volume[-1]
        
        if current_vol > avg_vol * self.vol_threshold:
            if bar.close[-1] > bar.open[-1]:
                self.buy()
            else:
                self.sell()`,
  swing: `# 波段交易策略
class SwingStrategy:
    def __init__(self, atr_mult=2.0):
        self.atr_mult = atr_mult
        
    def next(self, bar):
        atr = self.calculate_atr(bar, 14)
        entry = bar.close[-1]
        stop = entry - atr * self.atr_mult
        target = entry + atr * self.atr_mult * 2
        
        if not self.position:
            self.buy(stop=stop, target=target)`,
};

// 评论数据
const REVIEWS: Review[][] = [
  // 策略1评论
  [
    { id: 'r1_1', userId: 'user_6', userName: '布林带女王', rating: 5, comment: '非常好用的策略，回测效果很稳定', date: '2024-01-15' },
    { id: 'r1_2', userId: 'user_18', userName: '日内交易员', rating: 5, comment: '参数可调节，适应性强', date: '2024-01-10' },
    { id: 'r1_3', userId: 'user_9', userName: '币圈老韭菜', rating: 4, comment: '经典策略，值得信赖', date: '2023-12-28' },
  ],
  // 策略2评论
  [
    { id: 'r2_1', userId: 'user_3', userName: '套利王', rating: 5, comment: '网格策略中的战斗机！', date: '2024-01-18' },
    { id: 'r2_2', userId: 'user_14', userName: '搬砖达人', rating: 5, comment: '配合我的搬砖策略效果更好', date: '2024-01-12' },
  ],
  // 更多评论...
];

export const MOCK_MARKET_STRATEGIES: MockMarketStrategy[] = [
  {
    id: 'mkt_1',
    name: '智能网格 v3.0',
    authorId: 'user_1',
    author: MOCK_USERS[0],
    description: '全新升级的网格策略，支持动态网格间距和智能止盈。结合趋势过滤，避免在单边行情中亏损。适合震荡行情。',
    code: STRATEGY_CODES.grid,
    price: 599,
    rating: 4.9,
    ratingCount: 567,
    purchases: 3421,
    tags: ['网格', '震荡', '套利'],
    metrics: {
      avgReturn: 45.2,
      winRate: 78.5,
      sharpeRatio: 2.1,
      maxDrawdown: 12.3,
      avgTrades: 156,
    },
    reviews: REVIEWS[0],
    featured: true,
  },
  {
    id: 'mkt_2',
    name: '趋势猎手 Pro',
    authorId: 'user_2',
    author: MOCK_USERS[1],
    description: '专业级趋势跟踪策略，多周期共振确认入场。内置动态止损，最大化利润保留。适用于BTC、ETH等主流币种。',
    code: STRATEGY_CODES.dualMa,
    price: 299,
    rating: 4.8,
    ratingCount: 423,
    purchases: 2847,
    tags: ['趋势', '止损', '多周期'],
    metrics: {
      avgReturn: 68.9,
      winRate: 65.2,
      sharpeRatio: 1.8,
      maxDrawdown: 18.7,
      avgTrades: 89,
    },
    reviews: [
      { id: 'r2_1', userId: 'user_23', userName: '数字黄金猎人', rating: 5, comment: '完美捕捉趋势行情', date: '2024-01-20' },
      { id: 'r2_2', userId: 'user_13', userName: 'CTA策略王', rating: 5, comment: '参数调教好后效果很好', date: '2024-01-15' },
    ],
    featured: true,
  },
  {
    id: 'mkt_3',
    name: '跨所套利机器人',
    authorId: 'user_3',
    author: MOCK_USERS[2],
    description: '全自动跨交易所套利，实时监控多个交易所价差，毫秒级执行。支持币安、火币、OKX等主流交易所。',
    code: STRATEGY_CODES.arbitrage,
    price: 1299,
    rating: 4.7,
    ratingCount: 234,
    purchases: 1923,
    tags: ['套利', '跨所', '高频'],
    metrics: {
      avgReturn: 25.6,
      winRate: 89.3,
      sharpeRatio: 3.2,
      maxDrawdown: 5.8,
      avgTrades: 1234,
    },
    reviews: [
      { id: 'r3_1', userId: 'user_4', userName: '高频之神', rating: 5, comment: '套利效率很高', date: '2024-01-22' },
    ],
    featured: false,
  },
  {
    id: 'mkt_4',
    name: '高频做市策略',
    authorId: 'user_5',
    author: MOCK_USERS[4],
    description: '专业级做市策略，包含库存风险管理和动态价差调整。适合有足够流动性的交易对。',
    code: STRATEGY_CODES.marketMaker,
    price: 2999,
    rating: 4.6,
    ratingCount: 89,
    purchases: 1534,
    tags: ['做市', '高频', '流动性'],
    metrics: {
      avgReturn: 35.2,
      winRate: 68.9,
      sharpeRatio: 2.5,
      maxDrawdown: 8.5,
      avgTrades: 5678,
    },
    reviews: [
      { id: 'r4_1', userId: 'user_4', userName: '高频之神', rating: 4, comment: '需要技术基础，但效果很好', date: '2024-01-25' },
    ],
    featured: false,
  },
  {
    id: 'mkt_5',
    name: '布林带均值回归',
    authorId: 'user_6',
    author: MOCK_USERS[5],
    description: '基于统计学原理的均值回归策略，在价格触及布林带边缘时反向交易。配合波动率自适应参数。',
    code: STRATEGY_CODES.bollinger,
    price: 199,
    rating: 4.5,
    ratingCount: 312,
    purchases: 2341,
    tags: ['布林带', '均值回归', '统计'],
    metrics: {
      avgReturn: 38.7,
      winRate: 71.4,
      sharpeRatio: 1.9,
      maxDrawdown: 15.2,
      avgTrades: 134,
    },
    reviews: [
      { id: 'r5_1', userId: 'user_7', userName: '波浪理论家', rating: 4, comment: '配合其他指标效果更佳', date: '2024-01-08' },
      { id: 'r5_2', userId: 'user_16', userName: 'K线形态师', rating: 5, comment: '简单实用的策略', date: '2023-12-20' },
    ],
    featured: false,
  },
  {
    id: 'mkt_6',
    name: 'RSI 超卖策略',
    authorId: 'user_10',
    author: MOCK_USERS[9],
    description: '简单直观的RSI超卖策略，适合新手入门。参数设置简单明了，回测效果稳健。',
    code: STRATEGY_CODES.rsi,
    price: 99,
    rating: 4.3,
    ratingCount: 567,
    purchases: 1234,
    tags: ['RSI', '入门', '反转'],
    metrics: {
      avgReturn: 28.5,
      winRate: 55.3,
      sharpeRatio: 1.2,
      maxDrawdown: 22.1,
      avgTrades: 67,
    },
    reviews: [
      { id: 'r6_1', userId: 'user_10', userName: '量化新人', rating: 5, comment: '新手友好，易上手', date: '2024-01-05' },
    ],
    featured: false,
  },
  {
    id: 'mkt_7',
    name: '双均线趋势策略',
    authorId: 'user_9',
    author: MOCK_USERS[8],
    description: '经典的双均线交叉策略，简单有效。配合止损止盈机制，适用于趋势明确的行情。',
    code: STRATEGY_CODES.dualMa,
    price: 199,
    rating: 4.7,
    ratingCount: 456,
    purchases: 3421,
    tags: ['均线', '趋势', '经典'],
    metrics: {
      avgReturn: 42.3,
      winRate: 62.5,
      sharpeRatio: 1.6,
      maxDrawdown: 16.8,
      avgTrades: 78,
    },
    reviews: [
      { id: 'r7_1', userId: 'user_1', userName: '网格大师', rating: 5, comment: '经典策略永不过时', date: '2024-01-19' },
      { id: 'r7_2', userId: 'user_2', userName: '趋势猎手', rating: 4, comment: '配合其他工具使用效果更好', date: '2024-01-14' },
    ],
    featured: false,
  },
  {
    id: 'mkt_8',
    name: '三角套利专家',
    authorId: 'user_3',
    author: MOCK_USERS[2],
    description: '专注单交易所三角套利，监控主流交易对之间的价差机会。自动计算最优套利路径。',
    code: STRATEGY_CODES.arbitrage,
    price: 999,
    rating: 4.8,
    ratingCount: 189,
    purchases: 876,
    tags: ['三角套利', '套利', '自动'],
    metrics: {
      avgReturn: 32.1,
      winRate: 91.2,
      sharpeRatio: 2.8,
      maxDrawdown: 4.2,
      avgTrades: 567,
    },
    reviews: [
      { id: 'r8_1', userId: 'user_14', userName: '搬砖达人', rating: 5, comment: '配合跨所套利效果更好', date: '2024-01-21' },
    ],
    featured: false,
  },
  {
    id: 'mkt_9',
    name: '波动率突破策略',
    authorId: 'user_12',
    author: MOCK_USERS[11],
    description: '基于历史波动率的突破策略，在价格突破近期高点/低点时入场。适合波动较大的行情。',
    code: STRATEGY_CODES.breakout,
    price: 399,
    rating: 4.4,
    ratingCount: 234,
    purchases: 1543,
    tags: ['突破', '波动率', '趋势'],
    metrics: {
      avgReturn: 52.8,
      winRate: 64.2,
      sharpeRatio: 1.7,
      maxDrawdown: 19.5,
      avgTrades: 92,
    },
    reviews: [
      { id: 'r9_1', userId: 'user_2', userName: '趋势猎手', rating: 4, comment: '在大趋势中表现出色', date: '2024-01-17' },
    ],
    featured: false,
  },
  {
    id: 'mkt_10',
    name: '做市商对冲策略',
    authorId: 'user_8',
    author: MOCK_USERS[7],
    description: '专业级做市配合对冲机制，降低库存风险。适合有技术基础的交易者使用。',
    code: STRATEGY_CODES.hedge,
    price: 1999,
    rating: 4.7,
    ratingCount: 156,
    purchases: 567,
    tags: ['做市', '对冲', '风控'],
    metrics: {
      avgReturn: 28.9,
      winRate: 73.2,
      sharpeRatio: 2.3,
      maxDrawdown: 9.8,
      avgTrades: 2345,
    },
    reviews: [
      { id: 'r10_1', userId: 'user_5', userName: '做市商A', rating: 5, comment: '风控做得很好', date: '2024-01-23' },
      { id: 'r10_2', userId: 'user_20', userName: '风控大师', rating: 5, comment: '专业的对冲机制', date: '2024-01-18' },
    ],
    featured: false,
  },
  {
    id: 'mkt_11',
    name: '随机森林预测策略',
    authorId: 'user_11',
    author: MOCK_USERS[10],
    description: '使用机器学习随机森林算法预测价格走势，结合多个技术指标特征。持续学习优化。',
    code: STRATEGY_CODES.ml,
    price: 1499,
    rating: 4.6,
    ratingCount: 123,
    purchases: 432,
    tags: ['机器学习', 'AI', '预测'],
    metrics: {
      avgReturn: 56.2,
      winRate: 67.8,
      sharpeRatio: 2.0,
      maxDrawdown: 14.3,
      avgTrades: 145,
    },
    reviews: [
      { id: 'r11_1', userId: 'user_19', userName: '量化矿工', rating: 5, comment: 'AI策略中的精品', date: '2024-01-24' },
    ],
    featured: false,
  },
  {
    id: 'mkt_12',
    name: 'LSTM 神经网络策略',
    authorId: 'user_11',
    author: MOCK_USERS[10],
    description: '使用深度学习LSTM网络预测短期价格走势。适合有GPU资源的用户，需要一定技术背景。',
    code: STRATEGY_CODES.neural,
    price: 2499,
    rating: 4.5,
    ratingCount: 67,
    purchases: 234,
    tags: ['深度学习', 'LSTM', '神经网络'],
    metrics: {
      avgReturn: 62.7,
      winRate: 65.4,
      sharpeRatio: 1.9,
      maxDrawdown: 17.2,
      avgTrades: 112,
    },
    reviews: [
      { id: 'r12_1', userId: 'user_4', userName: '高频之神', rating: 4, comment: '需要调教，但潜力很大', date: '2024-01-26' },
    ],
    featured: false,
  },
];

// 辅助函数
export function getStrategyById(id: string): MockMarketStrategy | undefined {
  return MOCK_MARKET_STRATEGIES.find(s => s.id === id);
}

export function getFeaturedStrategies(): MockMarketStrategy[] {
  return MOCK_MARKET_STRATEGIES.filter(s => s.featured);
}

export function getTopStrategies(limit: number = 5): MockMarketStrategy[] {
  return [...MOCK_MARKET_STRATEGIES].sort((a, b) => b.purchases - a.purchases).slice(0, limit);
}

export function getStrategiesByTag(tag: string): MockMarketStrategy[] {
  return MOCK_MARKET_STRATEGIES.filter(s => s.tags.includes(tag));
}

export function getStrategiesByAuthor(authorId: string): MockMarketStrategy[] {
  return MOCK_MARKET_STRATEGIES.filter(s => s.authorId === authorId);
}

export function searchStrategies(keyword: string): MockMarketStrategy[] {
  const lower = keyword.toLowerCase();
  return MOCK_MARKET_STRATEGIES.filter(s =>
    s.name.toLowerCase().includes(lower) ||
    s.description.toLowerCase().includes(lower) ||
    s.tags.some(t => t.toLowerCase().includes(lower))
  );
}
