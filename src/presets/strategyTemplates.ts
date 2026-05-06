/**
 * NEMT Platform - Strategy Template Presets
 * 策略模板预设
 */

// ============================================
// 策略模板类型
// ============================================

export type StrategyTemplateType = 
  | 'trend_following'
  | 'mean_reversion'
  | 'breakout'
  | 'grid'
  | 'dca'
  | 'momentum'
  | 'arbitrage';

// ============================================
// 策略模板定义
// ============================================

export interface StrategyTemplate {
  id: string;
  type: StrategyTemplateType;
  name: string;
  nameEn: string;
  description: string;
  
  // 适用市场
  markets: ('crypto' | 'stock' | 'forex' | 'commodity')[];
  
  // 适用周期
  timeframes: string[];
  
  // 风险等级
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  
  // 模板代码
  code: {
    language: 'python' | 'javascript' | 'typescript';
    content: string;
  };
  
  // 配置
  config: {
    // 指标
    indicators: { id: string; params: Record<string, number> }[];
    
    // 风控
    stopLoss?: number;
    takeProfit?: number;
    maxPositions?: number;
    
    // 入场条件
    entryConditions?: string[];
    
    // 出场条件
    exitConditions?: string[];
  };
  
  // 难度
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // 标签
  tags: string[];
}

// ============================================
// 策略模板列表
// ============================================

export const StrategyTemplates: StrategyTemplate[] = [
  // ============================================
  // 趋势跟踪策略
  // ============================================
  {
    id: 'trend_ema_cross',
    type: 'trend_following',
    name: '均线交叉趋势策略',
    nameEn: 'EMA Cross Trend Strategy',
    description: '使用快慢 EMA 交叉判断趋势方向，顺势入场交易',
    
    markets: ['crypto', 'stock', 'forex'],
    timeframes: ['1h', '4h', '1d'],
    riskLevel: 'moderate',
    
    code: {
      language: 'python',
      content: `"""
EMA Cross Trend Strategy
均线交叉趋势策略
"""
import pandas as pd
import numpy as np

def initialize(context):
    # 快线周期
    context.fast_ema = 20
    # 慢线周期
    context.slow_ema = 50
    # 止损
    context.stop_loss = 0.02
    # 止盈
    context.take_profit = 0.04

def handle_data(context, data):
    # 计算 EMA
    fast_ema = data[symbol].ema(context.fast_ema)
    slow_ema = data[symbol].ema(context.slow_ema)
    
    # 金叉买入
    if fast_ema > slow_ema and context.position == 0:
        order_target_percent(symbol, 1.0)
    
    # 死叉卖出
    elif fast_ema < slow_ema and context.position > 0:
        order_target_percent(symbol, 0)
    
    # 止损
    price = data[symbol].price
    if context.position > 0:
        entry = context.portfolio.positions[symbol].cost_basis
        if price < entry * (1 - context.stop_loss):
            order_target_percent(symbol, 0)
`,
    },
    
    config: {
      indicators: [
        { id: 'EMA', params: { period: 20 } },
        { id: 'EMA', params: { period: 50 } },
      ],
      stopLoss: 2,
      takeProfit: 4,
      entryConditions: ['快线 > 慢线', '价格 > 两者均线'],
      exitConditions: ['快线 < 慢线', '止损触发', '止盈触发'],
    },
    
    difficulty: 'beginner',
    tags: ['趋势', '均线', '顺势', '双均线'],
  },
  
  {
    id: 'trend_supertrend',
    type: 'trend_following',
    name: '超级趋势策略',
    nameEn: 'Supertrend Strategy',
    description: '使用超级趋势指标追踪市场趋势，在趋势反转时入场',
    
    markets: ['crypto', 'stock'],
    timeframes: ['15m', '1h', '4h'],
    riskLevel: 'moderate',
    
    code: {
      language: 'python',
      content: `"""
Supertrend Strategy
超级趋势策略
"""
import pandas as pd

def initialize(context):
    context.atr_period = 10
    context.multiplier = 3
    
def handle_data(context, data):
    # 计算超级趋势
    supertrend = data[symbol].supertrend(context.atr_period, context.multiplier)
    
    # 趋势由下转上，买入
    if supertrend.direction == 1 and context.position == 0:
        order_target_percent(symbol, 1.0)
    
    # 趋势由上转下，卖出
    elif supertrend.direction == -1 and context.position > 0:
        order_target_percent(symbol, 0)
`,
    },
    
    config: {
      indicators: [
        { id: 'Supertrend', params: { period: 10, multiplier: 3 } },
        { id: 'ATR', params: { period: 14 } },
      ],
      stopLoss: 2,
      takeProfit: 4,
      entryConditions: ['超级趋势上穿'],
      exitConditions: ['超级趋势下穿', '止损触发'],
    },
    
    difficulty: 'beginner',
    tags: ['趋势', '超级趋势', '止损'],
  },
  
  // ============================================
  // 均值回归策略
  // ============================================
  {
    id: 'mean_reversion_bb',
    type: 'mean_reversion',
    name: '布林带均值回归',
    nameEn: 'Bollinger Bands Mean Reversion',
    description: '价格在布林带极端位置时反向交易，预期回归中轨',
    
    markets: ['crypto', 'stock', 'forex'],
    timeframes: ['5m', '15m', '1h'],
    riskLevel: 'conservative',
    
    code: {
      language: 'python',
      content: `"""
Bollinger Bands Mean Reversion
布林带均值回归策略
"""
def initialize(context):
    context.bb_period = 20
    context.bb_std = 2
    context.entry_threshold = 0.1  # 距离布林带的百分比

def handle_data(context, data):
    bb = data[symbol].bollinger_bands(context.bb_period, context.bb_std)
    
    price = data[symbol].price
    upper = bb.upper
    lower = bb.lower
    middle = bb.middle
    
    # 价格触及下轨且偏离不大
    if price <= lower * (1 + context.entry_threshold) and context.position == 0:
        # 买入
        order_target_percent(symbol, 1.0)
    
    # 价格触及上轨且偏离不大
    elif price >= upper * (1 - context.entry_threshold) and context.position == 0:
        # 做空
        order_target_percent(symbol, -1.0)
    
    # 价格回归中轨，平仓
    elif context.position != 0:
        if context.position > 0 and price >= middle:
            order_target_percent(symbol, 0)
        elif context.position < 0 and price <= middle:
            order_target_percent(symbol, 0)
`,
    },
    
    config: {
      indicators: [
        { id: 'BB', params: { period: 20, stdDev: 2 } },
      ],
      stopLoss: 1.5,
      takeProfit: 1.5,
      entryConditions: ['价格触及布林带下轨', '价格触及布林带上轨'],
      exitConditions: ['价格回归中轨', '止损触发'],
    },
    
    difficulty: 'beginner',
    tags: ['均值回归', '布林带', '逆势'],
  },
  
  {
    id: 'mean_reversion_rsi',
    type: 'mean_reversion',
    name: 'RSI 超买超卖',
    nameEn: 'RSI Overbought Oversold',
    description: 'RSI 达到极端值时反向交易',
    
    markets: ['crypto', 'stock', 'forex'],
    timeframes: ['1h', '4h', '1d'],
    riskLevel: 'conservative',
    
    code: {
      language: 'python',
      content: `"""
RSI Overbought Oversold Strategy
RSI 超买超卖策略
"""
def initialize(context):
    context.rsi_period = 14
    context.oversold = 30
    context.overbought = 70

def handle_data(context, data):
    rsi = data[symbol].rsi(context.rsi_period)
    
    # RSI 进入超卖区，买入
    if rsi < context.oversold and context.position == 0:
        order_target_percent(symbol, 1.0)
    
    # RSI 进入超买区，做空
    elif rsi > context.overbought and context.position == 0:
        order_target_percent(symbol, -1.0)
    
    # RSI 回归中性，平仓
    elif context.position != 0:
        if context.position > 0 and rsi > 50:
            order_target_percent(symbol, 0)
        elif context.position < 0 and rsi < 50:
            order_target_percent(symbol, 0)
`,
    },
    
    config: {
      indicators: [
        { id: 'RSI', params: { period: 14 } },
      ],
      stopLoss: 2,
      takeProfit: 3,
      entryConditions: ['RSI < 30', 'RSI > 70'],
      exitConditions: ['RSI = 50', '止损触发'],
    },
    
    difficulty: 'beginner',
    tags: ['均值回归', 'RSI', '逆势'],
  },
  
  // ============================================
  // 突破策略
  // ============================================
  {
    id: 'breakout_range',
    type: 'breakout',
    name: '区间突破策略',
    nameEn: 'Range Breakout Strategy',
    description: '价格突破近期高点/低点时顺势入场',
    
    markets: ['crypto', 'stock'],
    timeframes: ['15m', '1h', '4h'],
    riskLevel: 'aggressive',
    
    code: {
      language: 'python',
      content: `"""
Range Breakout Strategy
区间突破策略
"""
def initialize(context):
    context.lookback = 20  # 观察周期

def handle_data(context, data):
    # 获取历史高低点
    high_history = data[symbol].history(context.lookback, 'high')
    low_history = data[symbol].history(context.lookback, 'low')
    
    highest = max(high_history)
    lowest = min(low_history)
    
    price = data[symbol].price
    
    # 突破新高，买入
    if price > highest and context.position == 0:
        order_target_percent(symbol, 1.0)
    
    # 跌破新低，卖出
    elif price < lowest and context.position == 0:
        order_target_percent(symbol, -1.0)
    
    # 止损
    if context.position > 0:
        entry = context.portfolio.positions[symbol].cost_basis
        if price < entry * 0.98:
            order_target_percent(symbol, 0)
`,
    },
    
    config: {
      indicators: [
        { id: 'SMA', params: { period: 20 } },
      ],
      stopLoss: 2,
      takeProfit: 6,
      maxPositions: 1,
      entryConditions: ['突破 N 周期高点', '突破 N 周期低点'],
      exitConditions: ['止损触发', '止盈触发'],
    },
    
    difficulty: 'intermediate',
    tags: ['突破', '趋势', '顺势'],
  },
  
  // ============================================
  // 网格策略
  // ============================================
  {
    id: 'grid_basic',
    type: 'grid',
    name: '基础网格策略',
    nameEn: 'Basic Grid Strategy',
    description: '在固定价格区间设置网格，低买高卖',
    
    markets: ['crypto'],
    timeframes: ['1h', '4h', '1d'],
    riskLevel: 'conservative',
    
    code: {
      language: 'python',
      content: `"""
Basic Grid Strategy
基础网格策略
"""
def initialize(context):
    # 网格数量
    context.grid_count = 10
    # 价格区间
    context.price_min = 40000
    context.price_max = 50000
    # 每格大小
    context.grid_size = (context.price_max - context.price_min) / context.grid_count
    # 网格已交易标记
    context.grid_traded = [False] * context.grid_count

def handle_data(context, data):
    price = data[symbol].price
    
    # 检查是否在价格区间内
    if context.price_min <= price <= context.price_max:
        grid_index = int((price - context.price_min) / context.grid_size)
        grid_index = min(grid_index, context.grid_count - 1)
        
        # 买入网格
        if not context.grid_traded[grid_index] and context.position == 0:
            context.grid_traded[grid_index] = True
            order_target_percent(symbol, 1.0 / context.grid_count)
        
        # 卖出网格
        elif context.grid_traded[grid_index] and context.position > 0:
            context.grid_traded[grid_index] = False
            order_target_percent(symbol, 0)
`,
    },
    
    config: {
      indicators: [],
      entryConditions: ['价格触及网格线'],
      exitConditions: ['价格触及相邻网格'],
    },
    
    difficulty: 'intermediate',
    tags: ['网格', '套利', '低买高卖'],
  },
  
  // ============================================
  // 定投策略
  // ============================================
  {
    id: 'dca_basic',
    type: 'dca',
    name: '定投策略',
    nameEn: 'Dollar Cost Averaging',
    description: '定期定额投资，平滑成本，降低择时风险',
    
    markets: ['crypto', 'stock'],
    timeframes: ['1d', '1w'],
    riskLevel: 'conservative',
    
    code: {
      language: 'python',
      content: `"""
Dollar Cost Averaging
定投策略
"""
def initialize(context):
    # 每次投入金额
    context.dca_amount = 100
    # 间隔天数
    context.interval_days = 7
    # 上次购买日
    context.last_buy_day = None

def handle_data(context, data):
    current_day = data[symbol].datetime.day
    
    # 检查是否到达定投日
    if context.last_buy_day is None or \\
       current_day - context.last_buy_day >= context.interval_days:
        # 买入
        context.order_id = order_value(symbol, context.dca_amount)
        context.last_buy_day = current_day
`,
    },
    
    config: {
      indicators: [],
      entryConditions: ['到达定投周期'],
      exitConditions: [],
    },
    
    difficulty: 'beginner',
    tags: ['定投', '长期', '分散风险'],
  },
  
  // ============================================
  // 动量策略
  // ============================================
  {
    id: 'momentum_rsi_macd',
    type: 'momentum',
    name: 'RSI-MACD 动量策略',
    nameEn: 'RSI-MACD Momentum Strategy',
    description: '结合 RSI 和 MACD 判断动量方向',
    
    markets: ['crypto', 'stock', 'forex'],
    timeframes: ['1h', '4h', '1d'],
    riskLevel: 'moderate',
    
    code: {
      language: 'python',
      content: `"""
RSI-MACD Momentum Strategy
RSI-MACD 动量策略
"""
def initialize(context):
    context.rsi_period = 14
    context.macd_fast = 12
    context.macd_slow = 26
    context.macd_signal = 9

def handle_data(context, data):
    rsi = data[symbol].rsi(context.rsi_period)
    macd = data[symbol].macd(context.macd_fast, context.macd_slow, context.macd_signal)
    
    # 买入信号：RSI 中性偏强 + MACD 金叉
    if (40 < rsi < 60) and (macd.macd > macd.signal) and context.position == 0:
        order_target_percent(symbol, 1.0)
    
    # 卖出信号：RSI 中性偏弱 + MACD 死叉
    elif (40 < rsi < 60) and (macd.macd < macd.signal) and context.position > 0:
        order_target_percent(symbol, 0)
`,
    },
    
    config: {
      indicators: [
        { id: 'RSI', params: { period: 14 } },
        { id: 'MACD', params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } },
      ],
      stopLoss: 2,
      takeProfit: 4,
      entryConditions: ['RSI 40-60', 'MACD 金叉'],
      exitConditions: ['RSI 40-60', 'MACD 死叉'],
    },
    
    difficulty: 'intermediate',
    tags: ['动量', 'RSI', 'MACD', '顺势'],
  },
];

// ============================================
// 模板分类
// ============================================

export const StrategyTemplateCategories = {
  trend_following: {
    name: '趋势跟踪',
    nameEn: 'Trend Following',
    color: '#2196f3',
    description: '顺势交易，跟随市场趋势',
  },
  mean_reversion: {
    name: '均值回归',
    nameEn: 'Mean Reversion',
    color: '#4caf50',
    description: '逆势交易，价格回归均值',
  },
  breakout: {
    name: '突破策略',
    nameEn: 'Breakout',
    color: '#ff9800',
    description: '价格突破关键位时入场',
  },
  grid: {
    name: '网格策略',
    nameEn: 'Grid Trading',
    color: '#9c27b0',
    description: '在固定区间内低买高卖',
  },
  dca: {
    name: '定投策略',
    nameEn: 'DCA',
    color: '#607d8b',
    description: '定期定额，分散风险',
  },
  momentum: {
    name: '动量策略',
    nameEn: 'Momentum',
    color: '#e91e63',
    description: '基于动量指标的交易',
  },
  arbitrage: {
    name: '套利策略',
    nameEn: 'Arbitrage',
    color: '#00bcd4',
    description: '利用价差获利',
  },
};

// ============================================
// 工具函数
// ============================================

/**
 * 获取策略模板
 */
export function getStrategyTemplate(id: string): StrategyTemplate | undefined {
  return StrategyTemplates.find(t => t.id === id);
}

/**
 * 按类型获取模板
 */
export function getTemplatesByType(type: StrategyTemplateType): StrategyTemplate[] {
  return StrategyTemplates.filter(t => t.type === type);
}

/**
 * 按市场获取模板
 */
export function getTemplatesByMarket(market: string): StrategyTemplate[] {
  return StrategyTemplates.filter(t => t.markets.includes(market as any));
}

/**
 * 按难度获取模板
 */
export function getTemplatesByDifficulty(difficulty: string): StrategyTemplate[] {
  return StrategyTemplates.filter(t => t.difficulty === difficulty);
}

/**
 * 获取模板分类信息
 */
export function getTemplateCategory(type: StrategyTemplateType) {
  return StrategyTemplateCategories[type];
}
