/**
 * NEMT Platform - Order Types
 * 订单相关类型定义
 */

/**
 * 订单方向
 */
export type OrderSide = 'buy' | 'sell';

/**
 * 订单类型
 */
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'take_profit' | 'trailing_stop';

/**
 * 订单状态
 */
export type OrderStatus = 
  | 'pending'      // 等待中
  | 'submitted'    // 已提交
  | 'new'          // 新订单
  | 'partially_filled'  // 部分成交
  | 'filled'       // 完全成交
  | 'cancelled'    // 已取消
  | 'rejected'     // 已拒绝
  | 'expired'      // 已过期
  | 'pending_cancel'  // 等待取消
  | 'pending_modify'; // 等待修改

/**
 * 订单时间戳类型
 */
export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'GTX' | 'GTT';

export const TIME_IN_FORCE_LABELS: Record<TimeInForce, string> = {
  GTC: 'Good Till Cancel (取消前有效)',
  IOC: 'Immediate Or Cancel (立即成交或取消)',
  FOK: 'Fill Or Kill (全部成交或取消)',
  GTX: 'Good Till Crossing (涨跌停前有效)',
  GTT: 'Good Till Time (指定时间前有效)',
};

/**
 * 订单来源
 */
export type OrderSource = 'manual' | 'strategy' | 'signal' | 'copytrading' | 'api' | 'backtest' | 'rebalance';

/**
 * 订单角色
 */
export type OrderRole = 'taker' | 'maker' | 'both';

/**
 * 订单基础信息
 */
export interface Order {
  id: string;
  clientOrderId?: string;
  
  // 交易所信息
  exchange: string;
  symbol: string;
  pair?: string; // 交易对格式，如 BTC/USDT
  
  // 订单参数
  side: OrderSide;
  type: OrderType;
  positionSide?: 'long' | 'short' | 'both';
  
  // 价格与数量
  price?: number;
  stopPrice?: number;
  trailingDelta?: number;
  trailingPercent?: number;
  quantity?: number;
  quoteQuantity?: number; // USDT 价值
  percentOfEquity?: number; // 资金百分比
  
  // 执行信息
  filledQuantity: number;
  avgFillPrice?: number;
  commission: number;
  commissionAsset?: string;
  
  // 状态
  status: OrderStatus;
  timeInForce?: TimeInForce;
  
  // 时间戳
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  filledAt?: number;
  cancelledAt?: number;
  expiredAt?: number;
  
  // 来源与策略
  source: OrderSource;
  strategyId?: string;
  strategyName?: string;
  signalId?: string;
  
  // 标签与备注
  tags?: string[];
  notes?: string;
  
  // 错误信息
  errorMessage?: string;
  rejectReason?: string;
  
  // 元数据
  metadata?: Record<string, unknown>;
}

/**
 * 订单创建参数
 */
export interface CreateOrderParams {
  exchange: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity?: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: TimeInForce;
  positionSide?: 'long' | 'short' | 'both';
  clientOrderId?: string;
  strategyId?: string;
  signalId?: string;
  tags?: string[];
  notes?: string;
}

/**
 * 订单修改参数
 */
export interface ModifyOrderParams {
  orderId: string;
  price?: number;
  stopPrice?: number;
  quantity?: number;
}

/**
 * 订单取消参数
 */
export interface CancelOrderParams {
  orderId: string;
  reason?: string;
}

/**
 * 订单查询参数
 */
export interface QueryOrderParams {
  exchange?: string;
  symbol?: string;
  status?: OrderStatus;
  side?: OrderSide;
  strategyId?: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
  offset?: number;
}

/**
 * 订单统计
 */
export interface OrderStats {
  totalOrders: number;
  openOrders: number;
  closedOrders: number;
  cancelledOrders: number;
  rejectedOrders: number;
  
  // 成交统计
  totalFilledQuantity: number;
  totalCommission: number;
  averageFillPrice: number;
  
  // 时间统计
  averageExecutionTime: number;
  fastestExecution: number;
  slowestExecution: number;
  
  // 费用统计
  takerOrders: number;
  makerOrders: number;
  estimatedTakerFees: number;
  estimatedMakerFees: number;
}

/**
 * 订单历史记录
 */
export interface OrderHistory {
  orders: Order[];
  stats: OrderStats;
  page: number;
  pageSize: number;
  total: number;
}

/**
 * 批量订单操作
 */
export interface BatchOrderOperation {
  operation: 'create' | 'cancel' | 'modify';
  orders: (CreateOrderParams | CancelOrderParams | ModifyOrderParams)[];
}

/**
 * 批量订单结果
 */
export interface BatchOrderResult {
  success: Order[];
  failed: FailedOrder[];
  total: number;
  processedAt: number;
}

export interface FailedOrder {
  order: CreateOrderParams | CancelOrderParams | ModifyOrderParams;
  error: string;
  code: string;
}

/**
 * 订单模板
 */
export interface OrderTemplate {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price?: number;
  quantityPercent?: number;
  stopLossPercent?: number;
  takeProfitPercent?: number;
  tags?: string[];
}

/**
 * 订单草稿
 */
export interface OrderDraft {
  id: string;
  params: Partial<CreateOrderParams>;
  createdAt: number;
  expiresAt?: number;
}

/**
 * 订单状态转换
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['submitted', 'cancelled'],
  submitted: ['new', 'cancelled', 'rejected'],
  new: ['partially_filled', 'filled', 'cancelled', 'rejected', 'expired'],
  partially_filled: ['partially_filled', 'filled', 'cancelled', 'rejected', 'expired'],
  filled: [],
  cancelled: [],
  rejected: [],
  expired: [],
  pending_cancel: ['cancelled', 'filled', 'partially_filled'],
  pending_modify: ['new', 'partially_filled', 'filled'],
};

/**
 * 订单状态标签
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '等待中',
  submitted: '已提交',
  new: '新订单',
  partially_filled: '部分成交',
  filled: '已成交',
  cancelled: '已取消',
  rejected: '已拒绝',
  expired: '已过期',
  pending_cancel: '等待取消',
  pending_modify: '等待修改',
};

/**
 * 订单类型标签
 */
export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  market: '市价单',
  limit: '限价单',
  stop: '止损单',
  stop_limit: '止损限价单',
  take_profit: '止盈单',
  trailing_stop: '追踪止损',
};

/**
 * 订单方向标签
 */
export const ORDER_SIDE_LABELS: Record<OrderSide, string> = {
  buy: '买入',
  sell: '卖出',
};

/**
 * 订单来源标签
 */
export const ORDER_SOURCE_LABELS: Record<OrderSource, string> = {
  manual: '手动',
  strategy: '策略',
  signal: '信号',
  copytrading: '跟单',
  api: 'API',
  backtest: '回测',
  rebalance: '调仓',
};
