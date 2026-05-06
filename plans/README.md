# NEMT Runtime 扩张计划索引

## 总体路线

```
  现已完成                          第 1 步                 第 2 步
  ┌──────────┐                  ┌──────────┐           ┌──────────┐
  │ Container │                  │ Strategy │           │ Runtime  │
  │ Spec      │                  │ Def →    │           │ Registry │
  │ Runtime   │                  │ Runtime  │           │          │
  │ Envelope  │                  │          │           │          │
  │ Binding   │                  │          │           │          │
  │ Observat. │                  │          │           │          │
  └──────────┘                  └──────────┘           └──────────┘
       ✓                           部分完成               部分完成

  第 3 步              第 4 步               第 5 步              第 6 步              第 7 步
  ┌──────────┐       ┌──────────┐         ┌──────────┐       ┌──────────┐       ┌──────────┐
  │ Electron │       │Exec Adap.│         │Portfolio │       │ Risk     │       │ Agent    │
  │ Runtime  │       │Contract  │         │ Def →    │       │ Policy → │       │ Def →    │
  │ Bridge   │       │+Paper    │         │ Runtime  │       │ Trigger  │       │ Runtime  │
  │          │       │Simulator │         │          │       │          │       │          │
  └──────────┘       └──────────┘         └──────────┘       └──────────┘       └──────────┘
      3                   4                     5                   6                   7
```

## 七步计划总览

| 序号 | 计划 | 核心产出 | 前置依赖 | 文件 |
|---|---|---|---|---|
| 1 | Strategy Runtime | 策略从 UI 数据项升级为运行时对象 | 容器分层已完成 | [01-STRATEGY_RUNTIME.md](./01-STRATEGY_RUNTIME.md) |
| 2 | Runtime Registry | 统一运行时登记、查询、关系索引 | 计划一 | [02-RUNTIME_REGISTRY.md](./02-RUNTIME_REGISTRY.md) |
| 3 | Electron Runtime Bridge | 让 Electron main / preload / IPC / runtime bridge 成为正式软件边界 | 计划一、二 | [../ELECTRON_RUNTIME_EXPANSION_PLAN.md](../ELECTRON_RUNTIME_EXPANSION_PLAN.md) |
| 4 | Execution Adapter | 标准化执行接口，对接任意执行后端 | 计划一至三 | [06-EXECUTION_ADAPTER.md](./06-EXECUTION_ADAPTER.md) |
| 5 | Portfolio Runtime | 资金管理正式化为可运行的运行时对象 | 计划一至四 | [03-PORTFOLIO_RUNTIME.md](./03-PORTFOLIO_RUNTIME.md) |
| 6 | Risk Governance | 风险从参数升级为独立的治理闭环 | 计划一至五 | [04-RISK_GOVERNANCE.md](./04-RISK_GOVERNANCE.md) |
| 7 | Agent Runtime | AI Agent 作为一等公民进入运行时世界 | 计划一至六 | [05-AGENT_RUNTIME.md](./05-AGENT_RUNTIME.md) |

## 每一步对系统能力的提升

| 步骤 | 完成后系统能回答 |
|---|---|
| 1 | 策略在运行还是停止？它跑在哪个容器里？最近一次心跳是什么时候？ |
| 2 | 系统当前有多少 runtime 在运行？哪些失败了？某个容器里有什么？ |
| 3 | 当前桌面进程是否健康？Renderer、preload、main process 和 runtime-core 之间走的是哪条链？ |
| 4 | 订单从信号到成交走了哪条链？用什么交易后端？持仓是否可对账？ |
| 5 | 策略被分配了多少资金？组合的资本效率如何？是否需要再平衡？ |
| 6 | 谁违反了哪条风险规则？系统做了什么响应？触发是否可以审计？ |
| 7 | AI 能看什么、不能做什么？Agent 的产出是否经过审批？上下文是什么？ |

## 不变的原则

每一步扩张都必须遵守：

1. **Definition / Runtime 强分离** — 能写配置的是一层，能描述运行的是一层
2. **类型先于实现** — 合同定义完整再写逻辑
3. **Registry 不入 UI** — 运行时不依赖页面存在
4. **兼容过渡，核心无妥协** — ViewModel 是临时层，DataSource 是唯一真相
5. **桌面边界先落地** — Electron main / preload / IPC / runtime bridge 先于更高层 runtime 扩张

## 进度追踪

| 步骤 | 状态 | 开始日期 | 完成日期 |
|---|---|---|---|
| 1 — Strategy Runtime | 🟡 已部分落地 | 2026-05-05 | — |
| 2 — Runtime Registry | 🟡 已部分落地 | 2026-05-05 | — |
| 3 — Electron Runtime Bridge | 🟡 已开始落地 | 2026-05-05 | — |
| 4 — Execution Adapter | ⬜ 待开始 | — | — |
| 5 — Portfolio Runtime | ⬜ 待开始 | — | — |
| 6 — Risk Governance | ⬜ 待开始 | — | — |
| 7 — Agent Runtime | ⬜ 待开始 | — | — |
