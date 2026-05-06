/**
 * NEMT Platform - Date Utilities
 * 日期工具函数预设
 */

// ============================================
// 基础日期工具
// ============================================

/**
 * 获取当前时间戳（毫秒）
 */
export function now(): number {
  return Date.now();
}

/**
 * 获取当前时间戳（秒）
 */
export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * 创建日期对象
 */
export function createDate(year?: number, month?: number, day?: number, hours?: number, minutes?: number, seconds?: number): Date {
  return new Date(year || 0, (month || 1) - 1, day || 1, hours || 0, minutes || 0, seconds || 0);
}

/**
 * 日期转时间戳
 */
export function toTimestamp(date: Date | number): number {
  return typeof date === 'number' ? date : date.getTime();
}

/**
 * 时间戳转日期
 */
export function fromTimestamp(timestamp: number): Date {
  return new Date(timestamp);
}

// ============================================
// 日期解析
// ============================================

/**
 * 解析日期字符串
 */
export function parseDate(dateStr: string): Date | null {
  // ISO 格式
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return new Date(dateStr);
  }
  
  // 中文格式 YYYY年MM月DD日
  if (/^\d{4}年\d{1,2}月\d{1,2}日/.test(dateStr)) {
    const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (match) {
      return createDate(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
    }
  }
  
  // Unix 时间戳
  if (/^\d{10}$/.test(dateStr)) {
    return new Date(parseInt(dateStr) * 1000);
  }
  
  if (/^\d{13}$/.test(dateStr)) {
    return new Date(parseInt(dateStr));
  }
  
  return null;
}

/**
 * 解析时间范围字符串
 */
export function parseTimeRange(rangeStr: string): { start: number; end: number } | null {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  const ranges: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': day,
    '7d': 7 * day,
    '30d': 30 * day,
    '90d': 90 * day,
    '1y': 365 * day,
  };
  
  const ms = ranges[rangeStr];
  if (ms) {
    return { start: now - ms, end: now };
  }
  
  return null;
}

// ============================================
// 日期计算
// ============================================

/**
 * 日期加减
 */
export function addTime(date: Date | number, amount: number, unit: 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y'): Date {
  const d = typeof date === 'number' ? new Date(date) : new Date(date);
  
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    M: 30 * 24 * 60 * 60 * 1000,
    y: 365 * 24 * 60 * 60 * 1000,
  };
  
  return new Date(d.getTime() + amount * multipliers[unit]);
}

/**
 * 获取日期开始时间
 */
export function startOfDay(date: Date | number): Date {
  const d = typeof date === 'number' ? new Date(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取日期结束时间
 */
export function endOfDay(date: Date | number): Date {
  const d = typeof date === 'number' ? new Date(date) : new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 获取月份开始
 */
export function startOfMonth(date: Date | number): Date {
  const d = typeof date === 'number' ? new Date(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * 获取月份结束
 */
export function endOfMonth(date: Date | number): Date {
  const d = typeof date === 'number' ? new Date(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * 获取周开始 (周一)
 */
export function startOfWeek(date: Date | number): Date {
  const d = typeof date === 'number' ? new Date(date) : new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取周结束 (周日)
 */
export function endOfWeek(date: Date | number): Date {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ============================================
// 日期比较
// ============================================

/**
 * 判断是否是同一天
 */
export function isSameDay(date1: Date | number, date2: Date | number): boolean {
  const d1 = typeof date1 === 'number' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'number' ? new Date(date2) : date2;
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * 判断是否是今天
 */
export function isToday(date: Date | number): boolean {
  return isSameDay(date, new Date());
}

/**
 * 判断是否是昨天
 */
export function isYesterday(date: Date | number): boolean {
  const yesterday = addTime(new Date(), -1, 'd');
  return isSameDay(date, yesterday);
}

/**
 * 判断是否是明天
 */
export function isTomorrow(date: Date | number): boolean {
  const tomorrow = addTime(new Date(), 1, 'd');
  return isSameDay(date, tomorrow);
}

/**
 * 判断是否在本周
 */
export function isThisWeek(date: Date | number): boolean {
  const start = startOfWeek(new Date());
  const end = endOfWeek(new Date());
  const d = typeof date === 'number' ? new Date(date) : date;
  return d >= start && d <= end;
}

/**
 * 判断是否在本月
 */
export function isThisMonth(date: Date | number): boolean {
  const d = typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

/**
 * 计算两个日期之间的天数
 */
export function daysBetween(date1: Date | number, date2: Date | number): number {
  const d1 = typeof date1 === 'number' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'number' ? new Date(date2) : date2;
  
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

/**
 * 计算两个日期之间的小时数
 */
export function hoursBetween(date1: Date | number, date2: Date | number): number {
  const d1 = typeof date1 === 'number' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'number' ? new Date(date2) : date2;
  
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diff / (60 * 60 * 1000));
}

// ============================================
// 时间范围
// ============================================

/**
 * 获取时间范围
 */
export function getTimeRange(range: string): { start: Date; end: Date } {
  const now = new Date();
  const end = endOfDay(now);
  
  switch (range) {
    case 'today':
      return { start: startOfDay(now), end };
    case 'yesterday':
      const yesterday = addTime(now, -1, 'd');
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    case '7d':
      return { start: startOfDay(addTime(now, -7, 'd')), end };
    case '30d':
      return { start: startOfDay(addTime(now, -30, 'd')), end };
    case '90d':
      return { start: startOfDay(addTime(now, -90, 'd')), end };
    case '1y':
      return { start: startOfDay(addTime(now, -365, 'd')), end };
    case 'this_week':
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case 'this_month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'last_month':
      const lastMonth = addTime(now, -1, 'M');
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    default:
      return { start: startOfDay(addTime(now, -7, 'd')), end };
  }
}

/**
 * 获取K线周期的时间范围
 */
export function getCandleTimeRange(
  interval: string,
  count: number
): { start: number; end: number } {
  const now = Date.now();
  const intervalMs = getIntervalMs(interval);
  const totalMs = intervalMs * count;
  
  return {
    start: now - totalMs,
    end: now,
  };
}

/**
 * 获取周期毫秒数
 */
export function getIntervalMs(interval: string): number {
  const intervals: Record<string, number> = {
    '1m': 60 * 1000,
    '3m': 3 * 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '2h': 2 * 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '8h': 8 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '3d': 3 * 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000,
  };
  
  return intervals[interval] || 60 * 60 * 1000;
}

// ============================================
// 格式化
// ============================================

/**
 * 格式化日期为中文
 */
export function formatDateChinese(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/**
 * 格式化时间为中文
 */
export function formatTimeChinese(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return `${d.getHours()}时${d.getMinutes()}分${d.getSeconds()}秒`;
}

/**
 * 格式化完整中文日期时间
 */
export function formatDateTimeChinese(date: Date | number): string {
  return `${formatDateChinese(date)} ${formatTimeChinese(date)}`;
}

/**
 * 格式化为相对时间
 */
export function formatTimeAgo(date: Date | number): string {
  const now = Date.now();
  const d = typeof date === 'number' ? date : date.getTime();
  const diff = now - d;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}月前`;
  return `${Math.floor(days / 365)}年前`;
}

/**
 * 格式化为剩余时间
 */
export function formatTimeRemaining(targetDate: Date | number): string {
  const now = Date.now();
  const target = typeof targetDate === 'number' ? targetDate : targetDate.getTime();
  const diff = target - now;
  
  if (diff <= 0) return '已结束';
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天${hours % 24}小时`;
  if (hours > 0) return `${hours}小时${minutes % 60}分钟`;
  if (minutes > 0) return `${minutes}分钟`;
  return `${seconds}秒`;
}

// ============================================
// 时间区间相关
// ============================================

/**
 * 获取交易日列表
 */
export function getTradingDays(startDate: Date, endDate: Date, excludeWeekends: boolean = true): Date[] {
  const days: Date[] = [];
  let current = startOfDay(startDate);
  const end = endOfDay(endDate);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (!excludeWeekends || !isWeekend) {
      days.push(new Date(current));
    }
    
    current = addTime(current, 1, 'd');
  }
  
  return days;
}

/**
 * 获取下一个交易日
 */
export function getNextTradingDay(date: Date, excludeWeekends: boolean = true): Date {
  let next = addTime(date, 1, 'd');
  
  if (excludeWeekends) {
    while (next.getDay() === 0 || next.getDay() === 6) {
      next = addTime(next, 1, 'd');
    }
  }
  
  return next;
}

/**
 * 获取上一个交易日
 */
export function getPreviousTradingDay(date: Date, excludeWeekends: boolean = true): Date {
  let prev = addTime(date, -1, 'd');
  
  if (excludeWeekends) {
    while (prev.getDay() === 0 || prev.getDay() === 6) {
      prev = addTime(prev, -1, 'd');
    }
  }
  
  return prev;
}

// ============================================
// 时间戳转换
// ============================================

/**
 * UTC 时间转本地时间戳
 */
export function utcToLocal(utcTimestamp: number): number {
  return utcTimestamp + new Date().getTimezoneOffset() * 60 * 1000;
}

/**
 * 本地时间转 UTC 时间戳
 */
export function localToUtc(localDate: Date | number): number {
  const d = typeof localDate === 'number' ? new Date(localDate) : localDate;
  return d.getTime() - new Date().getTimezoneOffset() * 60 * 1000;
}

/**
 * 交易时间戳 (UTC+8)
 */
export function toChinaTime(timestamp: number): number {
  return timestamp + 8 * 60 * 60 * 1000;
}

/**
 * 从中国时间获取 UTC 时间戳
 */
export function fromChinaTime(chinaDate: Date | number): number {
  const d = typeof chinaDate === 'number' ? new Date(chinaDate) : chinaDate;
  return d.getTime() - 8 * 60 * 60 * 1000;
}
