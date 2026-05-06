# NEMT Runtime 容器边界扩张代码实施蓝图

## 文档目的

这份文档是 [CONTAINER_BOUNDARY_EXPANSION_PLAN.md](E:/NEMT%20runtime/CONTAINER_BOUNDARY_EXPANSION_PLAN.md) 的下一层。

上一份文档解决的是：

- 为什么要扩张容器边界
- 容器的新语义是什么
- 容器应该长成哪些层

这一份文档解决的是：

- 在当前仓库结构下，第一批代码到底怎么落
- `src/types` 应该怎么拆
- `src/stores` 应该怎么重组
- 新目录结构怎么设计
- 哪些接口文件应该第一批进入仓库
- 迁移顺序怎样安排才能不把现有 UI 一次性打爆

这不是概念说明书，而是实施蓝图。

---

## 1. 当前代码基线判断

先明确当前的真实基线。

### 1.1 `src/types/container.ts` 的现状

当前 [src/types/container.ts](E:/NEMT%20runtime/src/types/container.ts) 已经比 `store` 层完整很多，具备：

- 容器资源模型
- 端口映射
- 环境变量
- 卷挂载
- 健康检查
- 日志配置
- 网络配置
- 容器统计
- 容器事件
- 镜像信息

这说明当前类型文件已经在偏“容器技术模型”方向展开。

但它的主要问题是：

1. `Container` 仍是扁平中心对象
2. Definition / Runtime / Policy / Observation / Event 混杂
3. 当前 `ContainerEvent` 仍是偏 Docker 事件，不是 runtime boundary 事件
4. 缺 `Envelope` / `Binding` / `RecoveryPolicy` / `DataAccessPolicy` / `CapitalAccessPolicy`
5. 还没有为 runtime registry 做准备

### 1.2 `src/stores/containerStore.ts` 的现状

当前 [src/stores/containerStore.ts](E:/NEMT%20runtime/src/stores/containerStore.ts) 本质上是一个 UI state store。

它具备：

- 列表管理
- 选择状态
- 过滤状态
- 简单 CRUD

问题也很明确：

1. 自己重新定义了一套轻量 `Container`
2. 与 `src/types/container.ts` 完全脱节
3. 只适合做容器列表 UI，不适合做边界模型
4. 没有运行态与定义态分层
5. 没有治理态
6. 没有绑定态
7. 没有 observation / event 入口

### 1.3 `src/types/shared.ts` 的现状

[src/types/shared.ts](E:/NEMT%20runtime/src/types/shared.ts) 里还保留了一套更旧、更轻量的 `Container` 和 `ContainerPort`。

这意味着当前仓库里至少已经存在三层容器概念：

1. `shared.ts` 中的轻量容器
2. `types/container.ts` 中的技术容器
3. `stores/containerStore.ts` 中的 UI 容器

这是第一批必须收敛的问题之一。

### 1.4 当前应该怎么理解这个现状

当前仓库并不是“完全没有容器模型”，而是“容器模型处在三套并存且没有边界层级的状态”。

这很正常，但也说明：

- 不适合在现有 `Container` 上继续加字段
- 更适合引入新分层，并保留兼容层

---

## 2. 实施目标

本蓝图的目标不是一步到位完成所有改造，而是定义一个能稳步推进的代码轨道。

### 2.1 第一阶段目标

第一阶段必须做到：

1. 为容器建立新的类型分层
2. 让 `src/types` 成为唯一真相来源
3. 为 store 拆分打基础
4. 建立兼容视图模型，避免 UI 一次性崩
5. 让后续 `StrategyRuntime -> ContainerRuntime` 绑定有地方落

### 2.2 第一阶段不做什么

第一阶段不要做：

- 不重写所有 UI 组件
- 不做完整 runtime registry
- 不做完整事件总线
- 不做完整恢复系统
- 不做真实容器引擎适配器重构

第一阶段重点是“把结构抬起来”，不是“一步做完系统”。

### 2.3 第二阶段准备目标

第一阶段结束后，仓库应该具备以下能力：

- 可以正式声明 `ContainerSpec`
- 可以正式声明 `ContainerRuntime`
- 可以正式声明 `ContainerEnvelope`
- 可以正式表达 `ContainerBinding`
- 旧 UI 仍然能通过 façade 读到 `LegacyContainerViewModel`

---

## 3. 代码改造总策略

### 3.1 策略名称

推荐采用：

> 平行新核 + 兼容旧壳

### 3.2 为什么不用“原地重构扁平 Container”

如果直接在现有 `Container` 上继续演化，会遇到以下问题：

- 旧字段语义无法清晰升级
- 组件很难分辨一个字段属于定义态还是运行态
- store 越改越乱
- 很容易改着改着又回到“一个超级大 Container”

因此应该：

- 新建新的分层类型
- 暂时保留旧视图模型
- 慢慢让 UI 消费新的聚合层

### 3.3 为什么不用一次性重写所有 store

因为当前仓库已经有不少组件依赖现有 store。

一次性重写会导致：

- 大量组件同时失效
- 难以验证语义变化
- 容易把“架构升级”做成“项目停摆”

更合适的方法是：

1. 先建新 store
2. 再建兼容 façade
3. 最后逐步迁移 UI

---

## 4. 推荐目录结构

这是第一版推荐结构，重点是把“领域类型”“运行时层”“兼容层”“store 层”分开。

```text
src/
  types/
    container/
      boundary.ts
      spec.ts
      runtime.ts
      envelope.ts
      binding.ts
      observation.ts
      event.ts
      policy.ts
      recovery.ts
      view.ts
      index.ts
    container.ts
  stores/
    container/
      containerSpecStore.ts
      containerRuntimeStore.ts
      containerEnvelopeStore.ts
      containerObservationStore.ts
      containerViewStore.ts
      index.ts
    containerStore.ts
  services/
    container/
      containerViewAssembler.ts
      containerPlacementService.ts
      containerPolicyService.ts
      containerEventService.ts
```

### 4.1 为什么 `types/container/` 要成为目录而不是单文件

因为容器现在不再是一个单对象。

它已经至少包含：

- spec
- runtime
- envelope
- binding
- observation
- event
- policy
- recovery
- legacy view

继续放在一个 `container.ts` 里会很快变成难以维护的大文件。

### 4.2 为什么保留 `src/types/container.ts`

因为现有代码已经在使用它。

建议它在过渡期改成：

- 聚合导出入口
- 兼容旧导出位置

也就是说它不再承载全部实现，而是做 re-export。

### 4.3 为什么 `stores/container/` 单独建目录

当前 `stores/` 目录所有 store 平铺。

容器边界扩张后，它会成为一个内部子系统，至少会有四五个 store。

如果仍然平铺到 `src/stores/` 下，会让根目录迅速失控。

---

## 5. `src/types` 具体拆分方案

这一节是最关键的之一。

---

## 5.1 目标文件一：`src/types/container/boundary.ts`

### 角色

放容器边界层共享基础名词。

### 应包含内容

- 边界级通用类型
- 容器角色
- runtime unit kind
- isolation level
- audit level
- actor scope

### 建议接口

```ts
export type ContainerBoundaryKind =
  | 'strategy-host'
  | 'agent-host'
  | 'execution-host'
  | 'data-ingress-host'
  | 'research-host'
  | 'mixed-runtime-host';

export type RuntimeUnitKind =
  | 'strategy-runtime'
  | 'agent-runtime'
  | 'execution-adapter-runtime'
  | 'data-worker-runtime'
  | 'portfolio-runtime'
  | 'risk-worker-runtime';

export type IsolationLevel =
  | 'shared'
  | 'tenant-isolated'
  | 'restricted'
  | 'critical'
  | 'quarantined';

export type AuditLevel = 'basic' | 'elevated' | 'full';

export type ActorScope =
  | 'system'
  | 'operator'
  | 'agent'
  | 'automation'
  | 'runtime-service';
```

### 为什么单独拆这个文件

因为这些名词会被：

- spec
- runtime
- envelope
- event
- policy
- store

同时引用。

把这些基础名词集中，有助于稳定全局语言。

---

## 5.2 目标文件二：`src/types/container/spec.ts`

### 角色

定义态的核心文件。

### 主要对象

- `ContainerSpec`
- `ContainerResourceSpec`
- `ContainerNetworkSpec`
- `ContainerStorageSpec`
- `ContainerEnvironmentSpec`
- `RuntimeTemplateRef`

### 建议内容

```ts
import type { BaseEntity } from '@/types/shared';
import type { ContainerBoundaryKind, RuntimeUnitKind } from './boundary';

export interface RuntimeTemplateRef {
  provider: 'docker' | 'local-process' | 'k8s' | 'simulated';
  templateId: string;
  image?: string;
  tag?: string;
}

export interface ContainerResourceSpec {
  cpuLimit?: number;
  cpuReservation?: number;
  memoryLimitMb?: number;
  memoryReservationMb?: number;
  gpuLimit?: number;
  networkBandwidthMbps?: number;
  storageLimitMb?: number;
}

export interface ContainerNetworkPortSpec {
  hostPort: number;
  containerPort: number;
  protocol: 'tcp' | 'udp';
  description?: string;
}

export interface ContainerNetworkSpec {
  ports: ContainerNetworkPortSpec[];
  networkMode?: 'bridge' | 'host' | 'overlay' | 'none';
  aliases?: string[];
}

export interface ContainerStorageMountSpec {
  source: string;
  target: string;
  mode: 'rw' | 'ro';
  description?: string;
}

export interface ContainerStorageSpec {
  mounts: ContainerStorageMountSpec[];
  ephemeral?: boolean;
}

export interface ContainerEnvironmentVarSpec {
  key: string;
  value?: string;
  valueFromSecret?: string;
}

export interface ContainerEnvironmentSpec {
  workingDir?: string;
  user?: string;
  command?: string[];
  entrypoint?: string[];
  variables: ContainerEnvironmentVarSpec[];
}

export interface ContainerSpec extends BaseEntity {
  name: string;
  description?: string;
  boundaryKind: ContainerBoundaryKind;
  runtimeTemplate: RuntimeTemplateRef;
  resources: ContainerResourceSpec;
  network: ContainerNetworkSpec;
  storage: ContainerStorageSpec;
  environment: ContainerEnvironmentSpec;
  allowedRuntimeKinds: RuntimeUnitKind[];
  defaultEnvelopeId?: string;
  defaultRecoveryPolicyId?: string;
  labels: Record<string, string>;
  metadata?: Record<string, unknown>;
}
```

### 设计要点

1. `spec` 文件不放运行状态
2. `spec` 文件不放 CPU 实时占用
3. `spec` 文件不放心跳
4. `spec` 文件不放当前绑定关系

它只定义“应当是什么样”。

---

## 5.3 目标文件三：`src/types/container/runtime.ts`

### 角色

运行态核心文件。

### 主要对象

- `ContainerRuntime`
- `ContainerRuntimeStatus`
- `ContainerHealthState`
- `ContainerRuntimeResources`
- `HostPlacement`
- `ContainerFailureState`

### 建议内容

```ts
import type { BaseEntity } from '@/types/shared';

export type ContainerRuntimeStatus =
  | 'created'
  | 'starting'
  | 'running'
  | 'paused'
  | 'degraded'
  | 'restarting'
  | 'stopped'
  | 'failed'
  | 'quarantined';

export type ContainerHealthState = 'healthy' | 'warning' | 'critical' | 'unknown';

export interface HostPlacement {
  hostId?: string;
  nodeId?: string;
  region?: string;
  zone?: string;
  provider?: string;
}

export interface ContainerRuntimeResourceSnapshot {
  used: number;
  limit?: number;
  reserved?: number;
  unit: 'count' | 'mb' | 'bytes' | 'percent' | 'mbps';
}

export interface ContainerRuntimeResources {
  cpuPercent?: number;
  memory?: ContainerRuntimeResourceSnapshot;
  networkRxBytes?: number;
  networkTxBytes?: number;
  storageUsedBytes?: number;
  processCount?: number;
}

export interface ContainerFailureState {
  code: string;
  message: string;
  category:
    | 'runtime'
    | 'resource'
    | 'network'
    | 'binding'
    | 'permission'
    | 'recovery'
    | 'unknown';
  firstOccurredAt: number;
  lastOccurredAt: number;
  count: number;
}

export interface ContainerRuntime extends BaseEntity {
  specId: string;
  envelopeId?: string;
  status: ContainerRuntimeStatus;
  health: ContainerHealthState;
  host: HostPlacement;
  resources: ContainerRuntimeResources;
  activeBindingIds: string[];
  ingressSessionIds: string[];
  executionSessionIds: string[];
  startedAt?: number;
  stoppedAt?: number;
  lastHeartbeatAt?: number;
  restartCount: number;
  failureState?: ContainerFailureState;
  metadata?: Record<string, unknown>;
}
```

### 设计要点

1. `runtime` 不关心镜像模板细节
2. `runtime` 不关心默认策略模板
3. `runtime` 关心现在发生了什么
4. `runtime` 要给 runtime registry 预留关系字段

---

## 5.4 目标文件四：`src/types/container/envelope.ts`

### 角色

治理态核心文件。

### 主要对象

- `ContainerEnvelope`
- `ObservationPolicy`

### 建议内容

```ts
import type { BaseEntity } from '@/types/shared';
import type { ActorScope, AuditLevel, IsolationLevel } from './boundary';
import type {
  CapitalAccessPolicy,
  ContainerRiskConstraint,
  DataAccessPolicy,
  ExecutionPermission,
} from './policy';
import type { RecoveryPolicy } from './recovery';

export interface ObservationPolicy {
  retainLogs: boolean;
  retainMetrics: boolean;
  retainEvents: boolean;
  logRetentionDays?: number;
  metricRetentionDays?: number;
  eventRetentionDays?: number;
}

export interface ContainerEnvelope extends BaseEntity {
  name: string;
  description?: string;
  isolationLevel: IsolationLevel;
  executionPermissions: ExecutionPermission[];
  dataAccessPolicy: DataAccessPolicy;
  capitalAccessPolicy: CapitalAccessPolicy;
  riskConstraints: ContainerRiskConstraint[];
  recoveryPolicy: RecoveryPolicy;
  observationPolicy: ObservationPolicy;
  auditLevel: AuditLevel;
  mutableBy: ActorScope[];
  metadata?: Record<string, unknown>;
}
```

### 设计要点

`Envelope` 是这次边界扩张真正的新层。

它不等于技术配置，而是：

- 制度边界
- 权限边界
- 风险边界
- 恢复边界

---

## 5.5 目标文件五：`src/types/container/policy.ts`

### 角色

治理子对象文件。

### 主要对象

- `ExecutionPermission`
- `DataAccessPolicy`
- `CapitalAccessPolicy`
- `ContainerRiskConstraint`

### 建议内容

```ts
export type ExecutionPermission =
  | 'read_market_data'
  | 'emit_signal'
  | 'create_order_intent'
  | 'submit_paper_order'
  | 'submit_live_order'
  | 'cancel_order'
  | 'request_rebalance'
  | 'pause_runtime_unit';

export interface DataAccessPolicy {
  allowedDataSourceIds: string[];
  allowedDataTypes: string[];
  allowedSymbols?: string[];
  maxSubscriptions?: number;
  maxMessagesPerSecond?: number;
  allowExternalResearchFeeds: boolean;
}

export interface CapitalAccessPolicy {
  visibleAccountIds: string[];
  writableAccountIds: string[];
  canRequestRebalance: boolean;
  canMoveCapitalAutomatically: boolean;
  dailyCapitalImpactLimit?: number;
}

export interface ContainerRiskConstraint {
  id: string;
  name: string;
  type:
    | 'max_exposure'
    | 'max_daily_loss'
    | 'max_order_rate'
    | 'max_runtime_units'
    | 'max_data_rate'
    | 'custom';
  enabled: boolean;
  params: Record<string, unknown>;
  action: 'warn' | 'pause' | 'quarantine' | 'deny';
}
```

### 设计要点

这些对象放在单独文件里，是为了避免 `envelope.ts` 变成“大治理垃圾桶”。

---

## 5.6 目标文件六：`src/types/container/recovery.ts`

### 角色

恢复与韧性策略文件。

### 主要对象

- `RecoveryPolicy`
- `RecoveryMode`

### 建议内容

```ts
export type RecoveryMode =
  | 'manual'
  | 'auto-restart'
  | 'checkpoint-restore'
  | 'rebind-runtime-units'
  | 'quarantine-and-escalate';

export interface RecoveryPolicy {
  mode: RecoveryMode;
  maxAttempts?: number;
  cooldownMs?: number;
  checkpointEnabled?: boolean;
  autoReconnectIngress?: boolean;
  escalateOnFailure?: boolean;
}
```

---

## 5.7 目标文件七：`src/types/container/binding.ts`

### 角色

表达容器与 runtime unit 的正式关系。

### 主要对象

- `ContainerBinding`
- `BindingRole`
- `BindingState`

### 建议内容

```ts
import type { BaseEntity } from '@/types/shared';
import type { RuntimeUnitKind } from './boundary';

export type BindingRole =
  | 'primary-host'
  | 'sidecar'
  | 'execution-gateway'
  | 'data-ingress-worker'
  | 'observation-worker';

export type BindingState = 'attaching' | 'active' | 'degraded' | 'detaching' | 'detached' | 'failed';

export interface ContainerBinding extends BaseEntity {
  containerRuntimeId: string;
  runtimeUnitKind: RuntimeUnitKind;
  runtimeUnitId: string;
  role: BindingRole;
  state: BindingState;
  attachedAt: number;
  detachedAt?: number;
  metadata?: Record<string, unknown>;
}
```

### 为什么第一阶段就要落 `binding`

因为不落它，容器就还是列表项，不是关系节点。

---

## 5.8 目标文件八：`src/types/container/observation.ts`

### 角色

观测态对象。

### 主要对象

- `ContainerObservation`
- `ContainerMetricSnapshot`
- `DependencyHealthSnapshot`
- `LogCursorRef`

### 建议内容

```ts
export interface LogCursorRef {
  source: string;
  cursor: string;
}

export interface DependencyHealthSnapshot {
  dependencyKind: 'data-source' | 'execution-adapter' | 'capital-service' | 'risk-service' | 'agent-service';
  dependencyId: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  message?: string;
  checkedAt: number;
}

export interface ContainerMetricSnapshot {
  cpuPercent?: number;
  memoryPercent?: number;
  restartCount: number;
  activeRuntimeUnitCount: number;
  activeIngressCount: number;
  errorRate?: number;
}

export interface ContainerObservation {
  containerRuntimeId: string;
  metrics: ContainerMetricSnapshot;
  alertIds: string[];
  logs: LogCursorRef[];
  latestEventIds: string[];
  dependencyHealth: DependencyHealthSnapshot[];
  updatedAt: number;
}
```

---

## 5.9 目标文件九：`src/types/container/event.ts`

### 角色

容器边界事件模型。

### 主要对象

- `ContainerEventType`
- `ContainerEvent`
- `EntityRef`
- `ActorRef`

### 建议内容

```ts
export interface EntityRef {
  kind: string;
  id: string;
}

export interface ActorRef {
  scope: 'system' | 'operator' | 'agent' | 'automation' | 'runtime-service';
  id?: string;
  name?: string;
}

export type ContainerEventType =
  | 'container.runtime.created'
  | 'container.runtime.started'
  | 'container.runtime.stopped'
  | 'container.runtime.failed'
  | 'container.binding.attached'
  | 'container.binding.detached'
  | 'container.ingress.connected'
  | 'container.ingress.disconnected'
  | 'container.permission.denied'
  | 'container.risk.triggered'
  | 'container.runtime.quarantined'
  | 'container.recovery.started'
  | 'container.recovery.completed'
  | 'container.recovery.failed';

export interface ContainerEvent {
  id: string;
  type: ContainerEventType;
  containerRuntimeId: string;
  envelopeId?: string;
  relatedEntityRefs: EntityRef[];
  severity: 'info' | 'warning' | 'critical';
  payload: Record<string, unknown>;
  occurredAt: number;
  actor?: ActorRef;
  traceId?: string;
}
```

### 设计要点

第一阶段不必做完整 runtime event 总线，但类型要先稳定。

---

## 5.10 目标文件十：`src/types/container/view.ts`

### 角色

兼容旧 UI 的视图模型。

### 主要对象

- `LegacyContainerViewModel`
- `ContainerListItemViewModel`

### 建议内容

```ts
export interface LegacyContainerViewModel {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'error' | 'starting';
  ports: Array<{
    host: number;
    container: number;
    protocol: 'tcp' | 'udp';
  }>;
  envVars: Record<string, string>;
  createdAt: number;
  updatedAt: number;
  cpu?: number;
  memory?: string;
  memoryUsed?: number;
  memoryTotal?: number;
  uptime?: string;
  strategy?: string;
}

export interface ContainerListItemViewModel {
  id: string;
  name: string;
  boundaryKind: string;
  runtimeStatus: string;
  health: string;
  activeRuntimeUnitCount: number;
  cpuPercent?: number;
  memoryPercent?: number;
  isolationLevel?: string;
}
```

### 为什么第一阶段必须保留 view model

因为当前很多组件只需要列表展示能力。

如果没有 view model，组件迁移就会被强行和领域重构绑死。

---

## 5.11 目标文件十一：`src/types/container/index.ts`

### 角色

统一导出。

### 作用

允许其他模块使用：

```ts
import type { ContainerSpec, ContainerRuntime } from '@/types/container';
```

而不关心子文件组织细节。

### 建议结构

```ts
export * from './boundary';
export * from './spec';
export * from './runtime';
export * from './envelope';
export * from './binding';
export * from './observation';
export * from './event';
export * from './policy';
export * from './recovery';
export * from './view';
```

---

## 5.12 过渡入口：`src/types/container.ts`

### 角色

旧路径兼容入口。

### 第一阶段建议

`src/types/container.ts` 不再作为实现文件，而是：

- re-export 新目录
- 保留旧名称的兼容别名

### 兼容策略

可以在文件头说明：

- 这是过渡入口
- 新实现位于 `src/types/container/`

---

## 6. `src/types/shared.ts` 的处理策略

### 6.1 当前问题

[src/types/shared.ts](E:/NEMT%20runtime/src/types/shared.ts) 里存在旧版 `Container` 与 `ContainerPort`。

如果不处理，会继续制造多份真相。

### 6.2 第一阶段建议

不要在 `shared.ts` 再维护容器结构。

建议做两件事：

1. 删除或弃用 `shared.ts` 中的具体容器结构
2. 如果为了兼容短期必须保留，则改成类型别名

例如：

```ts
export type { LegacyContainerViewModel as Container } from '@/types/container';
```

不过更推荐直接减少 `shared.ts` 的容器职责，只保留：

- `BaseEntity`
- `NamedEntity`
- 通用错误
- 通用工具类型

### 6.3 原则

共享层不要再承载领域实现细节。

否则所有领域都会被塞回 `shared.ts`。

---

## 7. `src/stores` 拆分方案

类型层抬高之后，store 也必须重组。

---

## 7.1 总体原则

不要再有一个同时负责：

- 定义态
- 运行态
- 选择态
- 过滤态
- 观测态
- 治理态

的单一 `containerStore.ts`。

### 推荐拆法

1. `containerSpecStore`
2. `containerRuntimeStore`
3. `containerEnvelopeStore`
4. `containerObservationStore`
5. `containerViewStore`
6. `containerStore.ts` 作为 façade 过渡入口

---

## 7.2 目标 store 一：`src/stores/container/containerSpecStore.ts`

### 职责

- 管理 `ContainerSpec`
- 选择当前 spec
- CRUD spec
- 查询按边界类型分类的 spec

### 状态建议

```ts
interface ContainerSpecState {
  specs: ContainerSpec[];
  selectedSpecId: string | null;
}
```

### Action 建议

```ts
interface ContainerSpecActions {
  addSpec: (spec: ContainerSpec) => void;
  updateSpec: (id: string, updates: Partial<ContainerSpec>) => void;
  removeSpec: (id: string) => void;
  selectSpec: (id: string | null) => void;
  setSpecs: (specs: ContainerSpec[]) => void;
}
```

### Selectors 建议

- `useContainerSpecs`
- `useSelectedContainerSpecId`
- `useSelectedContainerSpec`
- `useContainerSpecsByBoundaryKind`

---

## 7.3 目标 store 二：`src/stores/container/containerRuntimeStore.ts`

### 职责

- 管理 `ContainerRuntime`
- 运行状态更新
- 心跳更新时间
- 失败状态更新
- 绑定 id 列表维护

### 状态建议

```ts
interface ContainerRuntimeState {
  runtimes: ContainerRuntime[];
  selectedRuntimeId: string | null;
  isRefreshing: boolean;
  filter: 'all' | ContainerRuntimeStatus;
}
```

### Action 建议

```ts
interface ContainerRuntimeActions {
  addRuntime: (runtime: ContainerRuntime) => void;
  updateRuntime: (id: string, updates: Partial<ContainerRuntime>) => void;
  removeRuntime: (id: string) => void;
  selectRuntime: (id: string | null) => void;
  setRuntimes: (runtimes: ContainerRuntime[]) => void;
  setRefreshing: (value: boolean) => void;
  setFilter: (filter: 'all' | ContainerRuntimeStatus) => void;
  attachBindingId: (runtimeId: string, bindingId: string) => void;
  detachBindingId: (runtimeId: string, bindingId: string) => void;
  updateHeartbeat: (runtimeId: string, timestamp: number) => void;
}
```

### Selectors 建议

- `useContainerRuntimes`
- `useSelectedContainerRuntimeId`
- `useSelectedContainerRuntime`
- `useFilteredContainerRuntimes`
- `useContainerRuntimeStats`

---

## 7.4 目标 store 三：`src/stores/container/containerEnvelopeStore.ts`

### 职责

- 管理 `ContainerEnvelope`
- 管理 envelope 模板
- 查询不同隔离级别/权限组合

### 状态建议

```ts
interface ContainerEnvelopeState {
  envelopes: ContainerEnvelope[];
  selectedEnvelopeId: string | null;
}
```

### Action 建议

- `addEnvelope`
- `updateEnvelope`
- `removeEnvelope`
- `selectEnvelope`
- `setEnvelopes`

### Selectors 建议

- `useContainerEnvelopes`
- `useSelectedContainerEnvelope`
- `useEnvelopesByIsolationLevel`

---

## 7.5 目标 store 四：`src/stores/container/containerObservationStore.ts`

### 职责

- 管理 `ContainerObservation`
- 更新容器观测快照
- 聚合告警引用、事件引用

### 状态建议

```ts
interface ContainerObservationState {
  observations: Record<string, ContainerObservation>;
}
```

### Action 建议

- `setObservation`
- `updateObservation`
- `removeObservation`
- `appendEventRef`
- `setAlertRefs`

### Selectors 建议

- `useContainerObservation(runtimeId)`
- `useContainerMetrics(runtimeId)`
- `useContainerDependencyHealth(runtimeId)`

---

## 7.6 目标 store 五：`src/stores/container/containerViewStore.ts`

### 职责

这是过渡期的“聚合视图 store”。

它不一定要持久化自己的源数据，而是可以：

- 从 `specStore`
- `runtimeStore`
- `envelopeStore`
- `observationStore`

组装出 UI 继续能用的 view model。

### 为什么需要它

因为当前大量页面只想要：

- 容器列表
- 容器概览
- 简单详情

而不是直接消费多层领域对象。

### 输出建议

- `LegacyContainerViewModel[]`
- `ContainerListItemViewModel[]`

---

## 7.7 过渡 façade：`src/stores/containerStore.ts`

### 角色

保留原路径兼容。

### 第一阶段建议

这个文件不再自己定义容器类型，不再做核心实现。

改成：

- 从 `src/stores/container/` 聚合导出
- 或提供兼容 hooks

例如：

```ts
export { useContainerViewStore as useContainerStore } from './container/containerViewStore';
export { useLegacyContainers as useContainers } from './container/containerViewStore';
```

### 原则

新核心不能继续藏在旧 store 文件里。

---

## 8. 服务层建议

为了避免把所有聚合逻辑塞进 store，建议引入最小服务层。

---

## 8.1 `src/services/container/containerViewAssembler.ts`

### 职责

从：

- `ContainerSpec`
- `ContainerRuntime`
- `ContainerEnvelope`
- `ContainerObservation`

组装出：

- `LegacyContainerViewModel`
- `ContainerListItemViewModel`

### 为什么有必要

因为视图组装是“变换逻辑”，不是 store 的状态职责。

---

## 8.2 `src/services/container/containerPlacementService.ts`

### 职责

第一阶段不必做复杂 placement，但要为之后 `StrategyRuntime -> ContainerRuntime` 绑定预留服务位置。

可先提供：

- `canPlaceRuntimeUnit`
- `attachRuntimeUnit`
- `detachRuntimeUnit`

### 为什么现在就要建壳

因为后续绑定逻辑如果散落在组件里，就又会回到重 `App.tsx` 和重页面逻辑。

---

## 8.3 `src/services/container/containerPolicyService.ts`

### 职责

负责判断：

- envelope 是否允许某类 runtime
- 是否具备某种执行权限
- 是否允许访问某类数据或资本

第一阶段即使只做纯函数，也值得建立。

---

## 8.4 `src/services/container/containerEventService.ts`

### 职责

第一阶段可以非常轻，只要统一 event 组装和追加逻辑即可。

目的不是做完整事件基础设施，而是防止事件写法散落。

---

## 9. 第一批要落地的接口文件清单

这一节给出最实用的部分：第一批文件到底有哪些。

---

## 9.1 `src/types/container/`

第一批必须新增：

1. `boundary.ts`
2. `spec.ts`
3. `runtime.ts`
4. `envelope.ts`
5. `policy.ts`
6. `recovery.ts`
7. `binding.ts`
8. `observation.ts`
9. `event.ts`
10. `view.ts`
11. `index.ts`

### 第一批暂时不新增

以下文件可以放第二批：

- `checkpoint.ts`
- `placement.ts`
- `migration.ts`
- `session.ts`

---

## 9.2 `src/stores/container/`

第一批必须新增：

1. `containerSpecStore.ts`
2. `containerRuntimeStore.ts`
3. `containerEnvelopeStore.ts`
4. `containerObservationStore.ts`
5. `containerViewStore.ts`
6. `index.ts`

### 第一批可暂缓

- `containerBindingStore.ts`
- `containerEventStore.ts`

这两个可在第二阶段加入。

第一阶段可以把 `binding`、`event` 先放在 runtime / observation 辅助字段里过渡，但类型必须先定义好。

---

## 9.3 `src/services/container/`

第一批建议新增：

1. `containerViewAssembler.ts`
2. `containerPolicyService.ts`

### 第二批建议新增

3. `containerPlacementService.ts`
4. `containerEventService.ts`

---

## 10. `src/types/index.ts` 的更新策略

当前 [src/types/index.ts](E:/NEMT%20runtime/src/types/index.ts) 已经导出旧容器类型。

### 第一阶段目标

让它成为新的容器分层出口。

### 更新建议

新增导出：

- `ContainerSpec`
- `ContainerRuntime`
- `ContainerEnvelope`
- `ContainerBinding`
- `ContainerObservation`
- `RecoveryPolicy`
- `ExecutionPermission`
- `DataAccessPolicy`
- `CapitalAccessPolicy`
- `LegacyContainerViewModel`

### 保留兼容

如有必要，可保留：

- `ContainerState`
- `ContainerStatus`

但应逐步替换为：

- `ContainerRuntimeStatus`
- `ContainerHealthState`

---

## 11. 与现有组件的兼容策略

### 11.1 哪些组件短期不该直接碰

第一阶段不建议直接重写：

- `CreateContainerModal.tsx`
- 容器列表页
- 监控面板中已有容器概览 UI

因为这会把“结构改造”和“交互改造”绑在一起。

### 11.2 哪些组件可以后续逐步接新模型

优先顺序建议：

1. 容器列表组件
2. 容器详情组件
3. 创建容器弹窗
4. 策略与容器绑定界面

### 11.3 UI 过渡原则

组件第一阶段优先读取：

- `LegacyContainerViewModel`

第二阶段再开始读取：

- `ContainerListItemViewModel`
- `ContainerRuntime`
- `ContainerEnvelope`

---

## 12. 与 Strategy / DataSource / Risk 的接口衔接建议

虽然本次主要做容器边界，但必须为其他域预留连接点。

---

## 12.1 Strategy 衔接

第一阶段不要求把完整 `StrategyRuntime` 落完，但需要预留字段：

- `ContainerBinding.runtimeUnitKind = 'strategy-runtime'`
- `ContainerBinding.runtimeUnitId = strategyRuntimeId`

同时建议在未来 `src/types/strategy.ts` 中稳定：

- `StrategyDefinition`
- `StrategyRuntime`

否则容器会无处挂接。

---

## 12.2 DataSource 衔接

当前 [src/types/dataSource.ts](E:/NEMT%20runtime/src/types/dataSource.ts) 已有较完整定义。

第一阶段先不要重写它，但容器 policy 中要允许：

- `allowedDataSourceIds`
- `allowedDataTypes`
- `allowedSymbols`

这就足够为下一阶段容器数据边界做铺垫。

---

## 12.3 Risk 衔接

第一阶段也不必改完风险系统，但容器层必须已经能表达：

- `ContainerRiskConstraint`

这样后面风险引擎才有地方把边界约束挂进去。

---

## 13. 文件级实施顺序

这是建议的真实编码顺序。

---

## 第一步：先建类型目录，不动旧逻辑

先新增：

- `src/types/container/`

完成：

- 所有新接口文件
- `index.ts`

这一步目标只是把“语言建起来”。

### 完成标志

- 新类型可编译
- 不影响现有 UI

---

## 第二步：把 `src/types/container.ts` 改为出口层

做：

- re-export 新目录
- 保留兼容导出

### 完成标志

- 老 import 不大面积炸
- 新模块可以从旧入口读到新类型

---

## 第三步：收敛 `shared.ts` 容器定义

做：

- 删除或弃用 `shared.ts` 中容器结构
- 改为导出容器 view model 或直接移除容器职责

### 完成标志

- 仓库不再存在三套容器实体真相

---

## 第四步：新增容器 store 子目录

先新增：

- `containerSpecStore.ts`
- `containerRuntimeStore.ts`
- `containerEnvelopeStore.ts`
- `containerObservationStore.ts`

### 完成标志

- 新 store 能独立工作
- 还不需要 UI 全部切换

---

## 第五步：新增 `containerViewAssembler.ts`

这一步把兼容层接上。

### 完成标志

- 可以从新对象拼出旧 UI 所需模型

---

## 第六步：把 `containerStore.ts` 改成 façade

这一步是迁移分水岭。

### 完成标志

- 旧组件仍可通过近似原方式拿到容器列表
- 内部数据来源已经是新分层

---

## 第七步：引入第一版 `ContainerBinding`

即使暂时没有独立 binding store，也要先：

- 在 `runtime` 中保留 `activeBindingIds`
- 在类型层完整定义 `ContainerBinding`

### 完成标志

- 容器开始成为关系节点

---

## 14. 第一批接口文件的最小可用版本标准

为了避免一开始过度设计，下面定义第一批文件的“最小可用标准”。

### `spec.ts`

最小标准：

- 能描述镜像模板
- 能描述资源
- 能描述网络/存储/环境
- 能描述 `allowedRuntimeKinds`

### `runtime.ts`

最小标准：

- 能描述运行状态
- 能描述健康度
- 能描述资源快照
- 能持有 `activeBindingIds`

### `envelope.ts`

最小标准：

- 能描述隔离级别
- 能描述执行权限
- 能描述数据/资本访问
- 能描述恢复策略

### `binding.ts`

最小标准：

- 能挂 runtime unit
- 能描述绑定角色与状态

### `view.ts`

最小标准：

- 能覆盖当前 `containerStore.ts` 里的旧 UI 数据需求

---

## 15. 第一阶段验收清单

当第一阶段结束时，应该满足：

```text
□ `src/types/container/` 目录存在且编译通过
□ `src/types/container.ts` 已变为兼容出口
□ `shared.ts` 不再维护另一套容器实体
□ `src/stores/container/` 已存在分层 store
□ `containerStore.ts` 不再是核心真相来源
□ 可以从新分层对象组装出旧 UI 容器列表模型
□ 容器已经能表达 `Spec / Runtime / Envelope`
□ 容器已经能表达 `Binding`
```

---

## 16. 第一阶段不要犯的错误

### 错误 1：继续往 `Container` 扁平接口加字段

这是最容易发生的退化。

### 错误 2：store 继续自定义轻量容器类型

所有 store 都应该引用 `src/types/container/` 的类型。

### 错误 3：把兼容层直接做成新真相来源

`LegacyContainerViewModel` 只是过渡视图，不是领域核心。

### 错误 4：还没建好多层类型，就先重写 UI

会导致架构升级再次沦为页面升级。

### 错误 5：让 `shared.ts` 继续成为大杂烩

共享层不能代替领域层。

---

## 17. 推荐的第一批编码任务拆解

如果要把工作拆成真正的执行任务，可以这么排。

### Task 1

新建 `src/types/container/` 目录和 11 个文件骨架。

### Task 2

实现 `boundary.ts / spec.ts / runtime.ts / envelope.ts / policy.ts / recovery.ts / binding.ts / observation.ts / event.ts / view.ts / index.ts`。

### Task 3

把 `src/types/container.ts` 改成新的聚合出口。

### Task 4

清理 `src/types/shared.ts` 中的旧容器实体职责。

### Task 5

新建 `src/stores/container/` 目录并落地前四个 store。

### Task 6

实现 `containerViewAssembler.ts`。

### Task 7

把 `src/stores/containerStore.ts` 改造成 façade。

### Task 8

跑 typecheck，修正所有受影响的 import 和类型引用。

---

## 18. 后续第二阶段衔接图

当第一阶段做完后，第二阶段就可以自然进入：

1. 建 `ContainerBindingStore`
2. 建 `ContainerEventStore`
3. 建 `containerPlacementService`
4. 在 `strategy` 域落 `StrategyRuntime`
5. 建第一版 runtime registry

这说明第一阶段不是孤岛，而是大边界轨道的起点。

---

## 19. 最后结论

如果说上一份文档解决的是“为什么容器边界必须抬高”，那么这份蓝图解决的是“这件事第一刀应该切哪里”。

最重要的决策有四个：

1. 不再继续维护扁平单体 `Container`
2. 在 `src/types/container/` 下建立多层分解
3. 在 `src/stores/container/` 下建立分层 store
4. 用 `LegacyContainerViewModel` 做兼容过渡，而不是让旧 store 继续做真相来源

一旦这四件事成立，容器就会开始从：

- 一个 UI 中的基础设施对象

转变为：

- 一个可以承载 runtime、治理、观测、恢复、绑定关系的软件边界壳

这就是代码层面的“边界扩张一维”。

