/**
 * NEMT Platform - Data Source Types
 * 数据源相关类型定义
 */

/**
 * 数据源类型
 */
export type DataSourceType = 
  | 'exchange'      // 交易所 API
  | 'aggregator'    // 数据聚合器
  | 'websocket'      // WebSocket 流
  | 'rest_api'      // REST API
  | 'database'      // 数据库
  | 'file'          // 文件
  | 'custom';       // 自定义

/**
 * 数据源状态
 */
export type DataSourceStatus = 
  | 'active'        // 正常
  | 'connecting'   // 连接中
  | 'disconnected'  // 断开
  | 'error'         // 错误
  | 'maintenance';  // 维护中

/**
 * 数据类型
 */
export type DataType = 
  | 'kline'         // K线数据
  | 'tick'          // Tick 数据
  | 'orderbook'     // 订单簿
  | 'trade'         // 成交记录
  | 'ticker'        // 行情
  | 'balance'       // 余额
  | 'position'      // 持仓
  | 'order';        // 订单

/**
 * 交易所
 */
export type Exchange = 
  | 'binance' 
  | 'bybit' 
  | 'okx'
  | 'huobi'
  | 'gate'
  | 'kucoin'
  | 'bitget'
  | 'deribit'
  | 'ftx'
  | 'coinbase';

/**
 * 数据源配置
 */
export interface DataSource {
  id: string;
  name: string;
  description?: string;
  type: DataSourceType;
  exchange?: Exchange;
  
  // 连接信息
  endpoint: string;
  apiKey?: string;
  apiSecret?: string;
  passphrase?: string; // 部分交易所需要
  additionalHeaders?: Record<string, string>;
  
  // 状态
  status: DataSourceStatus;
  lastConnectedAt?: number;
  lastErrorAt?: number;
  lastError?: string;
  errorCount: number;
  
  // 配置
  enabled: boolean;
  isDefault: boolean;
  priority: number; // 优先级，数字越小优先级越高
  
  // 数据配置
  supportedDataTypes: DataType[];
  supportedSymbols: string[];
  supportedIntervals: string[];
  
  // 限流配置
  rateLimit?: RateLimitConfig;
  
  // 代理配置
  proxyEnabled?: boolean;
  proxyUrl?: string;
  
  // 时间同步
  timeOffset?: number; // 与服务器时间偏移
  lastSyncAt?: number;
  
  // 统计
  stats: DataSourceStats;
  
  // 权限
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 数据源统计
 */
export interface DataSourceStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number; // 毫秒
  lastLatency: number;
  dataPointsReceived: number;
  lastDataReceivedAt?: number;
  uptime: number; // 秒
  downtime: number; // 秒
}

/**
 * 限流配置
 */
export interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  burstSize: number;
  retryAfter?: number; // 毫秒
}

/**
 * WebSocket 数据源配置
 */
export interface WebSocketDataSource extends DataSource {
  type: 'websocket';
  reconnectEnabled: boolean;
  reconnectInterval: number; // 毫秒
  maxReconnectAttempts: number;
  heartbeatInterval: number; // 毫秒
  heartbeatTimeout: number; // 毫秒
  subscriptions: WebSocketSubscription[];
}

export interface WebSocketSubscription {
  id: string;
  channel: string; // 如 'kline_1m_BTCUSDT'
  symbols: string[];
  dataTypes: DataType[];
  filters?: Record<string, unknown>;
  enabled: boolean;
}

/**
 * REST API 数据源配置
 */
export interface RestApiDataSource extends DataSource {
  type: 'rest_api';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  queryParams?: Record<string, string>;
  bodyParams?: Record<string, unknown>;
  authType: 'none' | 'api_key' | 'basic' | 'bearer' | 'hmac';
  retryConfig: RetryConfig;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // 毫秒
  backoffMultiplier: number;
  retryOnStatusCodes: number[];
}

/**
 * 数据源健康状态
 */
export interface DataSourceHealth {
  dataSourceId: string;
  status: DataSourceStatus;
  latency: number;
  errorRate: number;
  dataFreshness: number; // 秒
  uptimePercent: number;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  lastCheckAt: number;
}

/**
 * 数据源性能报告
 */
export interface DataSourcePerformanceReport {
  dataSourceId: string;
  period: {
    start: number;
    end: number;
  };
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  maxLatency: number;
  dataPointsReceived: number;
  costEstimate?: number;
  hourlyBreakdown: HourlyStats[];
}

export interface HourlyStats {
  hour: number;
  requests: number;
  errors: number;
  avgLatency: number;
  dataPoints: number;
}

/**
 * 数据源连接测试结果
 */
export interface ConnectionTestResult {
  dataSourceId: string;
  success: boolean;
  latency?: number;
  error?: string;
  errorCode?: string;
  timestamp: number;
  response?: {
    status: number;
    headers: Record<string, string>;
    body?: unknown;
  };
}

/**
 * 数据源批量操作
 */
export interface BatchDataSourceOperation {
  action: 'enable' | 'disable' | 'delete' | 'test';
  dataSourceIds: string[];
}

/**
 * 数据源导入/导出配置
 */
export interface DataSourceExport {
  version: string;
  exportedAt: number;
  dataSources: DataSource[];
}

/**
 * 数据源提供商
 */
export interface DataSourceProvider {
  name: string;
  type: DataSourceType;
  exchange?: Exchange;
  logo?: string;
  description: string;
  features: string[];
  documentationUrl?: string;
  apiKeyRequired: boolean;
  defaultEndpoint: string;
}

/**
 * 预定义数据源提供商
 */
export const DATA_SOURCE_PROVIDERS: DataSourceProvider[] = [
  {
    name: 'Binance',
    type: 'exchange',
    exchange: 'binance',
    logo: '/icons/binance.svg',
    description: '币安交易所官方 API',
    features: ['K线数据', '订单簿', '成交记录', '账户信息', '现货交易'],
    documentationUrl: 'https://binance-docs.github.io/apidocs/',
    apiKeyRequired: true,
    defaultEndpoint: 'https://api.binance.com',
  },
  {
    name: 'Bybit',
    type: 'exchange',
    exchange: 'bybit',
    logo: '/icons/bybit.svg',
    description: 'Bybit 交易所官方 API',
    features: ['K线数据', '订单簿', '成交记录', '合约交易'],
    documentationUrl: 'https://bybit-exchange.github.io/docs/',
    apiKeyRequired: true,
    defaultEndpoint: 'https://api.bybit.com',
  },
  {
    name: 'OKX',
    type: 'exchange',
    exchange: 'okx',
    logo: '/icons/okx.svg',
    description: 'OKX 交易所官方 API',
    features: ['K线数据', '订单簿', '成交记录', '策略交易'],
    documentationUrl: 'https://www.okx.com/docs-vn/',
    apiKeyRequired: true,
    defaultEndpoint: 'https://www.okx.com',
  },
  {
    name: 'CoinGecko',
    type: 'aggregator',
    logo: '/icons/coingecko.svg',
    description: '加密货币价格数据聚合器',
    features: ['实时价格', '历史数据', '市场数据', '交易所信息'],
    documentationUrl: 'https://www.coingecko.com/en/api',
    apiKeyRequired: false,
    defaultEndpoint: 'https://api.coingecko.com/api/v3',
  },
  {
    name: 'Yahoo Finance',
    type: 'aggregator',
    exchange: 'coinbase',
    logo: '/icons/yahoo.svg',
    description: 'Yahoo Finance 市场数据',
    features: ['股票数据', '指数数据', '外汇数据', '期货数据'],
    documentationUrl: 'https://finance.yahoo.com/',
    apiKeyRequired: false,
    defaultEndpoint: 'https://query1.finance.yahoo.com',
  },
];

/**
 * 数据源状态标签
 */
export const DATA_SOURCE_STATUS_LABELS: Record<DataSourceStatus, { label: string; color: string }> = {
  active: { label: '正常', color: '#22c55e' },
  connecting: { label: '连接中', color: '#3b82f6' },
  disconnected: { label: '断开', color: '#737373' },
  error: { label: '错误', color: '#ef4444' },
  maintenance: { label: '维护中', color: '#f59e0b' },
};

/**
 * 数据类型标签
 */
export const DATA_TYPE_LABELS: Record<DataType, string> = {
  kline: 'K线数据',
  tick: 'Tick数据',
  orderbook: '订单簿',
  trade: '成交记录',
  ticker: '行情数据',
  balance: '账户余额',
  position: '持仓信息',
  order: '订单信息',
};

/**
 * 数据源类型标签
 */
export const DATA_SOURCE_TYPE_LABELS: Record<DataSourceType, string> = {
  exchange: '交易所 API',
  aggregator: '数据聚合器',
  websocket: 'WebSocket',
  rest_api: 'REST API',
  database: '数据库',
  file: '文件',
  custom: '自定义',
};
