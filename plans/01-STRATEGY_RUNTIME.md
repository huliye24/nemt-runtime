# 扩张计划一：Strategy Definition → Strategy Runtime

## 阶段定位

**第一优先级的结构工程。** 在容器域已完成分层拆分的前提下，策略是第二个必须正式化为运行时对象的核心领域。这一步让策略从"页面上的配置项"升级为"运行时世界的居民"。

## 前置依赖

- [x] 容器域已完成 Spec / Runtime / Envelope / Binding / Observation / Event 分层
- [x] `src/types/container/` 目录和类型已落地
- [x] `src/stores/container/` 分层 Store 已建立

## 当前问题

1. 策略主要作为 `StrategyData` 存在——这是 UI 数据结构，不是领域对象
2. 策略无法表达"正在运行中 / 运行了多久 / 归属哪个容器"
3. ContainerBinding 的 `runtimeUnitKind = 'strategy-runtime'` 已经定义，但没有对应的 StrategyRuntime 来承接
4. 执行页和回测页各自维护对策略的理解，没有共享的运行时真相

## 目标

完成以下问题可以被系统回答：

- 某个策略定义是什么？（definition）
- 某个策略是否正在运行？（runtime）
- 策略跑在哪个容器里？（binding）
- 策略最近一次心跳是什么时候？（runtime heath）
- 策略产生了哪些信号/订单？（runtime outputs）

## 新建文件清单

```
src/
  types/
    strategy/
      definition.ts        # StrategyDefinition 类型
      runtime.ts           # StrategyRuntime + StrategyRuntimeMetrics + StrategyRuntimeError
      event.ts             # StrategyEvent 类型
      view.ts              # StrategyViewModel（兼容旧 UI）
      index.ts             # 统一导出

  stores/
    strategy/
      strategyDefinitionStore.ts   # 定义态 CRUD + 选择
      strategyRuntimeStore.ts      # 运行态管理 + 心跳 + 容器归属
      strategyViewStore.ts         # 聚合兼容视图
      index.ts

  services/
    strategy/
      strategyViewAssembler.ts     # Definition + Runtime → ViewModel
      strategyPlacementService.ts  # 策略放置到容器的规则
```

## 关键类型定义

### StrategyDefinition

```ts
interface StrategyDefinition extends BaseEntity {
  name: string;
  description?: string;
  author: string;
  version: string;
  code: string;
  language: 'python' | 'typescript' | 'lua' | 'custom';
  config: Record<string, unknown>;
  tags: string[];
  riskDefaults?: {
    maxPositionSize?: number;
    maxDrawdown?: number;
    maxDailyLoss?: number;
  };
  preferredContainerBoundaryKinds: ContainerBoundaryKind[];
  publishedAt?: number;
  publishedSettings?: StrategyPublishedSettings;
}
```

### StrategyRuntime

```ts
type StrategyRuntimeStatus =
  | 'created'
  | 'starting'
  | 'running'
  | 'paused'
  | 'degraded'
  | 'stopped'
  | 'failed';

interface StrategyRuntime extends BaseEntity {
  strategyDefinitionId: string;
  status: StrategyRuntimeStatus;
  containerRuntimeId?: string;
  startedAt?: number;
  stoppedAt?: number;
  lastHeartbeatAt?: number;
  subscribedSymbols: string[];
  activeSignalIds: string[];
  activeOrderIntentIds: string[];
  positionSnapshotIds: string[];
  errorIds: string[];
  metrics: StrategyRuntimeMetrics;
  metadata?: Record<string, unknown>;
}

interface StrategyRuntimeMetrics {
  signalsGenerated: number;
  ordersPlaced: number;
  ordersFilled: number;
  uptimeSeconds: number;
  todayPnl: number;
  totalPnl: number;
  successRate: number;
}
```

## Store 设计

### strategyDefinitionStore

| 状态 | 类型 |
|---|---|
| definitions | `StrategyDefinition[]` |
| selectedId | `string \| null` |

| Action | 签名 |
|---|---|
| addDefinition | `(d: StrategyDefinition) => void` |
| updateDefinition | `(id: string, u: Partial<StrategyDefinition>) => void` |
| removeDefinition | `(id: string) => void` |
| selectDefinition | `(id: string \| null) => void` |

Selector: `useStrategyDefinitions`, `useSelectedStrategyDefinition`, `useDefinitionsByTag`

### strategyRuntimeStore

| 状态 | 类型 |
|---|---|
| runtimes | `StrategyRuntime[]` |
| selectedId | `string \| null` |
| filter | `'all' \| StrategyRuntimeStatus` |

| Action | 签名 |
|---|---|
| addRuntime | `(r: StrategyRuntime) => void` |
| updateRuntime | `(id: string, u: Partial<StrategyRuntime>) => void` |
| removeRuntime | `(id: string) => void` |
| updateHeartbeat | `(id: string, ts: number) => void` |
| assignContainer | `(runtimeId: string, containerId: string) => void` |

Selector: `useStrategyRuntimes`, `useSelectedStrategyRuntime`, `useRuntimesByContainer`, `useRuntimesByStatus`

## 迁移步骤

| Step | 操作 | 影响范围 |
|---|---|---|
| 1 | 新建 `src/types/strategy/` 全部类型文件 | 无，纯类型新增 |
| 2 | 更新 `src/types/index.ts` 导出新类型 | 全局类型入口 |
| 3 | 新建 `src/stores/strategy/` 全部 Store | 无，纯 Store 新增 |
| 4 | 实现 `strategyViewAssembler` | 兼容层 |
| 5 | "启动执行"入口改为生成 StrategyRuntime | execution 相关组件 |
| 6 | 容器绑定改为绑定 runtimeId（非 definitionId） | ContainerBinding 相关 |
| 7 | 执行页/监控页改为读取 StrategyRuntime | execution/monitor 组件 |
| 8 | 旧 `StrategyData` 降级为 ViewModel 别名 | 全局 import |

## 验收标准

```
□ src/types/strategy/ 目录存在且所有类型编译通过
□ src/stores/strategy/ 目录存在且 Store 可独立工作
□ 启动策略执行时会正式生成 StrategyRuntime 对象
□ ContainerBinding.runtimeUnitId 绑定的是 strategyRuntime.id
□ 执行页可通过 StrategyRuntime 读取运行状态
□ 监控页可通过 StrategyRuntime 读取心跳和健康度
□ 旧 UI（策略列表等）继续可用（通过 ViewModel 兼容）
```
