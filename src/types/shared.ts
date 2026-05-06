/**
 * NEMT Platform - Shared Types
 * 全局共享类型定义
 */

// ============================================
// 通用响应类型
// ============================================

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================
// 通用实体类型
// ============================================

export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export interface NamedEntity extends BaseEntity {
  name: string;
  description?: string;
}

// ============================================
// 策略相关类型
// ============================================

export type StrategyStatus = 'draft' | 'ready' | 'running' | 'paused' | 'archived' | 'error';

export interface StrategyMetrics {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  sharpeRatio: number;
  maxDrawdown?: number;
}

export interface Strategy extends BaseEntity {
  name: string;
  author: string;
  description: string;
  version: string;
  status: StrategyStatus;
  metrics: StrategyMetrics;
  tags: string[];
  code?: string;
}

// ============================================
// 投资组合相关类型
// ============================================

export type PortfolioStatus = 'active' | 'inactive' | 'archived';

export interface Portfolio extends BaseEntity {
  name: string;
  description: string;
  status: PortfolioStatus;
  totalValue: number;
  strategies: string[];
  performance?: PortfolioPerformance;
}

export interface PortfolioPerformance {
  day: number;
  week: number;
  month: number;
  year: number;
  all: number;
}

// ============================================
// 持仓相关类型
// ============================================

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  updatedAt: number;
}

// ============================================
// 回测相关类型
// ============================================

export interface BacktestConfig {
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  config: BacktestConfig;
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
  };
  equityCurve: Array<{ timestamp: number; value: number }>;
  trades: BacktestTrade[];
  completedAt: number;
}

export interface BacktestTrade {
  id: string;
  timestamp: number;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  pnl: number;
}

// ============================================
// MCP 相关类型
// ============================================

export interface MCPEndpoint {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  enabled: boolean;
}

export interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

export interface MCPServerConfig {
  url: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

// ============================================
// 错误处理
// ============================================

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id ${id}` : ''} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

// ============================================
// 工具类型
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PickRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
