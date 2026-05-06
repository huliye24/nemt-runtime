# NEMT Runtime 三阶段演进执行计划

## 文档定位

本文档是 NEMT Runtime 下一阶段架构演进的正式执行计划。

它专门围绕三项关键改造展开：

1. `Strategy Runtime` 正式化
2. `Runtime Registry` 建立
3. 根组件减壳（`App.tsx` 去编排中心化）

这三项改造不是局部优化，而是把系统从“页面驱动的软件”推进到“运行时模型驱动的软件”的核心步骤。

本文档的目标不是描述理想状态，而是给出：

- 为什么要做
- 先做什么
- 后做什么
- 每一步改哪些文件
- 哪些结构要先落地
- 需要避免哪些陷阱
- 怎样验收每个阶段

这是一份执行文档，不是讨论文档。

---

## 一句话结论

NEMT Runtime 想从“量化平台前端”走向“量化运行时宿主”，必须完成三刀：

### 第一刀：`Strategy Runtime`

把策略从一个页面中的数据项，升级为一个正式的运行时对象。

### 第二刀：`Runtime Registry`

把所有运行时对象从分散状态袋子，升级为可被统一登记、查询、连接和解释的运行时图谱。

### 第三刀：根组件减壳

把 `App.tsx` 从业务编排中心，降回宿主外壳与界面路由层。

这三刀做完后，系统会从“功能的集合”变成“运行时世界的宿主”。

---

## 目录

1. 当前状态判断
2. 为什么这三刀必须一起看
3. 全局演进原则
4. 总体执行路线
5. 第一阶段：Strategy Runtime 正式化
6. 第二阶段：Runtime Registry 建立
7. 第三阶段：根组件减壳
8. 三阶段之间的依赖关系
9. 目录结构演进方案
10. 类型系统演进方案
11. Store 层演进方案
12. Service 层演进方案
13. View 层演进方案
14. 迁移顺序
15. 验收标准
16. 风险与回滚
17. 实施任务拆解
18. 文档与代码同步策略
19. 成功后的系统能力
20. 最终总结

---

## 1. 当前状态判断

为了让计划有可执行性，先明确当前代码到底到了哪一步。

### 1.1 当前已经完成的基础

当前仓库已经具备以下基础：

- `container` 域已开始多层分解
- `ContainerSpec / ContainerRuntime / ContainerEnvelope / ContainerBinding / ContainerObservation / ContainerEvent` 已经进入代码
- 容器页已经从局部 mock 开始向 store 驱动切换
- `CreateContainer` 流程已经能生成一批运行边界对象
- 高层文档已经具备 Runtime 思维

这说明项目已经完成了“第一批边界扩张的起势”。

### 1.2 当前仍然存在的结构问题

尽管方向已经变了，但当前结构还存在以下核心问题：

1. 策略对象仍主要以 UI 数据结构存在
2. `App.tsx` 仍承担大量业务编排职责
3. 容器虽然有了 runtime 层，但系统级 runtime 图谱尚未形成
4. strategy / container / portfolio / signal / risk 的关系仍然主要靠局部逻辑维系
5. runtime object 之间缺少一个稳定的统一登记与查询层
6. 页面仍有不少“旧世界 view model + 新边界骨架”的混合状态

### 1.3 为什么不能停在当前状态

如果停在当前状态，最容易出现的结构性问题是：

- 底层类型越来越先进
- 上层逻辑仍然堆在 `App.tsx`
- 视图继续依赖兼容层
- 各域开始出现“有 runtime 语义，但没有运行时中心”的中间态撕裂

所以必须继续推进。

---

## 2. 为什么这三刀必须一起看

很多团队会把这三件事拆开处理：

- 先做 Strategy
- 很久以后再做 Registry
- 再以后才想起 `App.tsx` 太重

这种做法通常会失败，因为这三件事不是平行事项，而是一个闭环。

### 2.1 没有 Strategy Runtime，会发生什么

如果没有 `StrategyRuntime`：

- 容器绑定的只是策略定义或策略列表项
- 策略仍然只是“配置块”
- 无法严肃表达心跳、运行状态、错误、容器归属、当前订阅、当前输出

### 2.2 没有 Runtime Registry，会发生什么

即使有了 `StrategyRuntime`：

- 各种 runtime 仍然分散在不同 store
- 无法稳定查询“谁在何处、受何约束、和谁相关”
- 事件、监控、审计、AI 解释都没有统一关系主干

### 2.3 没有根组件减壳，会发生什么

即使有了 runtime 和 registry：

- 业务编排仍留在 UI 根组件
- 系统行为继续由页面控制
- 宿主边界会变成“看起来先进，实际仍靠页面串起来”的伪中枢

### 2.4 三者正确的关系

正确顺序应该是：

1. 先让核心对象变成 Runtime
2. 再让 Runtime 进入 Registry
3. 最后把 UI 壳层对业务的直接编排权移交出去

这就是本文整体执行路线的基础逻辑。

---

## 3. 全局演进原则

在执行三刀过程中，必须遵守以下原则。

### 3.1 Definition / Runtime 强分离

任何对象都必须能清晰区分：

- 定义态
- 运行态
- 观测态
- 事件态

### 3.2 UI 不持有领域真相

组件可以持有：

- 展开状态
- 弹窗状态
- 过滤状态

组件不应该持有：

- 策略运行真相
- 容器运行真相
- runtime binding 真相

### 3.3 Registry 不是 UI Store

Registry 不是为了渲染页面而存在，而是为了组织运行时世界。

### 3.4 Service 层负责编排，Store 层负责持有状态

不要让编排逻辑再次大面积回流进 store 或根组件。

### 3.5 先建立轨道，再迁移页面

任何 UI 改造都应依赖稳定的类型层和服务层，而不是反过来。

---

## 4. 总体执行路线

总体执行路线分三大阶段，但每一阶段内部还会再拆成多个子阶段。

### 第一阶段：Strategy Runtime 正式化

目标：

- 建立 `StrategyDefinition` / `StrategyRuntime`
- 把策略从 UI 列表项升级为运行单元
- 让容器绑定的是真正 runtime，而不是展示数据

### 第二阶段：Runtime Registry 建立

目标：

- 建统一运行时登记层
- 让策略、容器、Agent、数据、组合等 runtime 进入统一查询面
- 让关系问题从“临时拼接”变成“正式索引”

### 第三阶段：根组件减壳

目标：

- 把业务初始化、创建流程、绑定流程、seed 流程从 `App.tsx` 中剥离
- 让 `App.tsx` 只剩宿主壳职责

---

## 5. 第一阶段：Strategy Runtime 正式化

这一步是最基础也是最关键的一步。

---

## 5.1 目标定义

把当前系统中的“策略”从 UI 数据对象，拆成两层正式领域对象：

- `StrategyDefinition`
- `StrategyRuntime`

### `StrategyDefinition` 回答的问题

- 策略叫什么
- 策略的代码是什么
- 参数是什么
- 标签是什么
- 作者是谁
- 它可被部署到哪类宿主

### `StrategyRuntime` 回答的问题

- 它现在是否在运行
- 跑在哪个容器边界
- 最近心跳是什么时候
- 订阅了哪些 symbol
- 发出了哪些 signal
- 有没有错误
- 当前执行态如何

---

## 5.2 当前问题分析

当前策略相关对象主要还是：

- `StrategyData`
- 某些类型文件中的 `Strategy`
- 页面内部使用的策略项

它们能表达“存在一个策略”，但不够表达“这个策略现在作为 runtime unit 处于什么状态”。

这导致几个问题：

1. 容器绑定策略时，绑定对象语义过弱
2. 执行页和回测页很难共享正式 runtime truth
3. monitor 页难以围绕策略 runtime 建统一观察模型

---

## 5.3 第一阶段建议目录结构

建议将策略域演进为：

```text
src/
  types/
    strategy/
      definition.ts
      runtime.ts
      policy.ts
      metrics.ts
      event.ts
      view.ts
      index.ts
```

如果暂时不希望引入 `types/strategy/` 目录，也至少要在现有 `strategy.ts` 中拆出明确分区。

但从长期看，目录化更稳。

---

## 5.4 推荐类型拆分

### `StrategyDefinition`

建议字段：

- `id`
- `name`
- `description`
- `author`
- `version`
- `code`
- `language`
- `config`
- `tags`
- `riskDefaults`
- `preferredContainerBoundaryKinds`
- `createdAt`
- `updatedAt`

### `StrategyRuntime`

建议字段：

- `id`
- `strategyDefinitionId`
- `status`
- `containerRuntimeId?`
- `startedAt?`
- `lastHeartbeatAt?`
- `subscribedSymbols`
- `activeSignalIds`
- `activeOrderIntentIds`
- `positionSnapshotIds`
- `errorIds`
- `runtimeMetrics`
- `createdAt`
- `updatedAt`

### `StrategyRuntimeMetrics`

建议字段：

- `signalsGenerated`
- `ordersPlaced`
- `ordersFilled`
- `uptimeSeconds`
- `todayPnl`
- `totalPnl`
- `successRate`

---

## 5.5 Strategy Store 设计

建议将现有 strategy store 演进为分层 store：

```text
src/stores/strategy/
  strategyDefinitionStore.ts
  strategyRuntimeStore.ts
  strategyViewStore.ts
  index.ts
```

### `strategyDefinitionStore`

负责：

- 定义态 CRUD
- 选择定义对象

### `strategyRuntimeStore`

负责：

- 运行态 CRUD
- 运行状态变更
- 心跳更新
- 容器归属变更

### `strategyViewStore`

负责：

- 聚合定义态和运行态
- 输出兼容旧 UI 的 view model

---

## 5.6 与容器域的衔接原则

当 `StrategyRuntime` 建立后，容器域与策略域的关系必须变成：

- `ContainerBinding.runtimeUnitKind = 'strategy-runtime'`
- `ContainerBinding.runtimeUnitId = strategyRuntime.id`

而不是：

- `strategyId` 只是一个字符串附着在容器项上

这是一次关系语义的升级。

---

## 5.7 迁移策略

第一步：

- 保留当前 `StrategyData` 作为旧 UI view model

第二步：

- 建 `StrategyDefinition`
- 建 `StrategyRuntime`

第三步：

- 新策略创建时先生成 definition

第四步：

- “启动执行”时正式生成 runtime

第五步：

- 容器绑定从 definition id 改为 runtime id

---

## 5.8 验收标准

Strategy Runtime 阶段完成后，系统必须能回答：

- 某个策略定义是什么
- 某个策略 runtime 是否正在运行
- 某个策略 runtime 跑在哪个容器里
- 某个策略 runtime 最近一次心跳是什么时候
- 某个容器里挂的是哪个策略 runtime

如果这些问题还要靠页面临时拼接，说明这一步没有真正完成。

---

## 6. 第二阶段：Runtime Registry 建立

这是把局部 runtime 模型提升为系统级 runtime 世界的关键。

---

## 6.1 目标定义

建立一个统一的 runtime registry，用于登记和查询：

- 所有 runtime instance
- 每个 instance 的 kind
- 它对应哪个 definition
- 它挂在哪个容器上
- 它与哪些对象存在正式关系

Registry 的职责不是持有所有细节状态，而是持有：

- 关系索引
- 对象入口
- 查询轨道

---

## 6.2 为什么必须有 Registry

当前系统已经开始出现：

- `ContainerRuntime`
- 后续会有 `StrategyRuntime`
- 未来还会有 `AgentRuntime`
- 还可能有 `DataStreamRuntime`
- `PortfolioRuntime`

如果没有 registry，这些对象只会分别待在各自 store 中。

系统表面上“有很多 runtime”，实际却没有“运行时世界总表”。

这会导致：

- 难以写全局监控
- 难以写 timeline
- 难以写 AI 分析入口
- 难以做跨对象审计

---

## 6.3 Runtime Registry 的核心原理

Registry 不是把所有对象重新复制一遍。

它更像：

- 一个登记簿
- 一个关系索引层
- 一个统一查询入口

典型登记项应至少包括：

- `runtimeId`
- `runtimeKind`
- `definitionId`
- `containerRuntimeId?`
- `envelopeId?`
- `status`
- `health`
- `lastObservedAt`

必要时还可以挂：

- `relatedEntityRefs`
- `observationRef`
- `latestEventIds`

---

## 6.4 建议目录结构

```text
src/
  runtime/
    registry/
      runtimeRegistry.ts
      runtimeRegistryTypes.ts
      runtimeRegistrySelectors.ts
    graph/
      runtimeGraph.ts
      runtimeGraphSelectors.ts
```

第一批不一定要全做，但 `registry/` 至少要建立。

---

## 6.5 推荐基础类型

### `RuntimeKind`

```ts
type RuntimeKind =
  | 'container-runtime'
  | 'strategy-runtime'
  | 'agent-runtime'
  | 'data-stream-runtime'
  | 'portfolio-runtime'
  | 'execution-adapter-runtime';
```

### `RuntimeRegistryEntry`

```ts
interface RuntimeRegistryEntry {
  runtimeId: string;
  runtimeKind: RuntimeKind;
  definitionId?: string;
  containerRuntimeId?: string;
  envelopeId?: string;
  status: string;
  health?: string;
  relatedEntityRefs: EntityRef[];
  latestEventIds: string[];
  observationRef?: string;
  updatedAt: number;
}
```

### `EntityRef`

```ts
interface EntityRef {
  kind: string;
  id: string;
}
```

---

## 6.6 Registry Store 设计

建议建立：

```text
src/stores/runtime/
  runtimeRegistryStore.ts
  runtimeRegistryViewStore.ts
  index.ts
```

### `runtimeRegistryStore`

负责：

- 保存 registry entries
- 提供 upsert
- 提供 remove
- 提供按 kind 查询
- 提供按 container 查询
- 提供按 definition 查询

### `runtimeRegistryViewStore`

负责：

- 生成 runtime explorer 视图
- 为 monitor 页提供统一聚合入口

---

## 6.7 Registry 的数据来源

Registry 不是手工维护的表。

它应该从已有 store 派生或同步得到。

第一阶段可以采用同步写入策略：

- 创建 `ContainerRuntime` 时，同时 upsert registry entry
- 创建 `StrategyRuntime` 时，同时 upsert registry entry
- 绑定变化时，更新 entry 的 container / relations

后续阶段再考虑自动派生。

---

## 6.8 Registry 与 Graph 的关系

Registry 是“对象登记表”。

Graph 是“对象关系图”。

初期可以先不单独建 graph store，而是通过：

- registry entry 的 `relatedEntityRefs`
- binding store

来组合出简化图谱。

但长期看应该拆出 `runtimeGraph.ts`。

---

## 6.9 Registry 第一批查询能力

Registry 第一批必须回答：

- 当前有哪些 runtime 在运行
- 哪些 runtime 运行在某个 container 中
- 某个 strategy runtime 归属哪个 container
- 某个 container 中有哪些 runtime unit
- 哪些 runtime 处于 failed / degraded / quarantined

如果系统仍然只能靠多个 store 手工查，这一步就没有落地。

---

## 6.10 验收标准

Registry 阶段完成后，至少要能写出以下查询而不依赖页面拼接：

1. `getRuntimeById(runtimeId)`
2. `getRuntimesByKind('strategy-runtime')`
3. `getRuntimesByContainer(containerRuntimeId)`
4. `getFailedRuntimes()`
5. `getRuntimeRelations(runtimeId)`

---

## 7. 第三阶段：根组件减壳

这是结构上最容易被低估，但长期收益最大的改造。

---

## 7.1 当前问题

当前 `App.tsx` 里仍然承担很多不应属于根组件的职责：

- seed 初始化
- 创建容器边界对象
- 组装 envelope/spec/runtime/observation
- 绑定策略到容器
- 生成事件

这些逻辑在当前阶段是合理过渡，但不能成为最终形态。

---

## 7.2 根组件应该保留什么

未来 `App.tsx` 应只保留：

- 认证分流
- 顶层 shell
- view route 选择
- modal mounting
- theme / global shell wiring

也就是说，它应该是：

- 宿主壳

而不是：

- 业务编排器

---

## 7.3 根组件应该剥离什么

必须从 `App.tsx` 中剥离出去的内容包括：

1. seed 数据初始化
2. 容器创建编排
3. strategy runtime 启动编排
4. runtime binding 编排
5. runtime event 注入编排

---

## 7.4 建议目录结构

建议新增：

```text
src/
  bootstrap/
    runtimeBootstrap.ts
    seedRuntimeData.ts
  orchestrators/
    containerOrchestrator.ts
    strategyOrchestrator.ts
    runtimeOrchestrator.ts
```

### `bootstrap/`

负责：

- 初始 seed
- 首屏运行时装载

### `orchestrators/`

负责：

- 创建一个业务能力时，涉及多个 store / service 的编排逻辑

---

## 7.5 Container Orchestrator

建议先建立：

`src/orchestrators/containerOrchestrator.ts`

负责：

- 创建 envelope
- 创建 spec
- 创建 runtime
- 创建 observation
- 如果需要，创建 binding
- 如果需要，创建 event

这样 `CreateContainerModal` 提交后，`App.tsx` 只调用：

```ts
createContainerBoundary(config)
```

而不是自己组织所有对象。

---

## 7.6 Strategy Orchestrator

建议建立：

`src/orchestrators/strategyOrchestrator.ts`

负责：

- 创建 strategy definition
- 启动 strategy runtime
- 将 strategy runtime 放置到 container runtime
- 注入 event

这一步一旦建立，策略与容器的关系会更自然。

---

## 7.7 Runtime Bootstrap

建议建立：

`src/bootstrap/runtimeBootstrap.ts`

负责：

- 加载默认 envelope
- 注入 seed container runtimes
- 注入 seed strategy definitions / runtimes
- 建立初始 registry entries

这样 `App.tsx` 只需调用：

```ts
useEffect(() => {
  bootstrapRuntime();
}, []);
```

---

## 7.8 减壳后的 `App.tsx` 目标结构

理想中的 `App.tsx` 应该像这样：

1. 读取 auth 状态
2. 读取主题状态
3. 挂载 shell
4. 挂载 view router
5. 挂载 modal
6. 调用 orchestrator / bootstrap 的入口

它不应再直接 new：

- `ContainerEnvelope`
- `ContainerSpec`
- `ContainerRuntime`
- `ContainerEvent`

---

## 7.9 验收标准

根组件减壳完成后，`App.tsx` 应满足：

- 不再直接拼装 runtime domain objects
- 不再直接负责编排 binding
- 不再包含大段 seed 数据
- 主要职责回到 shell orchestration

如果 `App.tsx` 仍然在创建多个领域对象，那就只是“部分减壳”。

---

## 8. 三阶段之间的依赖关系

这三阶段不能完全并行，必须按依赖关系推进。

### 阶段顺序

1. `Strategy Runtime`
2. `Runtime Registry`
3. 根组件减壳

### 为什么不能先做减壳

因为如果还没有正式 runtime 对象，减壳只会把临时逻辑搬家，而不是升级结构。

### 为什么 Registry 在 Runtime 之后

因为 Registry 需要登记的是“正式 runtime 对象”，不是 UI 数据项。

---

## 9. 目录结构演进方案

目标结构建议如下：

```text
src/
  bootstrap/
    runtimeBootstrap.ts
    seedRuntimeData.ts
  orchestrators/
    containerOrchestrator.ts
    strategyOrchestrator.ts
    runtimeOrchestrator.ts
  runtime/
    registry/
      runtimeRegistry.ts
      runtimeRegistryTypes.ts
      runtimeRegistrySelectors.ts
  services/
    container/
    strategy/
  stores/
    container/
    strategy/
    runtime/
  types/
    container/
    strategy/
```

重点是：

- 领域类型归领域
- store 归领域
- orchestrator 归编排
- bootstrap 归初始化
- registry 归运行时中心

---

## 10. 类型系统演进方案

### 容器域

当前已初步完成，应继续稳固。

### 策略域

必须完成：

- `StrategyDefinition`
- `StrategyRuntime`
- `StrategyRuntimeMetrics`
- `StrategyRuntimeError`

### Runtime Registry 域

必须新增：

- `RuntimeKind`
- `RuntimeRegistryEntry`
- `RuntimeRelation`

---

## 11. Store 层演进方案

### 当前阶段

容器 store 已经开始分层。

### 下一阶段目标

新增：

```text
src/stores/strategy/
  strategyDefinitionStore.ts
  strategyRuntimeStore.ts
  strategyViewStore.ts

src/stores/runtime/
  runtimeRegistryStore.ts
  runtimeRegistryViewStore.ts
```

### Store 设计原则

- store 只负责状态管理
- store 不负责跨域业务编排
- store 应尽量不再自定义轻量重复类型

---

## 12. Service 层演进方案

服务层负责纯逻辑与跨对象辅助。

### 容器服务

继续保留和增强：

- `containerPlacementService`
- `containerViewAssembler`

### 策略服务

建议新增：

- `strategyViewAssembler`
- `strategyPlacementService`

### Registry 服务

建议新增：

- `runtimeRegistryService`

---

## 13. View 层演进方案

当前 UI 还大量依赖兼容 view model。

这在过渡期是必要的，但必须有演进路径。

### 第一阶段

view 继续可读兼容层

### 第二阶段

view 开始读取：

- `StrategyRuntime`
- `ContainerListItemViewModel`
- `RuntimeRegistryView`

### 第三阶段

monitor / execution / container detail 开始围绕 runtime graph 组织界面，而不是围绕孤立页面对象组织。

---

## 14. 迁移顺序

以下是推荐的实际落地顺序。

### Step 1

建立策略分层类型。

### Step 2

建立策略分层 store。

### Step 3

实现“启动策略执行 -> 生成 StrategyRuntime”。

### Step 4

容器绑定改为绑定 `StrategyRuntime`。

### Step 5

建立 runtime registry 类型和 store。

### Step 6

容器/策略创建与状态变化时同步 registry。

### Step 7

建立 `runtimeBootstrap.ts`。

### Step 8

建立 `containerOrchestrator.ts`。

### Step 9

建立 `strategyOrchestrator.ts`。

### Step 10

从 `App.tsx` 中剥离：

- seed
- create container
- bind strategy
- append runtime event

---

## 15. 验收标准

### 第一阶段验收：Strategy Runtime

```text
□ 已存在正式 StrategyDefinition 类型
□ 已存在正式 StrategyRuntime 类型
□ 启动策略时会生成 runtime 对象
□ 容器绑定的是真正的 strategy runtime
□ 执行页和监控页可以读取 strategy runtime
```

### 第二阶段验收：Runtime Registry

```text
□ 已存在 runtime registry entry 类型
□ 已存在 registry store
□ container runtime 会登记到 registry
□ strategy runtime 会登记到 registry
□ 可以按 kind/container/status 查询 runtime
```

### 第三阶段验收：根组件减壳

```text
□ App.tsx 不再直接创建 container envelope/spec/runtime
□ App.tsx 不再直接做 runtime binding
□ App.tsx 不再直接写 seed runtime 对象
□ App.tsx 主要只保留 shell/router/modal/theme/auth 职责
```

---

## 16. 风险与回滚

### 风险 1：过渡期双模型并存时间过长

风险：

- `StrategyData` 和 `StrategyRuntime` 并存过久

应对：

- 明确 view model 只是临时层

### 风险 2：Registry 变成另一个状态大杂烩

风险：

- 把所有细节状态复制进 registry

应对：

- registry 只记录索引、引用、关系，不复制全部数据

### 风险 3：App.tsx 搬家不减重

风险：

- 只是把逻辑移到另一个大文件

应对：

- 采用 orchestrator + bootstrap 分工

### 回滚策略

每一阶段都应支持独立回滚：

- 类型层独立提交
- store 层独立提交
- orchestrator 层独立提交
- UI 切换独立提交

---

## 17. 实施任务拆解

### Task Group A：Strategy Runtime

1. 新建 `src/types/strategy/`
2. 落 `definition.ts`
3. 落 `runtime.ts`
4. 落 `view.ts`
5. 新建 `src/stores/strategy/`
6. 改执行入口生成 runtime
7. 容器绑定改接 runtime id

### Task Group B：Runtime Registry

8. 新建 `src/runtime/registry/`
9. 落 `runtimeRegistryTypes.ts`
10. 落 `runtimeRegistryStore.ts`
11. ContainerRuntime 同步 registry
12. StrategyRuntime 同步 registry
13. 加查询 selector

### Task Group C：根组件减壳

14. 新建 `src/bootstrap/runtimeBootstrap.ts`
15. 新建 `src/orchestrators/containerOrchestrator.ts`
16. 新建 `src/orchestrators/strategyOrchestrator.ts`
17. 从 `App.tsx` 中移除 seed
18. 从 `App.tsx` 中移除 container create 编排
19. 从 `App.tsx` 中移除 strategy binding 编排

---

## 18. 文档与代码同步策略

这三刀不是一次性改完的，需要文档持续同步。

建议每推进一阶段，同步更新：

- `RUNTIME_ARCHITECTURE.md`
- `DOMAIN_MODEL.md`
- `CONTAINER_BOUNDARY_CODE_BLUEPRINT.md`

并新增：

- `STRATEGY_RUNTIME_PLAN.md`
- `RUNTIME_REGISTRY_PLAN.md`

如果不更新文档，后续会再次出现“文档世界比代码世界大很多”的脱节。

---

## 19. 成功后的系统能力

当这三步做完后，NEMT Runtime 应该具备以下能力。

### 19.1 运行对象真正成型

系统不再只有：

- 策略
- 容器
- 页面

而是拥有：

- 策略定义
- 策略运行时
- 容器定义
- 容器运行时
- 运行时关系

### 19.2 关系查询真正稳定

系统可以稳定回答：

- 这个策略 runtime 跑在哪
- 这个容器里有什么
- 哪些 runtime 失败了
- 某个 runtime 最近发生了什么

### 19.3 UI 真正变成投影层

页面不再自己维持业务真相，而是读取 runtime 世界的投影。

### 19.4 AI 能真正利用上下文

当 runtime 对象、registry、event、observation 成型后，AI 才能进行高质量分析：

- 为何失败
- 失败之前发生了什么
- 某容器承载了哪些对象
- 某策略 runtime 是否处于危险状态

这会显著提升“值得消耗大规模 token”的价值。

---

## 20. 最终总结

这三刀不是“重构建议”，而是 NEMT Runtime 从原型走向运行时系统的主干工程。

### 第一刀：`Strategy Runtime`

把策略做活。

### 第二刀：`Runtime Registry`

把活的对象连起来。

### 第三刀：根组件减壳

把 UI 从伪内核降回宿主壳。

执行完这三步之后，系统会完成一次重要跃迁：

从：

- 页面堆功能
- 组件拼状态
- UI 层串业务

变成：

- runtime 对象驱动
- registry 组织关系
- orchestrator 负责编排
- app shell 只负责承载

这就是 NEMT Runtime 真正开始“大起来”的时刻。

