# 扩张计划二：Runtime Registry

## 阶段定位

**运行时世界的总登记处。** 容器和策略都有了 Runtime 对象之后，需要一个统一的地方登记、查询、关联所有运行时实例。这是从"局部有 runtime"到"系统有运行时图谱"的质变步骤。

## 前置依赖

- [x] 容器域 Runtime 已正式化
- [ ] 策略域 Runtime 已正式化（计划一完成后）

## 当前问题

1. ContainerRuntime 在 containerRuntimeStore 里，StrategyRuntime 在 strategyRuntimeStore 里，没有任何总表
2. 想回答"当前系统有哪些 runtime 在运行"需要手工查多个 Store
3. 监控页需要聚合所有运行时对象的状态，但没有聚合入口
4. 容器与策略的关系靠 binding store 维护，但没有统一的跨域关系索引
5. Timeline / Audit 没有主干数据来源

## 目标

Registry 不是把所有对象复制一遍——它是**索引层 + 关系簿**。

完成以下查询不需要页面拼接：

```ts
getRuntimeById(runtimeId)
getRuntimesByKind('strategy-runtime')
getRuntimesByContainer(containerRuntimeId)
getFailedRuntimes()
getRuntimeRelations(runtimeId)
getActiveRuntimeCount()
```

## 新建文件清单

```
src/
  runtime/
    registry/
      runtimeRegistry.ts          # Registry 核心逻辑（同步 upsert）
      runtimeRegistryTypes.ts     # RuntimeKind / RegistryEntry / EntityRef
      runtimeRegistrySelectors.ts # 查询 Selector
      index.ts

  stores/
    runtime/
      runtimeRegistryStore.ts     # Registry 状态管理
      runtimeRegistryViewStore.ts # 聚合视图（Monitor / Explorer）
      index.ts

  services/
    runtime/
      runtimeRegistryService.ts   # 派生 + 同步规则
```

## 关键类型定义

### RuntimeKind

```ts
type RuntimeKind =
  | 'container-runtime'
  | 'strategy-runtime'
  | 'agent-runtime'
  | 'data-stream-runtime'
  | 'portfolio-runtime'
  | 'execution-adapter-runtime';
```

### RuntimeRegistryEntry

```ts
interface RuntimeRegistryEntry {
  runtimeId: string;
  runtimeKind: RuntimeKind;
  definitionId?: string;
  containerRuntimeId?: string;
  envelopeId?: string;
  status: string;
  health?: 'healthy' | 'warning' | 'critical' | 'unknown';
  relatedEntityRefs: EntityRef[];
  latestEventIds: string[];
  observationRef?: string;
  registeredAt: number;
  updatedAt: number;
}

interface EntityRef {
  kind: string;
  id: string;
}
```

### Registry Store 状态

```ts
interface RuntimeRegistryState {
  entries: Record<string, RuntimeRegistryEntry>;
}

// Actions
interface RuntimeRegistryActions {
  upsertEntry: (entry: RuntimeRegistryEntry) => void;
  removeEntry: (runtimeId: string) => void;
  updateEntryStatus: (runtimeId: string, status: string, health?: string) => void;
  addRelatedEntity: (runtimeId: string, ref: EntityRef) => void;
  appendEvent: (runtimeId: string, eventId: string) => void;
}
```

## Selector 清单

| Selector | 返回 | 用途 |
|---|---|---|
| `useRuntimeEntry(id)` | `RuntimeRegistryEntry \| null` | 单个查询 |
| `useRuntimesByKind(kind)` | `RuntimeRegistryEntry[]` | 按类型分组 |
| `useRuntimesByContainer(containerId)` | `RuntimeRegistryEntry[]` | 容器下的单元 |
| `useFailedRuntimes()` | `RuntimeRegistryEntry[]` | 健康告警 |
| `useRuntimeRelations(id)` | `EntityRef[]` | 关系图谱 |
| `useRegistryStats()` | `{ total, byKind, failed }` | 全局概览 |

## 同步策略

Registry 采用**显式同步写入**策略（第一阶段）：

```
创建 ContainerRuntime   → 同时 upsert registry entry
创建 StrategyRuntime    → 同时 upsert registry entry
运行时状态变更           → updateEntryStatus
绑定关系变更             → addRelatedEntity
运行时心跳               → 更新 updatedAt
```

后续阶段可改为 store 中间件自动派生。

## 迁移步骤

| Step | 操作 | 依赖 |
|---|---|---|
| 1 | 新建 `src/runtime/registry/` + 类型文件 | 无 |
| 2 | 新建 `src/stores/runtime/` + Store | 无 |
| 3 | ContainerRuntime 创建时同步 registry | 容器域 |
| 4 | StrategyRuntime 创建时同步 registry | 计划一 |
| 5 | 状态变更 + 绑定变更时同步更新 | 计划一 |
| 6 | 监控页改为通过 registry 聚合查询 | 监控组件 |
| 7 | 新增 Runtime Explorer 视图（可选） | registry store |

## 不要做的事

- 不要把 Registry 当大号状态仓库——它只存索引，不复制全部细节
- 不要一开始就做自动派生——先显式同步，保证语义清晰
- 不要试图一次性建模所有 RuntimeKind——只登记当前已有的 kind

## 验收标准

```
□ src/runtime/registry/ 目录存在且类型编译通过
□ src/stores/runtime/ 目录存在且 Store 可独立工作
□ ContainerRuntime 创建时自动登记到 registry
□ StrategyRuntime 创建时自动登记到 registry
□ getRuntimesByKind('strategy-runtime') 返回正确结果
□ getRuntimesByContainer(id) 返回正确结果
□ getFailedRuntimes() 返回正确结果
□ 监控页可以通过 registry 拿到全局运行时概览
```
