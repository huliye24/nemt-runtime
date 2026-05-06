/**
 * NEMT Platform - Data Flow Types
 * 数据流相关类型定义
 */

/**
 * 数据流状态
 */
export type DataFlowStatus = 
  | 'draft'         // 草稿
  | 'active'        // 运行中
  | 'paused'        // 暂停
  | 'error'         // 错误
  | 'stopped';      // 已停止

/**
 * 数据流节点类型
 */
export type DataFlowNodeType = 
  | 'source'        // 数据源
  | 'transformer'   // 转换器
  | 'filter'        // 过滤器
  | 'aggregator'    // 聚合器
  | 'destination'   // 目的地
  | 'condition'     // 条件分支
  | 'merge'         // 合并
  | 'split'         // 分割
  | 'buffer'        // 缓冲区
  | 'validator';    // 验证器

/**
 * 数据流边类型
 */
export type DataFlowEdgeType = 
  | 'data'          // 数据流
  | 'control'       // 控制流
  | 'error';        // 错误流

/**
 * 数据格式
 */
export type DataFormat = 
  | 'json' 
  | 'csv' 
  | 'binary' 
  | 'protobuf' 
  | 'thrift' 
  | 'avro';

/**
 * 数据流节点
 */
export interface DataFlowNode {
  id: string;
  name: string;
  type: DataFlowNodeType;
  description?: string;
  
  // 配置
  config: DataFlowNodeConfig;
  
  // 位置（可视化用）
  position: {
    x: number;
    y: number;
  };
  
  // 输入输出
  inputs: DataFlowPort[];
  outputs: DataFlowPort[];
  
  // 状态
  status: 'idle' | 'running' | 'paused' | 'error' | 'disabled';
  lastExecutedAt?: number;
  executionCount: number;
  errorCount: number;
  
  // 统计
  stats: DataFlowNodeStats;
  
  // 元数据
  metadata?: Record<string, unknown>;
}

export interface DataFlowPort {
  id: string;
  name: string;
  dataType: string;
  format: DataFormat;
  required: boolean;
  schema?: Record<string, unknown>;
}

export interface DataFlowNodeConfig {
  [key: string]: unknown;
}

export interface DataFlowNodeStats {
  processedItems: number;
  failedItems: number;
  averageProcessingTime: number;
  lastProcessingTime: number;
  throughput: number; // items/second
}

/**
 * 数据流边（连接）
 */
export interface DataFlowEdge {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  type: DataFlowEdgeType;
  
  // 可视化
  label?: string;
  
  // 条件（用于条件分支边）
  condition?: string;
}

/**
 * 完整数据流
 */
export interface DataFlow {
  id: string;
  name: string;
  description?: string;
  
  // 结构
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
  
  // 状态
  status: DataFlowStatus;
  isValid: boolean;
  validationErrors: ValidationError[];
  
  // 配置
  config: DataFlowConfig;
  
  // 执行信息
  startedAt?: number;
  stoppedAt?: number;
  lastRunAt?: number;
  
  // 统计
  stats: DataFlowStats;
  
  // 版本
  version: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface DataFlowConfig {
  maxConcurrency: number;
  bufferSize: number;
  errorHandling: 'stop' | 'skip' | 'retry';
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  enableMonitoring: boolean;
  enableLogging: boolean;
}

export interface DataFlowStats {
  totalProcessed: number;
  totalFailed: number;
  totalSkipped: number;
  averageLatency: number;
  throughput: number;
  uptime: number;
  nodeStats: Record<string, DataFlowNodeStats>;
}

/**
 * 数据流执行记录
 */
export interface DataFlowExecution {
  id: string;
  dataFlowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: number;
  completedAt?: number;
  duration?: number;
  
  // 输入输出
  inputItems: number;
  outputItems: number;
  failedItems: number;
  
  // 错误
  errors: ExecutionError[];
  
  // 检查点
  checkpoints?: DataFlowCheckpoint[];
}

export interface ExecutionError {
  nodeId: string;
  nodeName: string;
  error: string;
  timestamp: number;
  item?: unknown;
  stackTrace?: string;
}

export interface DataFlowCheckpoint {
  id: string;
  nodeId: string;
  timestamp: number;
  state: Record<string, unknown>;
  itemsProcessed: number;
}

/**
 * 数据流验证错误
 */
export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  type: 'missing_input' | 'missing_output' | 'type_mismatch' | 'cycle_detected' | 'orphan_node' | 'invalid_config';
  message: string;
  severity: 'error' | 'warning';
}

/**
 * 数据流模板
 */
export interface DataFlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  
  // 模板内容
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
  config: DataFlowConfig;
  
  // 预览信息
  preview?: {
    thumbnail?: string;
    complexity: 'simple' | 'medium' | 'complex';
    estimatedPerformance: string;
  };
  
  // 元数据
  author: string;
  usageCount: number;
  rating: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * 预定义数据流模板
 */
export const DATAFLOW_TEMPLATES: DataFlowTemplate[] = [
  {
    id: 'kline-pipeline',
    name: 'K线数据管道',
    description: '从交易所获取K线数据并进行转换处理',
    category: '市场数据',
    tags: ['kline', 'candlestick', 'real-time'],
    nodes: [
      {
        id: 'source-1',
        name: '交易所数据源',
        type: 'source',
        config: { exchange: 'binance', interval: '1m' },
        position: { x: 0, y: 100 },
        inputs: [],
        outputs: [{ id: 'out-1', name: 'raw_data', dataType: 'kline', format: 'json', required: true }],
        status: 'idle',
        executionCount: 0,
        errorCount: 0,
        stats: { processedItems: 0, failedItems: 0, averageProcessingTime: 0, lastProcessingTime: 0, throughput: 0 },
      },
      {
        id: 'transform-1',
        name: '数据转换',
        type: 'transformer',
        config: { transformType: 'normalize' },
        position: { x: 200, y: 100 },
        inputs: [{ id: 'in-1', name: 'raw_data', dataType: 'kline', format: 'json', required: true }],
        outputs: [{ id: 'out-1', name: 'normalized_data', dataType: 'kline', format: 'json', required: true }],
        status: 'idle',
        executionCount: 0,
        errorCount: 0,
        stats: { processedItems: 0, failedItems: 0, averageProcessingTime: 0, lastProcessingTime: 0, throughput: 0 },
      },
      {
        id: 'dest-1',
        name: '数据存储',
        type: 'destination',
        config: { storageType: 'database' },
        position: { x: 400, y: 100 },
        inputs: [{ id: 'in-1', name: 'data', dataType: 'kline', format: 'json', required: true }],
        outputs: [],
        status: 'idle',
        executionCount: 0,
        errorCount: 0,
        stats: { processedItems: 0, failedItems: 0, averageProcessingTime: 0, lastProcessingTime: 0, throughput: 0 },
      },
    ],
    edges: [
      { id: 'edge-1', sourceNodeId: 'source-1', sourcePortId: 'out-1', targetNodeId: 'transform-1', targetPortId: 'in-1', type: 'data' },
      { id: 'edge-2', sourceNodeId: 'transform-1', sourcePortId: 'out-1', targetNodeId: 'dest-1', targetPortId: 'in-1', type: 'data' },
    ],
    config: {
      maxConcurrency: 5,
      bufferSize: 1000,
      errorHandling: 'retry',
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      enableMonitoring: true,
      enableLogging: true,
    },
    author: 'system',
    usageCount: 0,
    rating: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'multi-exchange-agg',
    name: '多交易所行情聚合',
    description: '聚合多个交易所的行情数据并计算加权平均价格',
    category: '市场数据',
    tags: ['aggregation', 'multi-exchange', 'price'],
    nodes: [],
    edges: [],
    config: {
      maxConcurrency: 10,
      bufferSize: 5000,
      errorHandling: 'skip',
      maxRetries: 2,
      retryDelay: 500,
      timeout: 10000,
      enableMonitoring: true,
      enableLogging: false,
    },
    author: 'system',
    usageCount: 0,
    rating: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'signal-generator',
    name: '信号生成管道',
    description: '基于指标计算生成交易信号',
    category: '信号处理',
    tags: ['signal', 'indicator', 'trading'],
    nodes: [],
    edges: [],
    config: {
      maxConcurrency: 3,
      bufferSize: 100,
      errorHandling: 'stop',
      maxRetries: 1,
      retryDelay: 100,
      timeout: 5000,
      enableMonitoring: true,
      enableLogging: true,
    },
    author: 'system',
    usageCount: 0,
    rating: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

/**
 * 节点类型标签
 */
export const DATAFLOW_NODE_TYPE_LABELS: Record<DataFlowNodeType, { label: string; color: string; icon: string }> = {
  source: { label: '数据源', color: '#22c55e', icon: 'database' },
  transformer: { label: '转换器', color: '#3b82f6', icon: 'refresh-cw' },
  filter: { label: '过滤器', color: '#f59e0b', icon: 'filter' },
  aggregator: { label: '聚合器', color: '#8b5cf6', icon: 'layers' },
  destination: { label: '目的地', color: '#ec4899', icon: 'hard-drive' },
  condition: { label: '条件分支', color: '#f97316', icon: 'git-branch' },
  merge: { label: '合并', color: '#06b6d4', icon: 'git-merge' },
  split: { label: '分割', color: '#84cc16', icon: 'split' },
  buffer: { label: '缓冲区', color: '#6366f1', icon: 'inbox' },
  validator: { label: '验证器', color: '#ef4444', icon: 'check-circle' },
};

/**
 * 数据流状态标签
 */
export const DATAFLOW_STATUS_LABELS: Record<DataFlowStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: '#737373' },
  active: { label: '运行中', color: '#22c55e' },
  paused: { label: '已暂停', color: '#f59e0b' },
  error: { label: '错误', color: '#ef4444' },
  stopped: { label: '已停止', color: '#6b7280' },
};

/**
 * 数据格式标签
 */
export const DATA_FORMAT_LABELS: Record<DataFormat, string> = {
  json: 'JSON',
  csv: 'CSV',
  binary: '二进制',
  protobuf: 'Protocol Buffers',
  thrift: 'Thrift',
  avro: 'Avro',
};
