/**
 * NEMT Platform - Math Utilities
 * 数学工具预设
 */

// ============================================
// 基础数学
// ============================================

/**
 * 安全除法
 */
export function safeDivide(a: number, b: number, defaultValue: number = 0): number {
  if (b === 0 || !isFinite(b)) return defaultValue;
  return a / b;
}

/**
 * 安全百分比计算
 */
export function safePercent(value: number, total: number, decimals: number = 2): number {
  if (total === 0 || !isFinite(total)) return 0;
  return roundTo(value / total * 100, decimals);
}

/**
 * 四舍五入
 */
export function roundTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * 向下取整
 */
export function floorTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.floor(value * multiplier) / multiplier;
}

/**
 * 向上取整
 */
export function ceilTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.ceil(value * multiplier) / multiplier;
}

/**
 * 限制范围
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 线性插值
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * 反向线性插值
 */
export function inverseLerp(start: number, end: number, value: number): number {
  if (start === end) return 0;
  return clamp((value - start) / (end - start), 0, 1);
}

// ============================================
// 统计计算
// ============================================

/**
 * 计算平均值
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * 计算中位数
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

/**
 * 计算标准差
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const avg = mean(values);
  const squareDiffs = values.map(v => Math.pow(v - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  
  return Math.sqrt(avgSquareDiff);
}

/**
 * 计算方差
 */
export function variance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const avg = mean(values);
  const squareDiffs = values.map(v => Math.pow(v - avg, 2));
  
  return mean(squareDiffs);
}

/**
 * 计算最大值
 */
export function max(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

/**
 * 计算最小值
 */
export function min(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

/**
 * 计算数组范围
 */
export function range(values: number[]): number {
  return max(values) - min(values);
}

// ============================================
// 金融计算
// ============================================

/**
 * 计算复利
 */
export function compoundInterest(
  principal: number,
  rate: number,
  periods: number,
  frequency: number = 12
): number {
  return principal * Math.pow(1 + rate / frequency, periods * frequency);
}

/**
 * 计算现值
 */
export function presentValue(
  futureValue: number,
  rate: number,
  periods: number,
  frequency: number = 12
): number {
  return futureValue / Math.pow(1 + rate / frequency, periods * frequency);
}

/**
 * 计算内部收益率 (IRR)
 */
export function irr(cashFlows: number[], guess: number = 0.1): number {
  const maxIterations = 100;
  const tolerance = 1e-7;
  
  let rate = guess;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = cashFlows[0];
    let dnpv = 0;
    
    for (let j = 1; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + rate, j);
      dnpv -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
    }
    
    const newRate = rate - npv / dnpv;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }
    
    rate = newRate;
  }
  
  return rate;
}

/**
 * 计算净现值 (NPV)
 */
export function npv(rate: number, cashFlows: number[]): number {
  return cashFlows.reduce((npv, cf, i) => {
    return npv + cf / Math.pow(1 + rate, i);
  }, 0);
}

/**
 * 计算夏普比率
 */
export function sharpeRatio(
  returns: number[],
  riskFreeRate: number = 0
): number {
  if (returns.length === 0) return 0;
  
  const avgReturn = mean(returns);
  const stdDev = standardDeviation(returns);
  
  if (stdDev === 0) return 0;
  
  return (avgReturn - riskFreeRate) / stdDev;
}

/**
 * 计算索提诺比率
 */
export function sortinoRatio(
  returns: number[],
  riskFreeRate: number = 0,
  targetReturn: number = 0
): number {
  if (returns.length === 0) return 0;
  
  const avgReturn = mean(returns);
  const downsideReturns = returns.filter(r => r < targetReturn);
  
  if (downsideReturns.length === 0) return 0;
  
  const downsideStdDev = standardDeviation(downsideReturns);
  
  if (downsideStdDev === 0) return 0;
  
  return (avgReturn - riskFreeRate) / downsideStdDev;
}

/**
 * 计算最大回撤
 */
export function maxDrawdown(equityCurve: number[]): { value: number; peak: number; trough: number } {
  if (equityCurve.length === 0) {
    return { value: 0, peak: 0, trough: 0 };
  }
  
  let peak = equityCurve[0];
  let trough = equityCurve[0];
  let maxDD = 0;
  let peakIndex = 0;
  let troughIndex = 0;
  
  for (let i = 1; i < equityCurve.length; i++) {
    if (equityCurve[i] > peak) {
      peak = equityCurve[i];
      peakIndex = i;
    }
    
    const drawdown = (peak - equityCurve[i]) / peak;
    
    if (drawdown > maxDD) {
      maxDD = drawdown;
      trough = equityCurve[i];
      troughIndex = i;
    }
  }
  
  return { value: maxDD, peak: peakIndex, trough: troughIndex };
}

/**
 * 计算卡尔马比率
 */
export function calmarRatio(returns: number[], maxDD: number): number {
  if (maxDD === 0) return 0;
  
  const annualReturn = mean(returns) * 252; // 假设日收益
  return annualReturn / maxDD;
}

/**
 * 计算盈亏比
 */
export function profitFactor(wins: number[], losses: number[]): number {
  const totalWins = wins.reduce((sum, w) => sum + w, 0);
  const totalLosses = Math.abs(losses.reduce((sum, l) => sum + l, 0));
  
  if (totalLosses === 0) return totalWins > 0 ? Infinity : 0;
  
  return totalWins / totalLosses;
}

/**
 * 计算胜率
 */
export function winRate(trades: { pnl: number }[]): number {
  if (trades.length === 0) return 0;
  
  const wins = trades.filter(t => t.pnl > 0).length;
  return wins / trades.length;
}

/**
 * 计算期望收益
 */
export function expectancy(
  winRate: number,
  avgWin: number,
  avgLoss: number
): number {
  return winRate * avgWin - (1 - winRate) * avgLoss;
}

// ============================================
// 波动率计算
// ============================================

/**
 * 计算历史波动率
 */
export function historicalVolatility(prices: number[], periods: number = 20): number {
  if (prices.length < periods + 1) return 0;
  
  // 计算收益率
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }
  
  // 取最近 periods 个收益率
  const recentReturns = returns.slice(-periods);
  
  // 计算标准差
  const stdDev = standardDeviation(recentReturns);
  
  // 年化波动率 (假设日波动率，年化 252 天)
  return stdDev * Math.sqrt(252);
}

/**
 * 计算移动标准差
 */
export function movingStandardDeviation(
  values: number[],
  period: number
): number[] {
  if (values.length < period) return [];
  
  const result: number[] = [];
  
  for (let i = period - 1; i < values.length; i++) {
    const window = values.slice(i - period + 1, i + 1);
    result.push(standardDeviation(window));
  }
  
  return result;
}

// ============================================
// 价格计算
// ============================================

/**
 * 计算价格变化百分比
 */
export function priceChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * 计算目标价格（基于百分比变化）
 */
export function targetPrice(price: number, percentChange: number): number {
  return price * (1 + percentChange / 100);
}

/**
 * 计算止损价格
 */
export function stopLossPrice(price: number, percentChange: number): number {
  return price * (1 - Math.abs(percentChange) / 100);
}

/**
 * 计算止盈价格
 */
export function takeProfitPrice(price: number, percentChange: number): number {
  return price * (1 + Math.abs(percentChange) / 100);
}

/**
 * 计算追踪止损价格
 */
export function trailingStopPrice(
  currentPrice: number,
  highestPrice: number,
  trailPercent: number
): number {
  return highestPrice * (1 - trailPercent / 100);
}

// ============================================
// 数量计算
// ============================================

/**
 * 计算订单数量（基于资金比例）
 */
export function calculateQuantityByPercent(
  totalBalance: number,
  percent: number,
  price: number
): number {
  const amount = totalBalance * (percent / 100);
  return safeDivide(amount, price);
}

/**
 * 计算最大可买数量
 */
export function maxBuyQuantity(
  balance: number,
  price: number,
  feeRate: number = 0
): number {
  const effectivePrice = price * (1 + feeRate);
  return safeDivide(balance, effectivePrice);
}

/**
 * 计算最大可卖数量
 */
export function maxSellQuantity(
  holding: number,
  availablePercent: number = 100
): number {
  return holding * (availablePercent / 100);
}

// ============================================
// 数学常量
// ============================================

export const MathConstants = {
  PI: Math.PI,
  E: Math.E,
  LN2: Math.LN2,
  LN10: Math.LN10,
  LOG2E: Math.LOG2E,
  LOG10E: Math.LOG10E,
  SQRT1_2: Math.SQRT1_2,
  SQRT2: Math.SQRT2,
  
  // 百分比
  PERCENT_100: 100,
  BASIS_POINTS: 10000,
  
  // 年化天数
  TRADING_DAYS_YEAR: 252,
  DAYS_YEAR: 365,
  HOURS_YEAR: 8760,
  
  // 其他
  INFINITY: Infinity,
  NEG_INFINITY: -Infinity,
};
