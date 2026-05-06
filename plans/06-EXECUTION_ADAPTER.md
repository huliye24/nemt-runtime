# 扩张计划六：Execution Adapter Contract

## 阶段定位

**运行时意图到外部执行的标准化接口。** 这是 NEMT Runtime 从"内部模拟系统"走向"可对接真实交易基础设施"的关键一步。这一步不实现具体交易所对接，而是定义标准合同，让任何适配器可以按合同接入。

## 前置依赖

- [ ] 策略域 Runtime 已正式化（计划一）
- [ ] 风险治理已建立（计划四）—— 订单执行受风险规则约束
- [ ] Registry 已建立（计划二）

## 当前问题

1. 订单/信号流在当前代码中主要靠 mock 数据
2. 没有正式的 execution adapter 类型定义
3. 信号 → 订单意图 → 执行记录 的链路不完整
4. 无法对接真实 broker / exchange / simulator

## 目标

定义标准执行合同，让：

```
Signal（内部意图）
  → OrderIntent（执行请求）
    → ExecutionAdapter（合同层）
      → ExecutionRecord（执行结果）
        → PositionSnapshot（持仓变更）
```

任何执行后端（模拟器、Paper Trading、真实券商 API）只需实现 `ExecutionAdapter` 接口即可接入。

## 核心设计：Execution Adapter Contract

### ExecutionAdapter（合同接口）

```ts
interface ExecutionAdapter {
  // 标识
  readonly id: string;
  readonly name: string;
  readonly kind: ExecutionAdapterKind;
  readonly version: string;

  // 生命周期
  connect(config: ExecutionConfig): Promise<ConnectionResult>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<HealthStatus>;

  // 核心能力
  submitOrder(intent: OrderIntent): Promise<OrderAck>;
  cancelOrder(orderId: string): Promise<CancelResult>;
  queryOrder(orderId: string): Promise<ExecutionRecord>;

  // 查询能力
  getPositions(): Promise<PositionSnapshot[]>;
  getBalances(): Promise<BalanceSnapshot[]>;
  getOrderHistory(params: OrderHistoryQuery): Promise<ExecutionRecord[]>;

  // 事件流
  onOrderUpdate(callback: (update: OrderUpdate) => void): void;
  onPositionChange(callback: (snapshot: PositionSnapshot) => void): void;
  onConnectionChange(callback: (status: ConnectionStatus) => void): void;
}
```

### 合同定义：标准对象

```ts
type ExecutionAdapterKind = 'paper-simulator' | 'mock-exchange' | 'broker-api' | 'custom';

type OrderIntentType = 'market' | 'limit' | 'stop' | 'stop-limit' | 'trailing-stop';

type OrderIntentSide = 'buy' | 'sell' | 'short' | 'cover';

type OrderIntentTimeInForce = 'day' | 'gtc' | 'ioc' | 'fok' | 'gtd';

interface OrderIntent extends BaseEntity {
  sourceSignalId?: string;
  strategyRuntimeId: string;
  containerRuntimeId?: string;
  symbol: string;
  type: OrderIntentType;
  side: OrderIntentSide;
  quantity: number;
  price?: number;             // limit / stop-limit 价格
  stopPrice?: number;         // stop / stop-loss 触发价
  timeInForce: OrderIntentTimeInForce;
  expireAt?: number;          // gtd 过期时间
  riskApprovalState: 'pending' | 'approved' | 'rejected' | 'bypassed';
  riskApprovalBy?: string;    // 审批的 risk engine / operator id
  metadata?: Record<string, unknown>;
}

interface OrderAck {
  orderId: string;
  adapterId: string;
  status: 'accepted' | 'rejected' | 'queued';
  rejectReason?: string;
  estimatedFee?: number;
  ackAt: number;
}

type ExecutionStatus =
  | 'pending'
  | 'accepted'
  | 'partial-filled'
  | 'filled'
  | 'rejected'
  | 'cancelled'
  | 'expired'
  | 'failed';

interface ExecutionRecord extends BaseEntity {
  orderIntentId: string;
  strategyRuntimeId: string;
  adapterId: string;
  exchangeOrderId?: string;
  symbol: string;
  type: OrderIntentType;
  side: OrderIntentSide;
  requestedQuantity: number;
  filledQuantity: number;
  averageFillPrice?: number;
  slippageBps?: number;
  fee?: number;
  feeCurrency?: string;
  status: ExecutionStatus;
  fillDetails: FillDetail[];
  rejectReason?: string;
  submittedAt: number;
  filledAt?: number;
  cancelledAt?: number;
  metadata?: Record<string, unknown>;
}

interface FillDetail {
  id: string;
  price: number;
  quantity: number;
  timestamp: number;
  venueOrderId?: string;
  isTaker: boolean;
}
```

## 执行链路：Signal → OrderIntent → ExecutionRecord

```
1. StrategyRuntime 发出 Signal
2. Signal 被评估（可经 Agent / Operator 确认）
3. Signal → OrderIntent（创建时 riskApprovalState = 'pending'）
4. RiskEngine.evaluate(OrderIntent) → approved / rejected
5. approved → ExecutionAdapter.submitOrder(OrderIntent)
6. adapter.submitOrder → OrderAck
7. adapter.onOrderUpdate → ExecutionRecord（fill 更新）
8. adapter.onPositionChange → PositionSnapshot（持仓更新）
9. ExecutionRecord + PositionSnapshot 写入 Event System
```

## 新建文件清单

```
src/
  types/
    execution/
      order.ts          # OrderIntent / OrderAck / OrderUpdate
      record.ts         # ExecutionRecord / FillDetail
      position.ts       # PositionSnapshot / BalanceSnapshot
      adapter.ts        # ExecutionAdapter 合同接口
      index.ts

  adapters/
    paper/
      paperSimulator.ts # Paper Trading 模拟器（第一个参考实现）
    mock/
      mockExchange.ts   # Mock 交易所（用于回测和测试）
    index.ts

  stores/
    execution/
      orderStore.ts     # OrderIntent + ExecutionRecord 管理
      positionStore.ts  # PositionSnapshot 管理
      index.ts

  services/
    execution/
      orderRouter.ts        # 订单路由（含风控检查）
      positionTracking.ts   # 持仓跟踪与对账
      executionEventBus.ts  # 执行事件流
```

## 多 Adapter 共存

```
runtime/
  container-A/
    strategy-runtime-1  → adapter: 'paper-simulator'
    strategy-runtime-2  → adapter: 'paper-simulator'
  container-B/
    strategy-runtime-3  → adapter: 'mock-exchange'
```

通过 ContainerBinding 指定 execution adapter 归属，而非全局单例。

## 迁移步骤

| Step | 操作 |
|---|---|
| 1 | 新建 `src/types/execution/` 全部类型文件 |
| 2 | 定义 `ExecutionAdapter` 合同接口 |
| 3 | 实现 `PaperSimulator`（第一个参考适配器） |
| 4 | 新建 `src/stores/execution/` Store |
| 5 | 实现 `orderRouter.ts`（含风控检查链） |
| 6 | Signal → OrderIntent 链路贯通 |
| 7 | OrderIntent → ExecutionRecord 链路贯通 |
| 8 | 回测引擎接入 Execution Adapter |

## 验收标准

```
□ src/types/execution/ 目录存在且 ExecutionAdapter 合同定义完整
□ PaperSimulator 实现 ExecutionAdapter 全部方法
□ Signal → OrderIntent → ExecutionRecord 端到端可走通
□ 订单提交前经过 RiskEngine 审批
□ 执行结果写入事件系统
□ 持仓快照可追踪和审计
□ 回测引擎可通过 Adapter 合同注入不同模拟器
□ 多策略可分别使用不同的 execution adapter
```

## 后续扩展

当合同稳定后，可逐步实现：

- `BrokerAdapter`（对接 Interactive Brokers / Alpaca 等）
- `ExchangeAdapter`（对接 Binance / OKX 等）
- `MultiVenueRouter`（跨交易所订单路由）
- `SettlementAdapter`（结算和清算合同）
