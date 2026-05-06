# 扩张计划五：Agent Definition → Agent Runtime

## 阶段定位

**AI Agent 作为一等公民进入运行时世界。** Agent 不再是"某个页面上的一个聊天框"，而是拥有定义态、运行态、权限边界、上下文窗口、输出合同的正式运行时对象。

## 前置依赖

- [ ] 所有核心域 Runtime 已入 Registry（计划二）
- [ ] 风险域已建立（计划四）—— Agent 的 action 受风险治理约束

## 当前问题

1. 项目中没有正式的 Agent 概念——AI 在当前只是文档中的设想
2. 没有 Agent 可以观察 Runtime、产出 Signal / Trigger / 分析报告
3. 没有 Agent 的权限边界——如果 AI 可以下单，谁能约束它？

## 目标

```
AgentDefinition（定义：模型、prompt、权限、输出合同）
        │
        ▼
AgentRuntime（运行态：上线状态、上下文窗口、观察对象、输出记录）
        │
        ├── 可观察：StrategyRuntime  / PortfolioRuntime / DataStreamRuntime
        │
        └── 可产出：Signal / RiskTrigger / RuntimeEvent / 分析摘要
```

Agent 的几个典型角色：

| Agent 角色 | 输入 | 输出 |
|---|---|---|
| Signal Assistant | 行情 + 策略 runtime | Signal（辅助信号） |
| Risk Reviewer | 持仓 + 风控数据 | RiskTrigger（风控审查） |
| Execution Optimizer | 订单簿 + 信号队列 | OrderIntent 修改建议 |
| Research Summarizer | 历史回测 + 新闻源 | 摘要报告 |

## 新建文件清单

```
src/
  types/
    agent/
      definition.ts    # AgentDefinition
      runtime.ts       # AgentRuntime + AgentContextWindow
      permission.ts    # AgentPermission（Agent 能做什么）
      output.ts        # AgentOutput 合同（Signal / Trigger / Summary）
      session.ts       # AgentSession（单次运行窗口）
      view.ts          # AgentViewModel
      index.ts

  stores/
    agent/
      agentDefinitionStore.ts
      agentRuntimeStore.ts
      agentSessionStore.ts
      agentViewStore.ts
      index.ts

  services/
    agent/
      agentOrchestrator.ts        # Agent 启动/停止/上下文管理
      agentOutputRouter.ts        # Agent 产出的路由分发
```

## 关键类型定义

### AgentDefinition

```ts
type AgentRole =
  | 'signal-assistant'
  | 'risk-reviewer'
  | 'execution-optimizer'
  | 'research-summarizer'
  | 'general-observer'
  | 'custom';

interface AgentDefinition extends BaseEntity {
  name: string;
  role: AgentRole;
  provider: 'anthropic' | 'openai' | 'local' | 'custom';
  model: string;
  systemPrompt: string;
  allowedContextKinds: RuntimeKind[];     // 可观察哪些 runtime 类型
  outputContract: AgentOutputContract;   // 输出的正式合同
  permission: AgentPermission;           // 权限边界
  maxTokensPerSession?: number;
  cooldownMs?: number;
}
```

### AgentPermission

```ts
interface AgentPermission {
  canEmitSignal: boolean;
  canEmitRiskTrigger: boolean;
  canSuggestOrderIntent: boolean;
  canRequestRebalance: boolean;
  canAccessMarketData: boolean;
  canAccessPortfolioState: boolean;
  canAccessRiskState: boolean;
  canInterveneAutomatically: boolean;
  requiresHumanApproval: boolean;
  maxDailySignals?: number;
  maxDailyInterventions?: number;
}
```

### AgentRuntime

```ts
type AgentRuntimeStatus = 'idle' | 'observing' | 'thinking' | 'outputting' | 'cooldown' | 'paused' | 'error';

interface AgentRuntime extends BaseEntity {
  agentDefinitionId: string;
  status: AgentRuntimeStatus;
  containerRuntimeId?: string;
  observedRuntimeIds: string[];          // 正观察的 runtime id
  currentSession?: AgentSession;
  sessionCount: number;
  lastSessionAt?: number;
  errorCount: number;
  lastError?: string;
  metadata?: Record<string, unknown>;
}

interface AgentSession {
  id: string;
  agentRuntimeId: string;
  context: AgentContextWindow;
  output?: AgentOutput;
  tokensUsed: number;
  startedAt: number;
  completedAt?: number;
}

interface AgentContextWindow {
  observedRuntimes: RuntimeRegistryEntry[];
  latestEvents: ContainerEvent[];
  marketData?: Record<string, unknown>;
}
```

### AgentOutput

```ts
type AgentOutputKind = 'signal' | 'risk-trigger' | 'order-suggestion' | 'summary' | 'alert';

interface AgentOutput {
  kind: AgentOutputKind;
  targetRuntimeId?: string;
  payload: Record<string, unknown>;
  confidence?: number;
  reasoning?: string;
  requiresApproval: boolean;
  createdAt: number;
}
```

## 权限模型

Agent 的权限不能是空壳。必须和 Envelope 治理联动：

```
AgentPermission.requiresHumanApproval == true
    → Agent 产出标记为 pending_approval
    → 进入 Operator 审批队列
    → 审批通过后由 outputRouter 分发

AgentPermission.canAccessMarketData == false
    → context window 不注入 market data
    → 违规时触发 AgentPermissionViolation 事件
```

## Registry 同步

```ts
{
  runtimeId: agentRuntime.id,
  runtimeKind: 'agent-runtime',
  definitionId: agentDefinitionId,
  containerRuntimeId: agentRuntime.containerRuntimeId,
  status: agentRuntime.status,
  relatedEntityRefs: observedRuntimeIds.map(id => ({ kind: 'strategy-runtime', id })),
}
```

## 迁移步骤

| Step | 操作 |
|---|---|
| 1 | 新建 `src/types/agent/` 全部类型文件 |
| 2 | 新建 `src/stores/agent/` Store |
| 3 | 实现 `agentOrchestrator.ts`（启动/停止/上下文装配） |
| 4 | 实现 `agentOutputRouter.ts`（输出按合同分发） |
| 5 | 实现第一个 Agent：Risk Reviewer（只读，不自动干预） |
| 6 | 放到 Container 中运行 |
| 7 | 在监控页新增 Agent 状态面板 |

## 验收标准

```
□ src/types/agent/ 目录存在且类型编译通过
□ Agent 可作为 runtime object 被创建、启动、停止
□ Agent context window 能装载观察对象的运行时状态
□ Agent output 按合同类型路由到对应 Store
□ Agent 权限边界在运行时被强制执行
□ Agent 运行态同步入 Registry
□ 至少一个 Agent 角色可端到端运行
```
