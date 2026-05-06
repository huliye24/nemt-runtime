/**
 * NEMT Platform - Trading Time Presets
 * 交易时间预设
 */

// ============================================
// 交易所交易时间
// ============================================

export interface ExchangeTradingHours {
  exchange: string;
  timezone: string;
  regular: {
    open: string;  // HH:mm
    close: string; // HH:mm
    days: number[]; // 0=周日, 1=周一, ..., 6=周六
  };
  preMarket?: {
    open: string;
    close: string;
  };
  afterHours?: {
    open: string;
    close: string;
  };
  holidays: string[]; // YYYY-MM-DD 格式的假期
}

export const ExchangeTradingHoursConfig: ExchangeTradingHours[] = [
  {
    exchange: 'Binance',
    timezone: 'UTC',
    regular: {
      open: '00:00',
      close: '23:59', // 24/7
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    holidays: [],
  },
  {
    exchange: 'Bybit',
    timezone: 'UTC',
    regular: {
      open: '00:00',
      close: '23:59', // 24/7
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    holidays: [],
  },
  {
    exchange: 'OKX',
    timezone: 'UTC',
    regular: {
      open: '00:00',
      close: '23:59', // 24/7
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    holidays: [],
  },
  {
    exchange: 'Coinbase',
    timezone: 'America/New_York',
    regular: {
      open: '09:30',
      close: '16:00',
      days: [1, 2, 3, 4, 5], // 周一到周五
    },
    preMarket: {
      open: '04:00',
      close: '09:30',
    },
    afterHours: {
      open: '16:00',
      close: '20:00',
    },
    holidays: [], // 美国节假日
  },
  {
    exchange: 'NYSE',
    timezone: 'America/New_York',
    regular: {
      open: '09:30',
      close: '16:00',
      days: [1, 2, 3, 4, 5],
    },
    preMarket: {
      open: '04:00',
      close: '09:30',
    },
    afterHours: {
      open: '16:00',
      close: '20:00',
    },
    holidays: [
      '2024-01-01', // 元旦
      '2024-01-15', // 马丁·路德·金纪念日
      '2024-02-19', // 总统日
      '2024-03-29', // 耶稣受难日
      '2024-05-27', // 阵亡将士纪念日
      '2024-06-19', // 六月节
      '2024-07-04', // 独立日
      '2024-09-02', // 劳动节
      '2024-11-28', // 感恩节
      '2024-12-25', // 圣诞节
    ],
  },
  {
    exchange: 'NASDAQ',
    timezone: 'America/New_York',
    regular: {
      open: '09:30',
      close: '16:00',
      days: [1, 2, 3, 4, 5],
    },
    preMarket: {
      open: '04:00',
      close: '09:30',
    },
    afterHours: {
      open: '16:00',
      close: '20:00',
    },
    holidays: [], // 同 NYSE
  },
  {
    exchange: 'HKEX',
    timezone: 'Asia/Hong_Kong',
    regular: {
      open: '09:30',
      close: '16:00',
      days: [1, 2, 3, 4, 5],
    },
    holidays: [
      '2024-01-01', // 元旦
      '2024-02-10', // 农历新年
      '2024-02-12', // 农历新年
      '2024-02-13', // 农历新年
      '2024-04-04', // 清明节
      '2024-04-05', // 清明节
      '2024-05-01', // 劳动节
      '2024-05-15', // 佛诞
      '2024-06-10', // 端午节
      '2024-09-18', // 中秋节
      '2024-10-01', // 国庆日
      '2024-10-11', // 重阳节
      '2024-12-25', // 圣诞节
      '2024-12-26', // 圣诞节后第一个周日
    ],
  },
  {
    exchange: 'SSE',
    timezone: 'Asia/Shanghai',
    regular: {
      open: '09:30',
      close: '15:00',
      days: [1, 2, 3, 4, 5],
    },
    holidays: [
      '2024-01-01', // 元旦
      '2024-02-10', // 春节
      '2024-02-12', // 春节
      '2024-02-13', // 春节
      '2024-02-14', // 春节
      '2024-02-15', // 春节
      '2024-02-16', // 春节
      '2024-04-04', // 清明节
      '2024-04-05', // 清明节
      '2024-05-01', // 劳动节
      '2024-06-10', // 端午节
      '2024-09-17', // 中秋节
      '2024-10-01', // 国庆节
      '2024-10-02', // 国庆节
      '2024-10-03', // 国庆节
      '2024-10-04', // 国庆节
      '2024-10-07', // 国庆节
    ],
  },
];

// ============================================
// K线周期预设
// ============================================

export interface TimeframePreset {
  id: string;
  label: string;
  labelEn: string;
  seconds: number;
  category: 'minute' | 'hour' | 'day' | 'week' | 'month';
  description: string;
}

export const TimeframePresets: TimeframePreset[] = [
  // 分钟级
  { id: '1m', label: '1 分钟', labelEn: '1 Minute', seconds: 60, category: 'minute', description: '超短期趋势' },
  { id: '3m', label: '3 分钟', labelEn: '3 Minutes', seconds: 180, category: 'minute', description: '短期日内' },
  { id: '5m', label: '5 分钟', labelEn: '5 Minutes', seconds: 300, category: 'minute', description: '短期交易' },
  { id: '15m', label: '15 分钟', labelEn: '15 Minutes', seconds: 900, category: 'minute', description: '短期趋势' },
  { id: '30m', label: '30 分钟', labelEn: '30 Minutes', seconds: 1800, category: 'minute', description: '中短期趋势' },
  
  // 小时级
  { id: '1h', label: '1 小时', labelEn: '1 Hour', seconds: 3600, category: 'hour', description: '日内到短期' },
  { id: '2h', label: '2 小时', labelEn: '2 Hours', seconds: 7200, category: 'hour', description: '短期趋势' },
  { id: '4h', label: '4 小时', labelEn: '4 Hours', seconds: 14400, category: 'hour', description: '中期趋势' },
  { id: '6h', label: '6 小时', labelEn: '6 Hours', seconds: 21600, category: 'hour', description: '中期趋势' },
  { id: '8h', label: '8 小时', labelEn: '8 Hours', seconds: 28800, category: 'hour', description: '波段交易' },
  { id: '12h', label: '12 小时', labelEn: '12 Hours', seconds: 43200, category: 'hour', description: '波段交易' },
  
  // 日级
  { id: '1d', label: '1 日', labelEn: '1 Day', seconds: 86400, category: 'day', description: '短期到中期' },
  { id: '3d', label: '3 日', labelEn: '3 Days', seconds: 259200, category: 'day', description: '中期趋势' },
  { id: '1w', label: '1 周', labelEn: '1 Week', seconds: 604800, category: 'week', description: '中期到长期' },
  
  // 月级
  { id: '1M', label: '1 月', labelEn: '1 Month', seconds: 2592000, category: 'month', description: '长期趋势' },
];

// ============================================
// 交易时段
// ============================================

export interface TradingSession {
  name: string;
  nameEn: string;
  start: string; // HH:mm
  end: string;    // HH:mm
  description: string;
  volatility: 'low' | 'medium' | 'high';
}

export const TradingSessions: TradingSession[] = [
  {
    name: '亚洲时段',
    nameEn: 'Asia Session',
    start: '00:00',
    end: '08:00',
    description: '东京、香港、新加坡市场活跃',
    volatility: 'medium',
  },
  {
    name: '欧洲时段',
    nameEn: 'Europe Session',
    start: '07:00',
    end: '16:00',
    description: '伦敦、法兰克福市场活跃',
    volatility: 'high',
  },
  {
    name: '美洲时段',
    nameEn: 'America Session',
    start: '13:30',
    end: '20:00',
    description: '纽约市场活跃，波动最大',
    volatility: 'high',
  },
  {
    name: '盘后交易',
    nameEn: 'After Hours',
    start: '16:00',
    end: '20:00',
    description: '美股盘后交易',
    volatility: 'low',
  },
];

// ============================================
// 时区预设
// ============================================

export interface TimezonePreset {
  id: string;
  label: string;
  offset: string;
  cities: string[];
}

export const TimezonePresets: TimezonePreset[] = [
  { id: 'UTC', label: 'UTC', offset: '+00:00', cities: ['伦敦', '都柏林'] },
  { id: 'America/New_York', label: '纽约 (EST/EDT)', offset: '-05:00/-04:00', cities: ['纽约', '多伦多'] },
  { id: 'America/Los_Angeles', label: '洛杉矶 (PST/PDT)', offset: '-08:00/-07:00', cities: ['洛杉矶', '旧金山'] },
  { id: 'Asia/Hong_Kong', label: '香港 (HKT)', offset: '+08:00', cities: ['香港', '新加坡', '上海'] },
  { id: 'Asia/Tokyo', label: '东京 (JST)', offset: '+09:00', cities: ['东京', '首尔'] },
  { id: 'Asia/Shanghai', label: '上海 (CST)', offset: '+08:00', cities: ['上海', '北京'] },
  { id: 'Europe/London', label: '伦敦 (GMT/BST)', offset: '+00:00/+01:00', cities: ['伦敦', '法兰克福'] },
  { id: 'Europe/Paris', label: '巴黎 (CET/CEST)', offset: '+01:00/+02:00', cities: ['巴黎', '阿姆斯特丹'] },
];

// ============================================
// 回测时间范围预设
// ============================================

export interface BacktestPeriodPreset {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  days: number;
  description: string;
}

export function getBacktestPeriodPresets(): BacktestPeriodPreset[] {
  const now = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  
  const presets: BacktestPeriodPreset[] = [
    {
      id: '1m',
      label: '最近 1 个月',
      startDate: formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(now),
      days: 30,
      description: '快速验证策略思路',
    },
    {
      id: '3m',
      label: '最近 3 个月',
      startDate: formatDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(now),
      days: 90,
      description: '短期策略验证',
    },
    {
      id: '6m',
      label: '最近 6 个月',
      startDate: formatDate(new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(now),
      days: 180,
      description: '半年期验证',
    },
    {
      id: '1y',
      label: '最近 1 年',
      startDate: formatDate(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(now),
      days: 365,
      description: '完整牛熊周期',
    },
    {
      id: '2y',
      label: '最近 2 年',
      startDate: formatDate(new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(now),
      days: 730,
      description: '长期验证',
    },
    {
      id: 'all',
      label: '全部历史数据',
      startDate: '2017-01-01', // BTC 历史数据开始
      endDate: formatDate(now),
      days: Math.floor((now.getTime() - new Date('2017-01-01').getTime()) / (24 * 60 * 60 * 1000)),
      description: '最大数据范围',
    },
  ];
  
  return presets;
}

// ============================================
// 工具函数
// ============================================

/**
 * 检查当前是否在交易时间内
 */
export function isWithinTradingHours(
  hours: ExchangeTradingHours,
  now: Date = new Date()
): boolean {
  const dayOfWeek = now.getDay();
  const currentTime = now.toLocaleTimeString('en-GB', { 
    timeZone: hours.timezone, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // 检查是否为交易日
  if (!hours.regular.days.includes(dayOfWeek)) {
    return false;
  }
  
  // 检查是否为假期
  const dateStr = now.toISOString().split('T')[0];
  if (hours.holidays.includes(dateStr)) {
    return false;
  }
  
  // 检查交易时间
  return currentTime >= hours.regular.open && currentTime <= hours.regular.close;
}

/**
 * 获取时间段分类
 */
export function getTimeframeCategory(interval: string): TimeframePreset['category'] {
  const tf = TimeframePresets.find(t => t.id === interval);
  return tf?.category || 'minute';
}

/**
 * 格式化时间
 */
export function formatTradingTime(time: string, timezone: string): string {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}
