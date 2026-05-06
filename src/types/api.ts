/**
 * NEMT Platform - API Types
 * API 相关类型定义
 */

/**
 * API 响应基础类型
 */
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  code?: string;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  totalPages: number;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

/**
 * 排序参数
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * API 错误码
 */
export enum ApiErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_PARAMS = 'INVALID_PARAMS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  GONE = 'GONE',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // 认证错误
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_MISSING = 'AUTH_TOKEN_MISSING',
  AUTH_PERMISSION_DENIED = 'AUTH_PERMISSION_DENIED',
  
  // 资源错误
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_LIMIT_EXCEEDED = 'RESOURCE_LIMIT_EXCEEDED',
  
  // 业务错误
  STRATEGY_NOT_FOUND = 'STRATEGY_NOT_FOUND',
  STRATEGY_ALREADY_RUNNING = 'STRATEGY_ALREADY_RUNNING',
  STRATEGY_CANNOT_START = 'STRATEGY_CANNOT_START',
  BACKTEST_NOT_FOUND = 'BACKTEST_NOT_FOUND',
  BACKTEST_ALREADY_RUNNING = 'BACKTEST_ALREADY_RUNNING',
  CONTAINER_NOT_FOUND = 'CONTAINER_NOT_FOUND',
  CONTAINER_ALREADY_RUNNING = 'CONTAINER_ALREADY_RUNNING',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_CANNOT_CANCEL = 'ORDER_CANNOT_CANCEL',
  ORDER_INSUFFICIENT_BALANCE = 'ORDER_INSUFFICIENT_BALANCE',
  
  // 数据错误
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  DATA_INVALID = 'DATA_INVALID',
  DATA_OUT_OF_RANGE = 'DATA_OUT_OF_RANGE',
  DATA_SOURCE_ERROR = 'DATA_SOURCE_ERROR',
  
  // 外部错误
  EXCHANGE_API_ERROR = 'EXCHANGE_API_ERROR',
  EXCHANGE_RATE_LIMITED = 'EXCHANGE_RATE_LIMITED',
  EXCHANGE_CONNECTION_ERROR = 'EXCHANGE_CONNECTION_ERROR',
}

/**
 * API 错误
 */
export interface ApiError {
  code: ApiErrorCode | string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

/**
 * 请求配置
 */
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: RetryConfig;
  cache?: CacheConfig;
}

/**
 * 重试配置
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;       // 毫秒
  backoffMultiplier: number;
  retryableCodes?: number[]; // 可重试的状态码
  retryableErrors?: string[]; // 可重试的错误码
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  enabled: boolean;
  ttl?: number;            // 毫秒
  key?: string;
}

/**
 * API 限流信息
 */
export interface RateLimitInfo {
  limit: number;            // 请求上限
  remaining: number;        // 剩余请求数
  resetAt: number;          // 重置时间
  retryAfter?: number;      // 重试等待时间 (秒)
}

/**
 * 请求统计
 */
export interface RequestStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cachedRequests: number;
  totalLatency: number;     // 毫秒
  averageLatency: number;
  maxLatency: number;
  minLatency: number;
}

/**
 * API 密钥信息
 */
export interface ApiKey {
  id: string;
  name: string;
  key: string;              // 掩码显示，如 sk_***abc
  secret?: string;          // 掩码显示
  
  // 权限
  permissions: ApiPermission[];
  
  // 限制
  rateLimit?: number;       // 每分钟请求数
  
  // 状态
  status: 'active' | 'paused' | 'revoked';
  
  // 使用统计
  usage: {
    requestsToday: number;
    lastUsedAt?: number;
  };
  
  // 时间
  createdAt: number;
  lastUsedAt?: number;
  expiresAt?: number;
}

export type ApiPermission = 
  | 'read:strategies'
  | 'write:strategies'
  | 'read:portfolios'
  | 'write:portfolios'
  | 'read:orders'
  | 'write:orders'
  | 'read:positions'
  | 'write:positions'
  | 'read:market'
  | 'write:market'
  | 'read:containers'
  | 'write:containers'
  | 'admin';

/**
 * Webhook 配置
 */
export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret?: string;
  
  // 触发事件
  events: WebhookEvent[];
  
  // 状态
  enabled: boolean;
  status: 'active' | 'failing' | 'disabled';
  
  // 统计
  stats: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    lastDeliveryAt?: number;
    lastSuccessAt?: number;
    lastError?: string;
  };
  
  // 时间
  createdAt: number;
  updatedAt: number;
}

export type WebhookEvent = 
  | 'strategy.started'
  | 'strategy.stopped'
  | 'strategy.error'
  | 'strategy.pnl_milestone'
  | 'order.placed'
  | 'order.filled'
  | 'order.cancelled'
  | 'position.opened'
  | 'position.closed'
  | 'backtest.completed'
  | 'alert.triggered'
  | 'container.status_changed';

/**
 * Webhook 投递记录
 */
export interface WebhookDelivery {
  id: string;
  webhookId: string;
  
  event: WebhookEvent;
  payload: unknown;
  
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  response?: string;
  error?: string;
  
  attempts: number;
  maxAttempts: number;
  
  timestamp: number;
  deliveredAt?: number;
}

/**
 * OAuth 配置
 */
export interface OAuthConfig {
  provider: 'google' | 'github' | 'twitter' | 'discord';
  clientId: string;
  scopes: string[];
  redirectUri: string;
}

/**
 * API 版本信息
 */
export interface ApiVersion {
  version: string;
  status: 'stable' | 'beta' | 'deprecated';
  deprecatedAt?: number;
  sunsetAt?: number;
  changelogUrl?: string;
}

/**
 * API 端点信息
 */
export interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  parameters?: ApiParameter[];
  response?: string;
  errors?: { code: string; description: string }[];
  rateLimit?: { limit: number; window: string };
  authRequired: boolean;
  version?: string;
}

export interface ApiParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  default?: unknown;
  enum?: string[];
}

/**
 * API 健康状态
 */
export interface ApiHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  version: string;
  
  services: {
    name: string;
    status: 'up' | 'down' | 'degraded';
    latency?: number;
    errorRate?: number;
  }[];
  
  rateLimits: RateLimitInfo[];
}

/**
 * 错误码标签
 */
export const API_ERROR_CODE_LABELS: Record<ApiErrorCode, string> = {
  [ApiErrorCode.UNKNOWN_ERROR]: '未知错误',
  [ApiErrorCode.INVALID_PARAMS]: '参数无效',
  [ApiErrorCode.UNAUTHORIZED]: '未授权',
  [ApiErrorCode.FORBIDDEN]: '禁止访问',
  [ApiErrorCode.NOT_FOUND]: '资源不存在',
  [ApiErrorCode.METHOD_NOT_ALLOWED]: '方法不允许',
  [ApiErrorCode.CONFLICT]: '资源冲突',
  [ApiErrorCode.GONE]: '资源已删除',
  [ApiErrorCode.TOO_MANY_REQUESTS]: '请求过于频繁',
  [ApiErrorCode.INTERNAL_ERROR]: '服务器内部错误',
  [ApiErrorCode.SERVICE_UNAVAILABLE]: '服务不可用',
  
  [ApiErrorCode.AUTH_TOKEN_EXPIRED]: '认证令牌已过期',
  [ApiErrorCode.AUTH_TOKEN_INVALID]: '认证令牌无效',
  [ApiErrorCode.AUTH_TOKEN_MISSING]: '缺少认证令牌',
  [ApiErrorCode.AUTH_PERMISSION_DENIED]: '权限不足',
  
  [ApiErrorCode.RESOURCE_NOT_FOUND]: '资源不存在',
  [ApiErrorCode.RESOURCE_ALREADY_EXISTS]: '资源已存在',
  [ApiErrorCode.RESOURCE_LIMIT_EXCEEDED]: '超出资源限制',
  
  [ApiErrorCode.STRATEGY_NOT_FOUND]: '策略不存在',
  [ApiErrorCode.STRATEGY_ALREADY_RUNNING]: '策略已在运行',
  [ApiErrorCode.STRATEGY_CANNOT_START]: '策略无法启动',
  [ApiErrorCode.BACKTEST_NOT_FOUND]: '回测不存在',
  [ApiErrorCode.BACKTEST_ALREADY_RUNNING]: '回测已在运行',
  [ApiErrorCode.CONTAINER_NOT_FOUND]: '容器不存在',
  [ApiErrorCode.CONTAINER_ALREADY_RUNNING]: '容器已在运行',
  [ApiErrorCode.ORDER_NOT_FOUND]: '订单不存在',
  [ApiErrorCode.ORDER_CANNOT_CANCEL]: '订单无法取消',
  [ApiErrorCode.ORDER_INSUFFICIENT_BALANCE]: '余额不足',
  
  [ApiErrorCode.DATA_NOT_FOUND]: '数据不存在',
  [ApiErrorCode.DATA_INVALID]: '数据无效',
  [ApiErrorCode.DATA_OUT_OF_RANGE]: '数据超出范围',
  [ApiErrorCode.DATA_SOURCE_ERROR]: '数据源错误',
  
  [ApiErrorCode.EXCHANGE_API_ERROR]: '交易所 API 错误',
  [ApiErrorCode.EXCHANGE_RATE_LIMITED]: '交易所请求限流',
  [ApiErrorCode.EXCHANGE_CONNECTION_ERROR]: '交易所连接错误',
};

/**
 * HTTP 状态码到错误码映射
 */
export const HTTP_STATUS_TO_ERROR_CODE: Record<number, ApiErrorCode> = {
  400: ApiErrorCode.INVALID_PARAMS,
  401: ApiErrorCode.UNAUTHORIZED,
  403: ApiErrorCode.FORBIDDEN,
  404: ApiErrorCode.NOT_FOUND,
  405: ApiErrorCode.METHOD_NOT_ALLOWED,
  409: ApiErrorCode.CONFLICT,
  410: ApiErrorCode.GONE,
  429: ApiErrorCode.TOO_MANY_REQUESTS,
  500: ApiErrorCode.INTERNAL_ERROR,
  503: ApiErrorCode.SERVICE_UNAVAILABLE,
};
