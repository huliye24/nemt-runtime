/**
 * NEMT Platform - Formatter Presets
 * 格式化工具预设
 */

// ============================================
// 数字格式化
// ============================================

/**
 * 格式化数字，添加千分位分隔符
 */
export function formatNumber(
  value: number,
  options: {
    decimals?: number;
    thousandSeparator?: string;
    decimalSeparator?: string;
    prefix?: string;
    suffix?: string;
  } = {}
): string {
  const {
    decimals = 2,
    thousandSeparator = ',',
    decimalSeparator = '.',
    prefix = '',
    suffix = '',
  } = options;

  const [intPart, decPart] = Math.abs(value).toFixed(decimals).split('.');
  
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  const formattedDec = decPart || '';
  
  const sign = value < 0 ? '-' : '';
  const formatted = formattedDec
    ? `${formattedInt}${decimalSeparator}${formattedDec}`
    : formattedInt;
  
  return `${sign}${prefix}${formatted}${suffix}`;
}

/**
 * 格式化货币
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  options: {
    decimals?: number;
    showSymbol?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { decimals = 2, showSymbol = true, compact = false } = options;
  
  // 货币符号映射
  const currencySymbols: Record<string, string> = {
    USD: '$',
    CNY: '¥',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    KRW: '₩',
    BTC: '₿',
    ETH: 'Ξ',
    USDT: '$',
    USDC: '$',
  };
  
  let symbol = showSymbol ? (currencySymbols[currency] || currency) : '';
  
  // 紧凑格式
  if (compact) {
    const formatted = formatCompact(value);
    return `${symbol}${formatted}`;
  }
  
  return `${symbol}${formatNumber(value, { decimals })}`;
}

/**
 * 格式化紧凑数字 (1K, 1M, 1B)
 */
export function formatCompact(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e12) {
    return `${sign}${(absValue / 1e12).toFixed(2)}T`;
  }
  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(2)}B`;
  }
  if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(2)}M`;
  }
  if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(2)}K`;
  }
  return `${sign}${absValue.toFixed(2)}`;
}

/**
 * 格式化百分比
 */
export function formatPercent(
  value: number,
  options: {
    decimals?: number;
    showSign?: boolean;
    showSymbol?: boolean;
  } = {}
): string {
  const { decimals = 2, showSign = false, showSymbol = true } = options;
  
  const sign = showSign && value > 0 ? '+' : '';
  const symbol = showSymbol ? '%' : '';
  
  return `${sign}${value.toFixed(decimals)}${symbol}`;
}

/**
 * 格式化盈亏（带颜色提示）
 */
export function formatPnL(
  value: number,
  options: {
    currency?: string;
    showSign?: boolean;
    decimals?: number;
  } = {}
): { text: string; type: 'profit' | 'loss' | 'neutral' } {
  const { currency = 'USD', showSign = true, decimals = 2 } = options;
  
  const text = formatCurrency(Math.abs(value), currency, { decimals });
  const sign = showSign && value > 0 ? '+' : value < 0 ? '-' : '';
  
  if (value > 0) {
    return { text: `${sign}${text}`, type: 'profit' };
  }
  if (value < 0) {
    return { text: `${sign}${text}`, type: 'loss' };
  }
  return { text: text, type: 'neutral' };
}

// ============================================
// 日期格式化
// ============================================

/**
 * 格式化日期
 */
export function formatDate(
  date: Date | number,
  format: 'full' | 'date' | 'time' | 'datetime' | 'short' | 'iso' = 'datetime'
): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  switch (format) {
    case 'full':
      return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
    case 'date':
      return `${year}-${month}-${day}`;
    case 'time':
      return `${hours}:${minutes}:${seconds}`;
    case 'datetime':
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    case 'short':
      return `${month}/${day} ${hours}:${minutes}`;
    case 'iso':
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}

/**
 * 格式化相对时间 (刚刚、5分钟前、1小时前等)
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  if (weeks < 4) return `${weeks}周前`;
  if (months < 12) return `${months}月前`;
  return `${years}年前`;
}

/**
 * 格式化持续时间
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}天 ${hours % 24}小时`;
  }
  if (hours > 0) {
    return `${hours}小时 ${minutes % 60}分钟`;
  }
  if (minutes > 0) {
    return `${minutes}分钟 ${seconds % 60}秒`;
  }
  return `${seconds}秒`;
}

// ============================================
// 文件大小格式化
// ============================================

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

// ============================================
// 格式化配置预设
// ============================================

export const NumberFormatPresets = {
  // 标准格式
  standard: {
    decimals: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
  },
  
  // 紧凑格式
  compact: {
    decimals: 1,
    compact: true,
  },
  
  // 整数格式
  integer: {
    decimals: 0,
  },
  
  // 百分比格式
  percent: {
    decimals: 2,
    suffix: '%',
  },
  
  // 科学计数
  scientific: {
    notation: 'scientific',
    decimals: 2,
  },
};

export const DateFormatPresets = {
  // ISO 格式
  iso: 'YYYY-MM-DDTHH:mm:ss',
  
  // 标准格式
  standard: 'YYYY-MM-DD HH:mm:ss',
  
  // 短格式
  short: 'MM/DD HH:mm',
  
  // 日期格式
  date: 'YYYY-MM-DD',
  
  // 时间格式
  time: 'HH:mm:ss',
  
  // 中文格式
  chinese: 'YYYY年MM月DD日 HH:mm',
};

// ============================================
// 工具函数
// ============================================

/**
 * 截断文本
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * 格式化订单簿价格
 */
export function formatOrderPrice(price: number, precision: number = 8): string {
  return price.toFixed(Math.min(precision, 8));
}

/**
 * 格式化订单簿数量
 */
export function formatOrderQuantity(quantity: number, precision: number = 8): string {
  return quantity.toFixed(Math.min(precision, 8));
}

/**
 * 格式化滑点
 */
export function formatSlippage(slippage: number): string {
  return `${(slippage * 100).toFixed(3)}%`;
}

/**
 * 格式化收益率
 */
export function formatReturn(value: number, decimals: number = 2): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * 格式化交易对显示
 */
export function formatSymbol(symbol: string): string {
  // BTC/USDT -> BTC/USDT
  if (symbol.includes('/')) return symbol;
  
  // BTCUSDT -> BTC/USDT
  const baseQuote = splitSymbol(symbol);
  if (baseQuote) {
    return `${baseQuote.base}/${baseQuote.quote}`;
  }
  
  return symbol;
}

/**
 * 分割交易对
 */
export function splitSymbol(symbol: string): { base: string; quote: string } | null {
  const quoteCurrencies = ['USDT', 'USDC', 'USD', 'BTC', 'ETH', 'BNB', 'BUSD'];
  
  for (const quote of quoteCurrencies) {
    if (symbol.endsWith(quote)) {
      const base = symbol.slice(0, -quote.length);
      if (base && base.length <= 10) {
        return { base, quote };
      }
    }
  }
  
  return null;
}

/**
 * 格式化数量带单位
 */
export function formatQuantityWithUnit(quantity: number, symbol: string): string {
  const formatted = formatNumber(quantity, { decimals: 4 });
  
  // 如果是币种单位
  const units: Record<string, string> = {
    BTC: ' BTC',
    ETH: ' ETH',
    USDT: ' USDT',
    USDC: ' USDC',
  };
  
  return units[symbol] ? `${formatted}${units[symbol]}` : formatted;
}

/**
 * 格式化地址（钱包地址等）
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
