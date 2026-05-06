# 扩张计划四：Risk Policy → Risk Trigger

## 阶段定位

**风险从配置项升级为治理系统。** 这一步让风险不再是策略上的一个参数，而是独立的 Policy/Runtime/Trigger/Alert 治理闭环。风险引擎可以跨域约束多个运行时对象。

## 前置依赖

- [ ] 策略域 Runtime 已正式化（计划一）
- [ ] Runtime Registry 已建立（计划二）
- [ ] 组合域 Runtime 已正式化（计划三）

## 当前问题

1. 风险概念散落在策略的 `riskDefaults`、组合的 `stopLossThreshold`、容器的 `ContainerRiskConstraint` 中
2. 没有独立的风险运行时对象来判断、触发、响应
3. 无法回答"谁在什么时候违反了哪条规则 / 系统做了什么响应"
4. 容器 Envelope 里已经定义了 `ContainerRiskConstraint`，但没有引擎来执行它

## 目标

```
RiskPolicy（定义：规则名称、类型、参数、动作）
    │
    ├──→ RiskBinding（绑定：策略或组合受此规则约束）
    │
    ├──→ RiskTrigger（触发：阈值被跨越、谁、什么程度、何时）
    │        │
    │        └──→ Alert（告警通知）
    │        └──→ Action（pause / quarantine / reduce / deny）
    │
    └──→ RiskObservation（观测：触达率、误报率、响应延迟）
```

## 新建文件清单

```
src/
  types/
    risk/
      policy.ts      # RiskPolicy + RiskRule + RiskBinding
      trigger.ts     # RiskTrigger + RiskTriggerState
      alert.ts       # RiskAlert（或扩展已有 Alert 类型）
      observation.ts # RiskObservation + RiskStats
      view.ts        # RiskViewModel
      index.ts

  stores/
    risk/
      riskPolicyStore.ts
      riskTriggerStore.ts
      riskBindingStore.ts
      riskObservationStore.ts
      riskViewStore.ts
      index.ts

  services/
    risk/
      riskEngine.ts            # 规则评估 + 触发判断
      riskResponseService.ts   # 触发后动作调度
      riskViewAssembler.ts
```

## 关键类型定义

### RiskPolicy

```ts
type RiskRuleType =
  | 'max_exposure'
  | 'max_daily_loss'
  | 'max_drawdown'
  | 'max_order_rate'
  | 'max_position_size'
  | 'max_leverage'
  | 'correlation_limit'
  | 'concentration_limit'
  | 'custom';

type RiskAction = 'warn' | 'pause' | 'reduce' | 'quarantine' | 'deny' | 'notify';

interface RiskRule {
  id: string;
  name: string;
  type: RiskRuleType;
  enabled: boolean;
  params: Record<string, unknown>;
  thresholdValue: number;
  action: RiskAction;
  cooldownMs?: number;
  escalationPath?: RiskAction[];  // 升级链：warn → pause → quarantine
}

interface RiskPolicy extends BaseEntity {
  name: string;
  description?: string;
  rules: RiskRule[];
  scope: 'global' | 'per-container' | 'per-strategy' | 'per-portfolio';
  mutableBy: ActorScope[];
}
```

### RiskBinding

```ts
interface RiskBinding extends BaseEntity {
  riskPolicyId: string;
  targetRuntimeKind: RuntimeKind;
  targetRuntimeId: string;
  activeRules: string[];          // 启用的规则 id
  overrideParams?: Record<string, Record<string, unknown>>;  // ruleId → 参数覆盖
  enabled: boolean;
  createdAt: number;
}
```

### RiskTrigger

```ts
type RiskTriggerSeverity = 'info' | 'warning' | 'critical' | 'emergency';

interface RiskTrigger {
  id: string;
  riskPolicyId: string;
  riskRuleId: string;
  bindingId: string;
  targetRuntimeKind: RuntimeKind;
  targetRuntimeId: string;
  threshold: number;
  actualValue: number;
  severity: RiskTriggerSeverity;
  action: RiskAction;
  status: 'fired' | 'acknowledged' | 'resolved' | 'escalated';
  message: string;
  payload: Record<string, unknown>;
  firedAt: number;
  resolvedAt?: number;
  acknowledgedBy?: ActorRef;
}
```

### RiskEngine

```ts
interface RiskEngine {
  evaluateTarget(runtimeId: string): RiskTrigger[];
  evaluateAll(): RiskTrigger[];
  evaluateByPolicy(policyId: string): RiskTrigger[];
  acknowledgeTrigger(triggerId: string, actor: ActorRef): void;
  resolveTrigger(triggerId: string): void;
}
```

## Registry 同步

```
RiskBinding 创建 → upsert registry（kind: 'risk-binding'）
RiskTrigger 触发 → appendEvent 到关联 runtime entry
```

## 与容器 Envelope 的关系

容器已有的 `ContainerRiskConstraint` 应被 Risk 域正式化：

```
ContainerEnvelope.riskConstraints              ← 旧路径（容器域内嵌）
         ↓
RiskPolicy.rules                              ← 新路径（独立 Risk 域）
         ↓
RiskBinding(targetRuntimeKind='container-runtime', targetRuntimeId=containerRuntime.id)
```

## 迁移步骤

| Step | 操作 |
|---|---|
| 1 | 新建 `src/types/risk/` 全部类型文件 |
| 2 | 新建 `src/stores/risk/` 全部 Store |
| 3 | 实现 `riskEngine.ts` 规则评估核心 |
| 4 | 实现 `riskResponseService.ts` 触发后动作 |
| 5 | 容器创建时自动绑定默认 RiskPolicy |
| 6 | 策略/组合启动时自动绑定相关 RiskPolicy |
| 7 | 监控页新增 Risk 面板 |
| 8 | ContainerEnvelope.riskConstraints 迁移为独立 RiskBinding |

## 验收标准

```
□ src/types/risk/ 目录存在且类型编译通过
□ RiskPolicy / RiskBinding / RiskTrigger 三对象独立可操作
□ 风险引擎可对任意 runtime 执行规则评估
□ 触发事件写入 Event 体系
□ 告警可通过 Notification / Alert 通道送达
□ Registry 中可查到 risk binding 与 runtime 的关系
□ 旧 ContainerEnvelope.riskConstraints 保留兼容但不再作为主路径
```
