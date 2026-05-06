/**
 * NEMT Platform - Mock 数据预设
 * 用于开发和测试的示例数据
 */

import type { StrategyData } from '../components/strategies/CreateStrategyModal';
import type { MarketStrategy } from '../components/strategies/StrategyMarket';

// ============================================
// 策略 Mock 数据
// ============================================

export const StrategyMocks: StrategyData[] = [
  {
    id: 'mock_strategy_1',
    name: '双均线趋势策略',
    code: `# 双均线趋势策略
class DualMAStrategy:
    def __init__(self, fast=10, slow=30):
        self.fast = fast
        self.slow = slow
        
    def next(self, bar):
        ma_fast = bar.close[-self.fast:].mean()
        ma_slow = bar.close[-self.slow:].mean()
        
        if ma_fast > ma_slow and not self.position.is_long:
            self.buy()
        elif ma_fast < ma_slow and self.position.is_long:
            self.sell()
`,
    createdAt: new Date('2024-01-15'),
    status: 'ready',
  },
  {
    id: 'mock_strategy_2',
    name: 'RSI 超卖策略',
    code: `# RSI 超卖策略
class RSIStrategy:
    def __init__(self, period=14, oversold=30, overbought=70):
        self.period = period
        self.oversold = oversold
        self.overbought = overbought
        
    def calculate_rsi(self, prices):
        deltas = prices.diff()
        gain = deltas.where(deltas > 0, 0)
        loss = -deltas.where(deltas < 0, 0)
        avg_gain = gain[-self.period:].mean()
        avg_loss = loss[-self.period:].mean()
        rs = avg_gain / avg_loss if avg_loss != 0 else 0
        return 100 - (100 / (1 + rs))
        
    def next(self, bar):
        rsi = self.calculate_rsi(bar.close)
        
        if rsi < self.oversold and not self.position.is_long:
            self.buy()
        elif rsi > self.overbought and self.position.is_long:
            self.sell()
`,
    createdAt: new Date('2024-02-20'),
    status: 'ready',
  },
  {
    id: 'mock_strategy_3',
    name: '网格套利机器人',
    code: `# 网格套利策略
class GridStrategy:
    def __init__(self, grid_count=10, grid_size=0.02):
        self.grid_count = grid_count
        self.grid_size = grid_size
        self.last_price = None
        
    def next(self, bar):
        current_price = bar.close[-1]
        
        if self.last_price is None:
            self.last_price = current_price
            return
            
        price_change = (current_price - self.last_price) / self.last_price
        
        if price_change < -self.grid_size:
            for i in range(self.grid_count):
                buy_price = current_price * (1 - self.grid_size * (i + 1))
                self.buy(price=buy_price)
                
        if price_change > self.grid_size:
            for i in range(self.grid_count):
                sell_price = current_price * (1 + self.grid_size * (i + 1))
                self.sell(price=sell_price)
                
        self.last_price = current_price
`,
    createdAt: new Date('2024-03-10'),
    status: 'draft',
  },
];

// ============================================
// 市场策略 Mock 数据
// ============================================

export const MarketStrategyMocks: MarketStrategy[] = [
  {
    id: 'mkt_1',
    name: '双均线趋势策略',
    author: '量化达人A',
    description: '经典的双均线交叉策略，配合止损止盈。适用于主流币种趋势行情。',
    price: 299,
    rating: 4.8,
    purchases: 1234,
    code: '# 策略代码已隐藏',
    tags: [],
  },
  {
    id: 'mkt_2',
    name: '网格套利机器人',
    author: '套利专家B',
    description: '高胜率网格策略，适合震荡行情。自动计算网格间距，可自定义参数。',
    price: 599,
    rating: 4.9,
    purchases: 856,
    code: '# 策略代码已隐藏',
    tags: [],
  },
  {
    id: 'mkt_3',
    name: '布林带均值回归',
    author: '统计交易员',
    description: '基于布林带的均值回归策略，结合波动率自适应参数。',
    price: 199,
    rating: 4.5,
    purchases: 2103,
    code: '# 策略代码已隐藏',
    tags: [],
  },
  {
    id: 'mkt_4',
    name: '做市商对冲策略',
    author: '做市商Mike',
    description: '专业级做市策略，包含对冲机制。需具备一定技术基础。',
    price: 1299,
    rating: 4.7,
    purchases: 234,
    code: '# 策略代码已隐藏',
    tags: [],
  },
  {
    id: 'mkt_5',
    name: 'RSI超卖策略',
    author: '技术分析爱好者',
    description: '简单的RSI超卖策略，适合新手入门。参数直观可调。',
    price: 99,
    rating: 4.3,
    purchases: 3421,
    code: '# 策略代码已隐藏',
    tags: [],
  },
];

// ============================================
// 工具函数
// ============================================

/**
 * 创建新的策略 Mock
 */
export function createStrategyMock(name: string, code: string, status: StrategyData['status'] = 'ready'): StrategyData {
  return {
    id: `strategy_${Date.now()}`,
    name,
    code,
    createdAt: new Date(),
    status,
  };
}

/**
 * 创建市场策略 Mock
 */
export function createMarketStrategyMock(
  name: string,
  author: string,
  description: string,
  price: number
): MarketStrategy {
  return {
    id: `mkt_${Date.now()}`,
    name,
    author,
    description,
    price,
    rating: 0,
    purchases: 0,
    code: '# 策略代码已隐藏',
    tags: [],
  };
}

/**
 * 格式化日期
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * 格式化数字（千分位）
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

/**
 * 生成随机 ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
