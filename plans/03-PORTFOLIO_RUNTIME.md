# 扩张计划三：Portfolio Definition → Portfolio Runtime

## 阶段定位

**资金管理能力的正式运行时化。** 投资组合不再是"策略的资金配置项"，而是拥有独立运行态、分配规则、再平衡逻辑的运行时对象。

## 前置依赖

- [ ] 策略域 Runtime 已正式化（计划一）
- [ ] Runtime Registry 已建立（计划二）

## 当前问题

1. `PortfolioData` 主要是 UI 中的数据结构，不表达真实的资金流
2. 策略与组合的关系靠页面逻辑维系，没有正式的 `PortfolioRuntime → StrategyRuntime` 分配关系
3. 没有 CapitalAccountRuntime，资金概念是散落在页面中的数字
4. 无法回答"某策略当前被哪些组合持有 / 分配了多少资金 / 是否超出预算"

## 目标

```
PortfolioDefinition（定义：评分规则、分配规则、再平衡频率、风控线）
        │
        ▼
PortfolioRuntime（运行态：当前分配、再平衡状态、资金效率、回撤状态）
        │
        ├── CapitalAccountRuntime（资金来源：可用/预留/已实现盈亏）
        │
        └── AllocationChange（资金流：分配变更事件）
```

## 新建文件清单

```
src/
  types/
    portfolio/
      definition.ts       # PortfolioDefinition
      runtime.ts          # PortfolioRuntime + CapitalAccountRuntime
      allocation.ts       # AllocationChange（Flow 对象）
      view.ts             # PortfolioViewModel
      index.ts

  stores/
    portfolio/
      portfolioDefinitionStore.ts
      portfolioRuntimeStore.ts
      capitalAccountStore.ts
      portfolioViewStore.ts
      index.ts

  services/
    portfolio/
      portfolioViewAssembler.ts
      allocationService.ts        # 分配计算 + 再平衡触发
```

## 关键类型定义

### PortfolioDefinition

```ts
interface PortfolioDefinition extends BaseEntity {
  name: string;
  description?: string;
  scoringRules: ScoringRule[];         // 如何给策略打分
  allocationRules: AllocationRule[];   // 如何按分数分配资金
  rebalanceFrequency: 'manual' | 'daily' | 'weekly' | 'monthly' | 'continuous';
  maxStrategies?: number;
  stopLossThreshold?: number;          // 组合级止损线
  capitalSourceIds: string[];          // 关联资金账户
  tags: string[];
}
```

### PortfolioRuntime

```ts
type PortfolioRuntimeStatus = 'active' | 'rebalancing' | 'paused' | 'frozen' | 'closed';

interface PortfolioRuntime extends BaseEntity {
  portfolioDefinitionId: string;
  status: PortfolioRuntimeStatus;
  assignedStrategyRuntimeIds: string[];
  currentAllocations: Record<string, number>;  // strategyId → allocated amount
  pendingAllocationChanges: AllocationChange[];
  totalCapitalDeployed: number;
  totalCapitalReserved: number;
  capitalEfficiency: number;
  drawdownPercent: number;
  lastRebalanceAt?: number;
  nextRebalanceScheduledAt?: number;
}
```

### CapitalAccountRuntime

```ts
type AccountType = 'simulated' | 'paper' | 'live-exchange' | 'internal-reserve';

interface CapitalAccountRuntime extends BaseEntity {
  name: string;
  accountType: AccountType;
  balance: number;
  reservedBalance: number;
  availableBalance: number;
  realizedPnl: number;
  unrealizedPnl: number;
  status: 'active' | 'locked' | 'depleted' | 'error';
  linkedPortfolioRuntimeIds: string[];
}
```

### AllocationChange

```ts
type AllocationChangeType = 'initial-allocate' | 'rebalance' | 'increase' | 'reduce' | 'liquidate';

interface AllocationChange {
  id: string;
  type: AllocationChangeType;
  portfolioRuntimeId: string;
  strategyRuntimeId: string;
  previousAmount: number;
  newAmount: number;
  reason: string;
  requestedBy: ActorScope;
  approvedBy?: ActorScope;
  status: 'pending' | 'approved' | 'executed' | 'rejected';
  occurredAt: number;
}
```

## Registry 同步

创建 PortfolioRuntime 时同步登记到 Runtime Registry：

```ts
upsertRuntimeRegistryEntry({
  runtimeId: portfolioRuntime.id,
  runtimeKind: 'portfolio-runtime',
  definitionId: portfolioDefinitionId,
  status: portfolioRuntime.status,
  relatedEntityRefs: [
    ...assignedStrategyRuntimeIds.map(id => ({ kind: 'strategy-runtime', id })),
    ...capitalSourceIds.map(id => ({ kind: 'capital-account-runtime', id })),
  ],
});
```

## 迁移步骤

| Step | 操作 |
|---|---|
| 1 | 新建 `src/types/portfolio/` 全部类型文件 |
| 2 | 更新 `src/types/index.ts` 导出 |
| 3 | 新建 `src/stores/portfolio/` 全部 Store |
| 4 | 实现 allocation 计算服务 |
| 5 | "创建组合"入口改为生成 PortfolioDefinition + PortfolioRuntime |
| 6 | 资金分配改为通过 AllocationChange 流程 |
| 7 | 组合页改为读取 PortfolioRuntime |
| 8 | PortfolioRuntime 同步登记到 Registry |

## 验收标准

```
□ src/types/portfolio/ 目录存在且类型编译通过
□ PortfolioDefinition / PortfolioRuntime / CapitalAccountRuntime 三对象独立存在
□ 创建组合时生成正式 runtime 对象
□ 策略分配通过 AllocationChange 事件完成
□ PortfolioRuntime 在 Registry 中可查
□ 组合页可通过 PortfolioRuntime 读取当前分配状态
```
