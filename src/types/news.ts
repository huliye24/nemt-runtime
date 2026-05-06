/**
 * NEMT Platform - News Types
 * 新闻事件相关类型定义
 */

/**
 * 新闻来源
 */
export type NewsSource = 
  | 'official'       // 官方公告
  | 'media'         // 媒体
  | 'social'        // 社交媒体
  | 'regulatory'   // 监管
  | 'analytics';    // 分析

/**
 * 情绪类型
 */
export type SentimentType = 
  | 'very_bearish'  // 极度看跌
  | 'bearish'       // 看跌
  | 'neutral'       // 中性
  | 'bullish'       // 看涨
  | 'very_bullish'; // 极度看涨

/**
 * 影响范围
 */
export type ImpactScope = 
  | 'global'        // 全球市场
  | 'sector'        // 特定板块
  | 'specific'      // 特定资产
  | 'exchange';     // 特定交易所

/**
 * 新闻事件
 */
export interface NewsEvent {
  id: string;
  
  // 基本信息
  title: string;
  summary: string;
  content: string;
  source: NewsSource;
  sourceName: string;
  sourceUrl?: string;
  author?: string;
  
  // 分类
  categories: string[];
  tags: string[];
  
  // 相关资产
  relatedAssets: {
    type: 'symbol' | 'sector' | 'exchange';
    id: string;
    name: string;
    sentiment?: SentimentType;
  }[];
  
  // 情绪分析
  sentiment?: {
    overall: SentimentType;
    score: number;           // -1 到 1
    confidence: number;       // 置信度 0-1
    keywords: {
      word: string;
      sentiment: SentimentType;
    }[];
  };
  
  // 影响评估
  impact?: {
    scope: ImpactScope;
    magnitude: 'low' | 'medium' | 'high' | 'extreme';
    estimatedDuration?: string;
    affectedMarkets?: string[];
  };
  
  // 媒体信息
  media?: {
    images?: string[];
    videos?: string[];
  };
  
  // 统计数据
  stats?: {
    views: number;
    shares: number;
    comments: number;
    sentimentVotes?: {
      bullish: number;
      bearish: number;
      neutral: number;
    };
  };
  
  // 时间
  publishedAt: number;
  createdAt: number;
  updatedAt: number;
  
  // 关联
  relatedNews?: string[];
  relatedEvents?: string[];
}

/**
 * 新闻过滤条件
 */
export interface NewsFilter {
  // 时间范围
  startDate?: number;
  endDate?: number;
  
  // 来源
  sources?: NewsSource[];
  
  // 分类
  categories?: string[];
  tags?: string[];
  
  // 资产
  relatedAssets?: string[];
  
  // 情绪
  sentiment?: SentimentType[];
  
  // 搜索
  search?: string;
  
  // 分页
  limit?: number;
  offset?: number;
}

/**
 * 新闻列表结果
 */
export interface NewsListResult {
  items: NewsEvent[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * 新闻摘要
 */
export interface NewsSummary {
  date: string;
  
  // 数量统计
  totalNews: number;
  bySource: Record<NewsSource, number>;
  bySentiment: Record<SentimentType, number>;
  
  // 重要新闻
  importantNews: NewsEvent[];
  
  // 情绪汇总
  overallSentiment: SentimentType;
  sentimentScore: number;
  
  // 热门主题
  hotTopics: {
    topic: string;
    count: number;
    sentiment: SentimentType;
  }[];
  
  // 统计数据
  stats: {
    bullishCount: number;
    bearishCount: number;
    neutralCount: number;
  };
}

/**
 * 市场情绪
 */
export interface MarketSentiment {
  timestamp: number;
  
  // 整体情绪
  overall: SentimentType;
  score: number;             // -100 到 100
  
  // 各维度情绪
  fearGreed: number;        // 恐惧贪婪指数 0-100
  bullishPercent: number;    // 看涨比例 0-100
  putCallRatio?: number;     // 看跌/看涨比
  
  // 社交媒体情绪
  socialSentiment?: {
    platform: string;
    sentiment: SentimentType;
    score: number;
    volume: number;
  }[];
  
  // 趋势
  trend: 'improving' | 'stable' | 'declining';
  
  // 历史数据
  history: {
    timestamp: number;
    score: number;
  }[];
}

/**
 * 财经日历事件
 */
export interface CalendarEvent {
  id: string;
  
  // 事件信息
  title: string;
  description?: string;
  country: string;          // 如 'US', 'CN', 'EU'
  category: string;         // 如 'GDP', 'CPI', 'FOMC'
  
  // 时间
  eventTime: number;
  timezone: string;
  
  // 预期值
  previous: number;
  forecast: number;
  actual?: number;
  
  // 影响
  impact: 'low' | 'medium' | 'high';
  
  // 状态
  status: 'upcoming' | 'live' | 'completed';
  
  // 关联
  relatedSymbols?: string[];
}

/**
 * 公告类型
 */
export type AnnouncementType = 
  | 'listing'         // 上币公告
  | 'delisting'       // 下币公告
  | 'maintenance'     // 维护公告
  | 'partnership'     // 合作公告
  | 'update'         // 产品更新
  | 'regulatory'      // 监管公告
  | 'security';      // 安全公告

/**
 * 交易所公告
 */
export interface ExchangeAnnouncement {
  id: string;
  exchange: string;
  
  // 内容
  title: string;
  content: string;
  type: AnnouncementType;
  
  // 重要性
  importance: 'low' | 'medium' | 'high';
  
  // 相关资产
  affectedSymbols?: string[];
  
  // 时间
  publishedAt: number;
  
  // 状态
  isActive: boolean;
}

/**
 * 新闻情绪标签
 */
export const SENTIMENT_LABELS: Record<SentimentType, { label: string; color: string; emoji: string }> = {
  very_bearish: { label: '极度看跌', color: '#dc2626', emoji: '😱' },
  bearish: { label: '看跌', color: '#ef4444', emoji: '😟' },
  neutral: { label: '中性', color: '#737373', emoji: '😐' },
  bullish: { label: '看涨', color: '#22c55e', emoji: '😊' },
  very_bullish: { label: '极度看涨', color: '#16a34a', emoji: '🚀' },
};

/**
 * 新闻来源标签
 */
export const NEWS_SOURCE_LABELS: Record<NewsSource, string> = {
  official: '官方公告',
  media: '媒体报道',
  social: '社交媒体',
  regulatory: '监管动态',
  analytics: '分析观点',
};

/**
 * 影响级别标签
 */
export const IMPACT_LEVEL_LABELS: Record<ImpactScope, string> = {
  global: '全球市场',
  sector: '特定板块',
  specific: '特定资产',
  exchange: '特定交易所',
};

/**
 * 影响大小标签
 */
export const MAGNITUDE_LABELS: Record<NonNullable<NewsEvent['impact']>['magnitude'], string> = {
  low: '低',
  medium: '中等',
  high: '高',
  extreme: '极高',
};

/**
 * 公告类型标签
 */
export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  listing: '上币公告',
  delisting: '下币公告',
  maintenance: '系统维护',
  partnership: '合作公告',
  update: '产品更新',
  regulatory: '监管公告',
  security: '安全公告',
};

/**
 * 情绪分数描述
 */
export function getSentimentDescription(score: number): string {
  if (score >= 75) return '极度乐观';
  if (score >= 50) return '乐观';
  if (score >= 25) return '偏乐观';
  if (score >= -25) return '中性';
  if (score >= -50) return '偏悲观';
  if (score >= -75) return '悲观';
  return '极度悲观';
}

/**
 * 情绪分数到类型转换
 */
export function scoreToSentiment(score: number): SentimentType {
  if (score >= 60) return 'very_bullish';
  if (score >= 20) return 'bullish';
  if (score >= -20) return 'neutral';
  if (score >= -60) return 'bearish';
  return 'very_bearish';
}
