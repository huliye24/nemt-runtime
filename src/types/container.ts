/**
 * NEMT Runtime - Container Types
 * Compatibility export surface for layered container boundary types.
 */

export * from './container/index';

/**
 * Legacy compatibility types below are preserved temporarily while UI and
 * adapter code migrate to the layered container boundary model.
 */

/**
 * 容器状态
 */
export type ContainerStatus = 
  | 'created'       // 已创建
  | 'running'       // 运行中
  | 'paused'        // 暂停
  | 'restarting'    // 重启中
  | 'removing'      // 移除中
  | 'exited'        // 已退出
  | 'dead';         // 死亡

/**
 * 容器运行状态（简化版）
 */
export type ContainerState = 'running' | 'stopped' | 'error' | 'starting';

/**
 * 资源限制
 */
export interface ContainerResources {
  // CPU
  cpuLimit?: number;        // CPU 核心数
  cpuReservation?: number;  // CPU 预留
  cpuShares?: number;       // CPU 权重
  
  // 内存
  memoryLimit?: number;     // 内存限制 (MB)
  memoryReservation?: number; // 内存预留 (MB)
  memorySwap?: number;      // Swap 限制 (MB)
  
  // GPU
  gpuLimit?: number;        // GPU 数量
  gpuMemory?: number;       // GPU 内存 (MB)
  
  // 网络
  networkBandwidth?: number; // 网络带宽 (Mbps)
  
  // 存储
  storageLimit?: number;    // 存储限制 (MB)
}

/**
 * 端口映射
 */
export interface ContainerPort {
  hostPort: number;
  containerPort: number;
  protocol: 'tcp' | 'udp';
  description?: string;
}

/**
 * 环境变量
 */
export interface ContainerEnvVar {
  key: string;
  value: string;
  secret?: boolean; // 是否从密钥库读取
}

/**
 * 卷挂载
 */
export interface ContainerVolume {
  hostPath: string;
  containerPath: string;
  mode: 'rw' | 'ro';
  description?: string;
}

/**
 * 健康检查配置
 */
export interface ContainerHealthCheck {
  enabled: boolean;
  command?: string;
  interval?: number;       // 秒
  timeout?: number;       // 秒
  retries?: number;
  startPeriod?: number;   // 秒
}

/**
 * 日志配置
 */
export interface ContainerLogConfig {
  driver: 'json-file' | 'syslog' | 'journald' | 'gelf' | 'fluentd' | 'awslogs';
  maxSize?: string;        // 如 '10m', '100m'
  maxFiles?: number;
  options?: Record<string, string>;
}

/**
 * 网络配置
 */
export interface ContainerNetwork {
  networkId: string;
  networkName: string;
  ipAddress?: string;
  gateway?: string;
  macAddress?: string;
  aliases?: string[];
  driverOpts?: Record<string, string>;
}

/**
 * 容器信息
 */
export interface Container {
  id: string;
  name: string;
  shortId: string;
  
  // 镜像
  image: string;
  imageId?: string;
  imageTag?: string;
  
  // 状态
  status: ContainerStatus;
  state: ContainerState;
  stateMessage?: string;
  
  // 创建信息
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  restartCount: number;
  
  // 配置
  command?: string;
  entrypoint?: string;
  workingDir?: string;
  user?: string;
  
  // 网络
  ports: ContainerPort[];
  networks: ContainerNetwork[];
  
  // 环境变量
  envVars: ContainerEnvVar[];
  
  // 卷
  volumes: ContainerVolume[];
  
  // 资源
  resources: ContainerResources;
  
  // 健康检查
  healthCheck?: ContainerHealthCheck;
  
  // 日志
  logConfig?: ContainerLogConfig;
  
  // 策略
  restartPolicy: ContainerRestartPolicy;
  
  // 策略关联
  strategyId?: string;
  strategyName?: string;
  
  // 统计
  stats?: ContainerStats;
  
  // 标签
  labels: Record<string, string>;
  
  // 元数据
  metadata?: Record<string, unknown>;
}

/**
 * 重启策略
 */
export interface ContainerRestartPolicy {
  mode: 'no' | 'always' | 'unless-stopped' | 'on-failure';
  maxRetries?: number;
}

/**
 * 容器统计信息
 */
export interface ContainerStats {
  timestamp: number;
  
  // CPU
  cpuPercent: number;
  cpuSystem?: number;
  cpuUser?: number;
  cpuThrottled?: boolean;
  
  // 内存
  memoryUsage: number;        // 使用量 (bytes)
  memoryLimit: number;       // 限制 (bytes)
  memoryPercent: number;
  memoryCache?: number;
  memoryRss?: number;
  
  // 网络
  networkRx?: number;        // 接收 (bytes)
  networkTx?: number;        // 发送 (bytes)
  networkPacketsRx?: number;
  networkPacketsTx?: number;
  
  // 块设备
  blockRead?: number;
  blockWrite?: number;
  
  // PIDs
  pidsCurrent?: number;
}

/**
 * 容器日志条目
 */
export interface ContainerLog {
  timestamp: number;
  stream: 'stdout' | 'stderr';
  message: string;
  raw?: string;
}

/**
 * 传统容器事件（兼容保留）
 */
export interface DockerContainerEvent {
  timestamp: number;
  type: 'create' | 'start' | 'stop' | 'pause' | 'unpause' | 'die' | 'destroy' | 'health_status' | 'restart';
  actor: {
    containerId: string;
    containerName: string;
    imageName: string;
  };
  hostName?: string;
  platform?: string;
}

/**
 * 容器操作历史
 */
export interface ContainerOperation {
  id: string;
  containerId: string;
  operation: ContainerOperationType;
  status: 'pending' | 'success' | 'failed';
  startedAt: number;
  completedAt?: number;
  duration?: number;
  result?: string;
  error?: string;
  performedBy: string;
}

export type ContainerOperationType = 
  | 'create'
  | 'start'
  | 'stop'
  | 'restart'
  | 'pause'
  | 'unpause'
  | 'remove'
  | 'update'
  | 'exec'
  | 'logs'
  | 'inspect';

/**
 * 容器创建参数
 */
export interface CreateContainerParams {
  name: string;
  image: string;
  tag?: string;
  command?: string[];
  entrypoint?: string[];
  workingDir?: string;
  user?: string;
  
  ports?: ContainerPort[];
  envVars?: ContainerEnvVar[];
  volumes?: ContainerVolume[];
  
  resources?: ContainerResources;
  healthCheck?: ContainerHealthCheck;
  logConfig?: ContainerLogConfig;
  restartPolicy?: ContainerRestartPolicy;
  
  labels?: Record<string, string>;
  network?: string;
  
  strategyId?: string;
}

/**
 * 容器更新参数
 */
export interface UpdateContainerParams {
  containerId: string;
  
  // 资源更新
  resources?: ContainerResources;
  
  // 环境变量更新
  envVars?: ContainerEnvVar[];
  removeEnvVars?: string[];
  
  // 端口更新
  ports?: ContainerPort[];
  
  // 重启策略
  restartPolicy?: ContainerRestartPolicy;
  
  // 标签
  labels?: Record<string, string>;
  removeLabels?: string[];
}

/**
 * 容器执行命令参数
 */
export interface ExecContainerParams {
  containerId: string;
  command: string | string[];
  user?: string;
  workingDir?: string;
  envVars?: ContainerEnvVar[];
  attach?: boolean;
  tty?: boolean;
}

/**
 * 容器执行结果
 */
export interface ExecContainerResult {
  containerId: string;
  exitCode: number;
  output?: string;
  error?: string;
  duration?: number;
}

/**
 * 镜像信息
 */
export interface ContainerImage {
  id: string;
  repoTags?: string[];
  repoDigests?: string[];
  
  created: number;
  size: number;
  
  // 镜像信息
  architecture?: string;
  os?: string;
  variant?: string;
  
  // 层信息
  layers?: ImageLayer[];
  
  // 配置
  config?: ImageConfig;
  
  // 标签
  labels: Record<string, string>;
}

/**
 * 镜像层
 */
export interface ImageLayer {
  id: string;
  size: number;
  created: number;
}

/**
 * 镜像配置
 */
export interface ImageConfig {
  env?: string[];
  cmd?: string[];
  entrypoint?: string[];
  workdir?: string;
  user?: string;
  exposePorts?: number[];
}

/**
 * 网络信息
 */
export interface ContainerNetworkInfo {
  id: string;
  name: string;
  driver: string;
  scope: 'local' | 'global' | 'swarm';
  ipam?: {
    driver: string;
    config?: { subnet?: string; gateway?: string }[];
  };
  containers?: string[];
  created: number;
}

/**
 * 容器状态标签
 */
export const CONTAINER_STATUS_LABELS: Record<ContainerStatus, string> = {
  created: '已创建',
  running: '运行中',
  paused: '已暂停',
  restarting: '重启中',
  removing: '移除中',
  exited: '已退出',
  dead: '已终止',
};

/**
 * 容器运行状态标签
 */
export const CONTAINER_STATE_LABELS: Record<ContainerState, { label: string; color: string }> = {
  running: { label: '运行中', color: '#22c55e' },
  stopped: { label: '已停止', color: '#737373' },
  error: { label: '错误', color: '#ef4444' },
  starting: { label: '启动中', color: '#3b82f6' },
};

/**
 * 重启策略标签
 */
export const RESTART_POLICY_LABELS: Record<ContainerRestartPolicy['mode'], string> = {
  no: '不自动重启',
  always: '始终重启',
  'unless-stopped': '除非停止否则重启',
  'on-failure': '失败时重启',
};
