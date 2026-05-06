# NEMT API 中台建设计划

## Electron ↔ FastAPI ↔ Python 量化引擎 全栈架构落地

---

> **文档编号**: PLAN-007
> **优先级**: P0 — 最高优先级
> **预计工期**: 阶段一 1 周 / 阶段二 2 周 / 阶段三 3 周
> **责任人**: NEMT Lab
> **创建日期**: 2026-05-06
> **状态**: Draft

---

## 目录

1. [概述与目标](#1-概述与目标)
2. [现状分析](#2-现状分析)
3. [总体架构](#3-总体架构)
4. [后端模块评估](#4-后端模块评估)
5. [API 接口设计](#5-api-接口设计)
6. [通信层设计](#6-通信层设计)
7. [数据管线设计](#7-数据管线设计)
8. [阶段一：最小可用 API](#8-阶段一最小可用-api)
9. [阶段二：完整交易中台](#9-阶段二完整交易中台)
10. [阶段三：实时交易系统](#10-阶段三实时交易系统)
11. [TypeScript 端改造](#11-typescript-端改造)
12. [测试策略](#12-测试策略)
13. [部署与运维](#13-部署与运维)
14. [风险与缓解](#14-风险与缓解)
15. [附录](#15-附录)

---

## 1. 概述与目标

### 1.1 项目定位

NEMT Platform 当前是一个以 TypeScript/React/Electron 构建的量化交易前端桌面应用。本计划的目标是将其升级为 **前端 + 中台 + 引擎** 三层架构的完整量化交易系统。

### 1.2 核心目标

| 目标 | 描述 | 衡量标准 |
|------|------|----------|
| **后端服务化** | 将 30,000 行 Python 量化引擎代码包装为可调用的 API 服务 | 11 个核心模块全部暴露 REST/WebSocket 端点 |
| **前端后端打通** | Electron 端通过 IPC/WebSocket 调用 Python 中台 | 回测、信号、风控在 UI 可完整走通 |
| **实时能力** | 行情推送、信号更新、风控预警实时到达前端 | WebSocket 延迟 < 100ms |
| **可部署** | 中台可独立部署在 Linux 服务器，Electron 端通过网络连接 | systemd 服务化管理 |

### 1.3 设计原则

1. **薄包装原则** — Python 模块的 API 包装只做序列化和路由，不修改业务逻辑
2. **单向依赖** — TypeScript 依赖 Python API，Python 不依赖 TypeScript
3. **进程隔离** — Python 中台独立进程，Electron 崩溃不影响交易状态
4. **合约先行** — 所有 API 先定义 TypeScript 类型和 JSON Schema，再写实现
5. **渐进上线** — 每个阶段独立可用，不依赖后续阶段

---

## 2. 现状分析

### 2.1 TypeScript 前端现状

| 项目 | 状态 |
|------|------|
| **路径** | `/root/nemt-runtime/` |
| **技术栈** | React 18 + TypeScript 5 + Vite 5 + Electron 28 |
| **组件数量** | 80+ 个 TSX 组件 |
| **状态管理** | 40+ 个 Zustand Store |
| **UI 完成度** | 高 — 策略市场、回测面板、执行面板、投资组合、容器管理均已就绪 |
| **缺失** | 所有数据均为 Mock/预设，无真实计算能力 |

### 2.2 Python 后端现状

| 项目 | 状态 |
|------|------|
| **路径** | `/root/NEMT-Simulator2/` |
| **总代码量** | 30,755 行 Python，146 个文件 |
| **核心模块** | 16 个量化模块（信号、风控、执行、状态机等） |
| **API 层** | 无 — 无 FastAPI/Flask，无 HTTP 端点 |
| **现有接口** | `nemt-os-ipc-adapter.py` — JSON-over-stdin/stdout（非 HTTP） |
| **模块质量** | 高 — dataclass I/O、清晰依赖、可独立实例化 |

### 2.3 关键差距

```
当前状态:
  TypeScript UI ──(Mock Data)──▶ 页面渲染

目标状态:
  TypeScript UI ──(IPC/WebSocket)──▶ FastAPI ──▶ NEMT 量化引擎 ──▶ 计算结果返回
                                                ──▶ Binance API ──▶ 真实行情
```

---

## 3. 总体架构

### 3.1 三层架构全景

```
┌──────────────────────────────────────────────────────────────────┐
│                    表示层 (Presentation Layer)                     │
│                   Electron + React + TypeScript                    │
│                                                                    │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐  │
│  │ 回测    │ │ 策略    │ │ 执行     │ │ 组合   │ │ 风控      │  │
│  │ 工作台  │ │ 实验室  │ │ 面板     │ │ 管理   │ │ 监控      │  │
│  └────┬────┘ └────┬────┘ └────┬─────┘ └───┬────┘ └─────┬─────┘  │
│       └───────────┴───────────┴───────────┴─────────────┘        │
│                              │                                     │
│                    ┌─────────┴─────────┐                          │
│                    │  Bridge Layer (IPC)│  preload / main process  │
│                    └─────────┬─────────┘                          │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                    WebSocket (ws://) + REST (http://)
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                    中台层 (Middle Platform)                        │
│                   Python FastAPI + WebSocket                       │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                      API Gateway                              ││
│  │  /api/analyze  /api/signals  /api/risk  /api/execution       ││
│  │  /api/phase    /api/backtest /api/brain  /api/data           ││
│  └──────────────────────────┬───────────────────────────────────┘│
│                              │                                     │
│  ┌───────────────────────────┴──────────────────────────────┐    │
│  │                   Service Layer                            │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │    │
│  │  │ Signal   │ │ Risk     │ │ Execution│ │ State      │  │    │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Machine    │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │    │
│  │  │ Brain    │ │ Phase    │ │ Prob     │ │ Onchain    │  │    │
│  │  │ Layer    │ │ Detector │ │ Engine   │ │ Service    │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │    │
│  └───────────────────────────┬──────────────────────────────┘    │
│                              │                                     │
│  ┌───────────────────────────┴──────────────────────────────┐    │
│  │                    Core Engine                             │    │
│  │  ┌────────────────────────────────────────────────────┐  │    │
│  │  │              NEMTModelNode (统一模型入口)           │  │    │
│  │  │  process() → signals + risk + phase + prob + ...    │  │    │
│  │  └────────────────────────────────────────────────────┘  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐    │    │
│  │  │ NLS      │ │ Volatility│ │ SpatioTemporal       │    │    │
│  │  │ Solver   │ │ Engine   │ │ Engine               │    │    │
│  │  └──────────┘ └──────────┘ └──────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                    数据层 (Data Layer)                             │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Binance API  │  │ 链上数据     │  │ 宏观经济数据           │  │
│  │ (kline/行情) │  │ (MVRV/NUPL)  │  │ (利率/DXY/流动性)      │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘  │
│         └─────────────────┴───────────────────────┘               │
│                              │                                     │
│                    ┌─────────┴─────────┐                          │
│                    │   本地缓存 / SQLite │                          │
│                    └───────────────────┘                          │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 进程模型

```
┌────────────────────────────────────────────────────────┐
│  Electron Main Process                                  │
│  - 窗口管理 / 菜单 / 托盘                               │
│  - 启动 Python 子进程                                   │
│  - IPC 路由（渲染进程 ↔ Python 子进程）                  │
│                                                        │
│  ┌──────────────────────────┐                          │
│  │  Python 子进程            │                          │
│  │  uvicorn + FastAPI        │                          │
│  │  localhost:9000           │                          │
│  └──────────────────────────┘                          │
└────────────────────────────────────────────────────────┘

远程部署模式:

┌─────────────────────┐       ┌──────────────────────────┐
│  Electron (本地)     │──WSS──▶  Linux 服务器             │
│  Windows/macOS      │        │  FastAPI :9000            │
│                     │        │  NEMT 引擎                │
└─────────────────────┘       └──────────────────────────┘
```

### 3.3 技术选型

| 层 | 技术 | 理由 |
|------|------|------|
| **Web 框架** | FastAPI | 原生 async、自动 OpenAPI、WebSocket 支持、Pydantic 类型验证 |
| **ASGI 服务器** | uvicorn | 轻量、高性能、支持 WebSocket |
| **实时通信** | WebSocket (ws) | 全双工、低延迟、浏览器原生支持 |
| **序列化** | JSON + Pydantic | 类型安全、自动文档生成 |
| **进程管理** | Python subprocess (Electron 侧) + systemd (服务端) | |
| **缓存** | 内存 LRU Cache（已有 `ModelCache`）+ SQLite 可选 | |
| **数据获取** | binance_fetcher.py（已有）+ httpx 扩展 | |
| **任务队列** | asyncio + background tasks（阶段一）；Celery/Redis（阶段三） | |

---

## 4. 后端模块评估

### 4.1 模块一览

#### 直接可用模块（11 个）

这些模块具备清晰的 dataclass I/O、无外部副作用、可独立实例化，**直接包装为 API 端点即可**。

| # | 模块文件 | 行数 | 核心类 | 主要方法 | API 化难度 |
|---|---------|------|--------|---------|-----------|
| 1 | `nemt_signals.py` | 692 | `NEMTSignalIndicators` | `compute_dci()`, `detect_vortex()`, `detect_resonance()` | ⭐ 极易 |
| 2 | `nemt_risk.py` | 877 | `NEMTRiskManager` | `calculate_position()`, `evaluate_risk()`, `get_risk_mode()` | ⭐ 极易 |
| 3 | `nemt_execution.py` | 723 | `NEMTExecutionFramework` | `generate_entry_signals()`, `validate_signals()`, `calculate_tp_sl()` | ⭐ 极易 |
| 4 | `nemt_state_machine.py` | 559 | `NEMTStateMachine`, `PhaseMonitor` | `update()`, `get_current_phase()`, `get_phase_strategy()` | ⭐ 极易 |
| 5 | `enhanced_phase_detector.py` | 748 | `EnhancedPhaseDetector` | `analyze()`, `get_confidence()`, `get_warnings()` | ⭐ 极易 |
| 6 | `brain_layer.py` | 740 | `BrainLayer` | `calculate_weights()`, `allocate_funds()`, `get_risk_mode()`, `score_strategy()` | ⭐ 极易 |
| 7 | `nemt_probability_execution.py` | 821 | `NEMTProbabilityEngine` | `assess_trend_probability()`, `optimize_execution()` | ⭐ 极易 |
| 8 | `nemt_onchain.py` | 665 | `OnchainCalculator` | `calculate_mvrv_zscore()`, `calculate_health_score()`, `calculate_cycle_indicators()` | ⭐ 极易 |
| 9 | `nemt_controller.py` | 680 | `NEMTController` | `make_decision()`, `execute()`, `update_context()` | ⭐ 极易 |
| 10 | `nemt_model_node.py` | 758 | `NEMTModelNode` | `process()`, `run_model()`, `run_batch()` | ⭐ 极易 |
| 11 | `binance_fetcher.py` | 491 | `BinanceFetcher` | `fetch_klines()`, `fetch_by_range()`, `fetch_multi_symbols()` | ⭐ 极易 |

#### 需轻度适配模块（3 个）

| # | 模块文件 | 行数 | 问题 | 适配方案 |
|---|---------|------|------|---------|
| 12 | `nemt_volatility_model.py` | 847 | 需要 OI、资金费率等衍生数据 | 在 API 层补充数据获取逻辑 |
| 13 | `nemt_economic_analysis.py` | 819 | 需要宏观数据源（利率/DXY/央行资产负债表） | 第一阶段用静态配置，后期对接 FRED API |
| 14 | `nemt_spatial_temporal.py` | 807 | 需要多交易所订单簿 | 第一阶段仅用 Binance 单所数据 |

#### 需重写/替换模块（2 个）

| # | 原模块 | 替代方案 |
|---|--------|---------|
| 15 | `backtest_engine.py`（依赖外部 `nemt_os`） | 基于现有模块的信号 + 执行 + 风控重新实现，集成到 API |
| 16 | `visualizer.py`（Matplotlib 太重） | 前端用 Lightweight Charts，后端只输出数据 JSON |

### 4.2 模块依赖图

```
                        ┌─────────────────┐
                        │  NEMTController  │ ← 顶层编排器
                        └────────┬────────┘
               ┌─────────────────┼─────────────────┐
               │                 │                 │
       ┌───────┴───────┐ ┌──────┴──────┐ ┌───────┴───────┐
       │  BrainLayer   │ │ Execution   │ │  RiskManager  │
       │  (策略权重)    │ │ Framework   │ │  (仓位/止损)  │
       └───────┬───────┘ └──────┬──────┘ └───────┬───────┘
               │                │                 │
       ┌───────┴────────────────┴─────────────────┴───────┐
       │                                                  │
  ┌────┴────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐  │
  │ Signals │ │  State   │ │  Enhanced  │ │  Prob     │  │
  │ (DCI/   │ │ Machine  │ │  Phase     │ │  Engine   │  │
  │ 涡旋/   │ │ (ABCD相) │ │  Detector  │ │  (概率)   │  │
  │ 共振)   │ │          │ │            │ │           │  │
  └────┬────┘ └────┬─────┘ └──────┬─────┘ └─────┬─────┘  │
       │           │              │              │        │
  ┌────┴───────────┴──────────────┴──────────────┴────┐   │
  │               NEMTModelNode (统一入口)              │   │
  └──────────────────────┬─────────────────────────────┘   │
                         │                                  │
  ┌──────────────────────┼──────────────────────────────┐  │
  │         ┌────────────┴────────────┐                   │  │
  │   ┌─────┴─────┐ ┌──────────┐ ┌───┴──────────────┐   │  │
  │   │ NLS Core  │ │Volatility│ │SpatioTemporal    │   │  │
  │   │ (PDE求解) │ │Model     │ │(多周期/跨所)     │   │  │
  │   └───────────┘ └──────────┘ └──────────────────┘   │  │
  └─────────────────────────────────────────────────────┘  │
                                                           │
  ┌─────────────────────────────────────────────────────┐  │
  │  Onchain       Economic         BinanceFetcher       │  │
  │  (链上数据)    Analysis         (行情数据)           │  │
  │               (宏观经济)                              │  │
  └─────────────────────────────────────────────────────┘  │
```

### 4.3 每个模块的 I/O 契约

#### nemt_signals.py

```
输入: OHLC price arrays (List[float]), onchain_metrics (dict)
输出: NEMTSignals {
    dci: DCISignal { direction, strength, consistency },
    vortex: VortexConditions { condition_1..4, satisfied_count },
    resonance: ResonanceConditions { condition_1..3, satisfied_count },
    spectral_width: float,
    snr: float
}
```

#### nemt_risk.py

```
输入: account_balance (float), market_phase (str), atr (float),
      trade_signal (dict), current_positions (list)
输出: RiskAssessment {
    position_size: PositionSize { size_usd, size_btc, leverage },
    stop_loss: StopLossConfig { initial, trailing, atr_multiplier },
    risk_mode: str (green/yellow/orange/red),
    drawdown_level: float,
    cooling_off: bool
}
```

#### nemt_execution.py

```
输入: market_data (dict), account_balance (float), current_positions (list)
输出: TradePlan {
    entry_signals: List[EntrySignal],
    validation: ValidationResult { checklist_scores, passed },
    position: Position { size, leverage, direction },
    tp_levels: List[float],
    sl_level: float
}
```

#### nemt_state_machine.py

```
输入: dci_signal (DCISignal), vortex_conditions (VortexConditions),
      resonance_conditions (ResonanceConditions), onchain_health (OnchainHealthScore)
输出: PhaseTransition {
    current_phase: MarketPhase (A/B/C/D),
    previous_phase: MarketPhase,
    transition_confidence: float,
    phase_strategy: PhaseStrategy,
    warnings: List[str]
}
```

#### nemt_controller.py

```
输入: market_data (dict), account_state (dict), onchain_data (dict)
输出: ExecutionDecision {
    action: str (buy/sell/hold/wait),
    position_size: PositionSize,
    risk_mode: str,
    confidence: float,
    reasoning: List[str]
}
```

#### nemt_model_node.py

```
输入: ModelInput { price_data, onchain_data, market_data, config }
输出: ModelOutput {
    phase: MarketPhase,
    signals: NEMTSignals,
    risk: RiskAssessment,
    execution: TradePlan,
    probability: TrendProbability,
    timestamp: datetime
}
```

---

## 5. API 接口设计

### 5.1 API 概览

所有 API 前缀: `/api/v1`

| 方法 | 端点 | 功能 | 阶段 |
|------|------|------|------|
| `POST` | `/api/v1/analyze` | 统一分析（全链路） | 1 |
| `POST` | `/api/v1/signals` | 信号计算 | 1 |
| `POST` | `/api/v1/phase` | 相位检测 | 1 |
| `POST` | `/api/v1/risk/evaluate` | 风控评估 | 2 |
| `POST` | `/api/v1/risk/position-size` | 仓位计算 | 2 |
| `POST` | `/api/v1/execution/plan` | 执行计划 | 2 |
| `POST` | `/api/v1/execution/signals` | 入场信号 | 2 |
| `POST` | `/api/v1/backtest/run` | 回测运行 | 2 |
| `POST` | `/api/v1/brain/weights` | 策略权重 | 2 |
| `POST` | `/api/v1/brain/allocate` | 资金分配 | 2 |
| `POST` | `/api/v1/probability/assess` | 概率评估 | 2 |
| `POST` | `/api/v1/onchain/health` | 链上健康度 | 2 |
| `POST` | `/api/v1/onchain/cycle` | 周期指标 | 2 |
| `POST` | `/api/v1/data/klines` | K线数据 | 2 |
| `WS` | `/ws` | 实时事件流 | 3 |
| `POST` | `/api/v1/phase/transition` | 相位转换事件 | 3 |
| `POST` | `/api/v1/risk/alert` | 风控预警 | 3 |

### 5.2 核心端点详细设计

#### 5.2.1 POST /api/v1/analyze — 统一分析

这是最重要的端点，对应 `NEMTModelNode.process()`。

```json
// Request
{
  "symbol": "BTCUSDT",
  "timeframe": "1h",
  "klines": [
    {
      "open_time": 1714953600000,
      "open": 63420.50,
      "high": 64100.00,
      "low": 63200.00,
      "close": 63850.00,
      "volume": 1234.56
    }
  ],
  "onchain_data": {
    "mvrv_zscore": 2.1,
    "nupl": 0.45,
    "exchange_balance": 2300000,
    "lth_sth_ratio": 2.3,
    "funding_rate": 0.01
  },
  "account": {
    "balance": 100000.0,
    "current_positions": []
  },
  "config": {
    "use_economic_analysis": false,
    "use_volatility_model": false
  }
}

// Response
{
  "success": true,
  "data": {
    "timestamp": "2026-05-06T14:30:00Z",
    "phase": {
      "current": "B",
      "previous": "A",
      "confidence": 0.78,
      "description": "涡旋形成期 — 适合观察入场",
      "warnings": ["成交量未放大，关注共振触发"]
    },
    "signals": {
      "dci": {
        "direction": 1,
        "strength": 0.65,
        "consistency": 0.72
      },
      "vortex": {
        "satisfied_count": 3,
        "conditions": [true, true, true, false],
        "maturity": 0.6
      },
      "resonance": {
        "satisfied_count": 1,
        "conditions": [true, false, false]
      },
      "spectral_width": 0.34,
      "snr": 2.1
    },
    "risk": {
      "risk_mode": "yellow",
      "position_size": {
        "size_usd": 25000,
        "size_btc": 0.392,
        "leverage": 2.0
      },
      "stop_loss": {
        "initial": 62000,
        "trailing": true,
        "atr_multiplier": 1.5
      },
      "max_drawdown_pct": 15.0
    },
    "probability": {
      "short_term_score": 58,
      "medium_term_score": 72,
      "long_term_score": 65,
      "composite": 65
    }
  },
  "meta": {
    "processing_time_ms": 145,
    "model_version": "1.0.0"
  }
}
```

#### 5.2.2 POST /api/v1/signals — 信号计算

```json
// Request
{
  "klines": [...],
  "config": {
    "dci_window": 20,
    "vortex_threshold": 0.6
  }
}

// Response
{
  "success": true,
  "data": {
    "dci": { "direction": 1, "strength": 0.65, "consistency": 0.72 },
    "vortex": { "satisfied_count": 3, "conditions": [true, true, true, false] },
    "resonance": { "satisfied_count": 1, "conditions": [true, false, false] },
    "spectral_width": 0.34,
    "snr": 2.1,
    "dci_history": [0.45, 0.52, 0.58, 0.61, 0.65],
    "spectral_width_history": [0.55, 0.48, 0.42, 0.37, 0.34]
  }
}
```

#### 5.2.3 POST /api/v1/risk/evaluate — 风控评估

```json
// Request
{
  "account_balance": 100000.0,
  "market_phase": "B",
  "atr": 1200.0,
  "price": 63850.0,
  "trade_signal": {
    "type": "vortex_breakout",
    "direction": "long",
    "confidence": 0.72
  },
  "current_positions": [
    { "symbol": "BTCUSDT", "size_btc": 0.5, "entry_price": 62000 }
  ]
}

// Response
{
  "success": true,
  "data": {
    "can_trade": true,
    "risk_mode": "yellow",
    "position_size": { "size_usd": 25000, "size_btc": 0.392, "leverage": 2.0 },
    "stop_loss": { "initial": 62500, "trailing": true, "atr_multiplier": 1.5 },
    "take_profit": [
      { "price": 66000, "size_pct": 40 },
      { "price": 68000, "size_pct": 30 },
      { "price": 70000, "size_pct": 30 }
    ],
    "drawdown_limit": 15.0,
    "cooling_off": false,
    "warnings": []
  }
}
```

#### 5.2.4 POST /api/v1/execution/plan — 执行计划

```json
// Request
{
  "klines": [...],
  "account_balance": 100000.0,
  "onchain_health": { "mvrv_zscore": 2.1, "nupl": 0.45 }
}

// Response
{
  "success": true,
  "data": {
    "action": "buy",
    "entry_signals": [
      {
        "type": "vortex_breakout",
        "direction": "long",
        "confidence": 0.72,
        "validated": true
      }
    ],
    "validation": {
      "all_passed": true,
      "checklist": [
        { "item": "DCI方向确认", "passed": true, "detail": "DCI:+1, 强度:0.65" },
        { "item": "涡旋条件满足≥3/4", "passed": true, "detail": "满足3/4" },
        { "item": "链上健康度≥50", "passed": true, "detail": "得分:68" },
        { "item": "非冷却期", "passed": true, "detail": "" },
        { "item": "风控模式非红色", "passed": true, "detail": "当前:yellow" },
        { "item": "资金充足", "passed": true, "detail": "余额:$100,000" }
      ]
    },
    "position_plan": {
      "entry_price_range": [63500, 64000],
      "add_position_prices": [65000, 67000],
      "stop_loss": 62500,
      "take_profit": [66000, 68000, 70000]
    }
  }
}
```

#### 5.2.5 WebSocket /ws — 实时事件流

```
客户端 → 服务器:  订阅消息
服务器 → 客户端:  事件推送

消息类型:
  - phase_change      相位转换事件
  - signal_update     信号更新
  - risk_alert        风控预警
  - price_tick        行情推送
  - trade_executed    交易成交
  - error             错误信息
```

```json
// 客户端订阅
{
  "type": "subscribe",
  "channels": ["phase_change", "signal_update", "risk_alert", "price_tick"],
  "symbol": "BTCUSDT"
}

// 服务器推送 — 相位转换
{
  "type": "phase_change",
  "data": {
    "symbol": "BTCUSDT",
    "from_phase": "B",
    "to_phase": "C",
    "confidence": 0.82,
    "timestamp": "2026-05-06T14:35:00Z",
    "message": "涡旋→共振转换: 共振条件2/3满足"
  }
}

// 服务器推送 — 风控预警
{
  "type": "risk_alert",
  "data": {
    "level": "orange",
    "message": "回撤达到12%，接近15%红线",
    "current_drawdown": 12.3,
    "max_allowed": 15.0,
    "timestamp": "2026-05-06T14:36:00Z"
  }
}
```

### 5.3 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_DATA",
    "message": "K线数据不足，需要至少20根K线，当前仅提供12根",
    "detail": {
      "required": 20,
      "provided": 12
    }
  }
}
```

错误码定义：

| 错误码 | HTTP 状态码 | 说明 |
|------|------------|------|
| `INSUFFICIENT_DATA` | 400 | 输入数据不足 |
| `INVALID_PARAMS` | 400 | 参数格式/值不合法 |
| `MODULE_NOT_AVAILABLE` | 503 | 模块加载失败 |
| `COMPUTATION_ERROR` | 500 | 计算过程异常 |
| `TIMEOUT` | 504 | 计算超时 |
| `RATE_LIMITED` | 429 | 请求频率超限 |

---

## 6. 通信层设计

### 6.1 Electron ↔ Python 进程通信

两种模式：

#### 模式 A: 本地开发 — 子进程启动

```
Electron Main Process
  └─ spawn('python', ['-m', 'uvicorn', 'main:app', '--port', '9000'])
  └─ HTTP/WS: http://localhost:9000
```

Electron 启动时自动拉起 Python 进程，退出时自动关闭。

```typescript
// src/desktop/main/pythonBridge.ts
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

let pythonProcess: ChildProcess | null = null;

export function startPythonBackend(): void {
  const scriptPath = path.join(__dirname, '../../nemt_api/main.py');
  pythonProcess = spawn('python', [
    '-m', 'uvicorn',
    'nemt_api.main:app',
    '--host', '127.0.0.1',
    '--port', '9000'
  ], {
    cwd: path.join(__dirname, '../../nemt_api'),
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });

  pythonProcess.stdout?.on('data', (data) => {
    console.log(`[Python API] ${data}`);
  });

  pythonProcess.stderr?.on('data', (data) => {
    console.error(`[Python API Error] ${data}`);
  });
}

export function stopPythonBackend(): void {
  if (pythonProcess) {
    pythonProcess.kill('SIGTERM');
    pythonProcess = null;
  }
}
```

#### 模式 B: 远程部署 — 网络连接

```typescript
// Electron 连接远程 API
const API_BASE = process.env.NEMT_API_URL || 'http://localhost:9000';
const WS_URL = process.env.NEMT_WS_URL || 'ws://localhost:9000/ws';
```

### 6.2 IPC 桥接设计

Electron 主进程作为代理，转发渲染进程的 API 请求到 Python。

```
渲染进程                    主进程                      Python API
   │                          │                           │
   │──IPC('api:analyze')─────▶│                           │
   │                          │──HTTP POST /analyze──────▶│
   │                          │                           │
   │                          │◀──JSON Response───────────│
   │◀─IPC Response────────────│                           │
```

```typescript
// src/desktop/main/ipc.ts 中注册 API 代理
import { ipcMain } from 'electron';
import axios from 'axios';

const API_BASE = 'http://localhost:9000/api/v1';

ipcMain.handle('api:analyze', async (_event, payload) => {
  const { data } = await axios.post(`${API_BASE}/analyze`, payload);
  return data;
});

ipcMain.handle('api:signals', async (_event, payload) => {
  const { data } = await axios.post(`${API_BASE}/signals`, payload);
  return data;
});

// ... 其他端点同理
```

### 6.3 WebSocket 客户端

```typescript
// src/desktop/main/wsBridge.ts
import WebSocket from 'ws';

class WSBridge {
  private ws: WebSocket | null = null;

  connect(): void {
    this.ws = new WebSocket('ws://localhost:9000/ws');

    this.ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString());
      // 转发给渲染进程
      mainWindow?.webContents.send('ws:message', msg);
    });

    this.ws.on('close', () => {
      // 自动重连
      setTimeout(() => this.connect(), 3000);
    });
  }

  subscribe(channels: string[], symbol: string): void {
    this.ws?.send(JSON.stringify({
      type: 'subscribe',
      channels,
      symbol
    }));
  }
}
```

---

## 7. 数据管线设计

### 7.1 数据流架构

```
Binance API ──▶ binance_fetcher.py ──▶ 内存缓存 ──▶ API 端点──▶ Electron UI
                                │
                                └──▶ SQLite (可选持久化)
链上数据 ────▶ nemt_onchain.py ──▶ OnchainCalculator ──▶ API 端点
                                │
                                └──▶ NEMTModelNode (统一分析输入)
```

### 7.2 缓存策略

```python
# Python 侧 — 利用 ModelCache
class DataCache:
    def __init__(self):
        self._klines: Dict[str, List[KlineData]] = {}
        self._ttl: Dict[str, float] = {}
        self._max_age = 60  # 秒

    def get_klines(self, symbol: str, interval: str) -> List[KlineData] | None:
        key = f"{symbol}:{interval}"
        if key in self._klines and time.time() - self._ttl[key] < self._max_age:
            return self._klines[key]
        return None

    def set_klines(self, symbol: str, interval: str, klines: List[KlineData]):
        key = f"{symbol}:{interval}"
        self._klines[key] = klines
        self._ttl[key] = time.time()
```

### 7.3 数据获取流程

```
1. 前端请求 /api/v1/analyze
2. API 检查内存缓存
3. 缓存命中 → 直接使用
4. 缓存未命中 → binance_fetcher.fetch_klines()
5. 数据写入缓存
6. 传递给 NEMTModelNode.process()
7. 返回计算结果
```

---

## 8. 阶段一：最小可用 API

### 8.1 目标

在 Linux 服务器上搭建 FastAPI，包装 `nemt_model_node.py`，暴露 3 个核心端点，验证 Electron ↔ Python 通信链。

### 8.2 项目结构

```
/root/nemt-runtime/
├── nemt_api/                    # 新建: Python API 项目
│   ├── __init__.py
│   ├── main.py                  # FastAPI 入口 + uvicorn 启动
│   ├── config.py                # 配置文件
│   ├── dependencies.py          # 依赖注入 (获取模块实例)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── analyze.py           # POST /api/v1/analyze
│   │   ├── signals.py           # POST /api/v1/signals
│   │   └── phase.py             # POST /api/v1/phase
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── request.py           # Pydantic 请求模型
│   │   └── response.py          # Pydantic 响应模型
│   ├── services/
│   │   ├── __init__.py
│   │   ├── model_service.py     # 包装 NEMTModelNode
│   │   └── data_service.py      # 数据缓存 + binance_fetcher 调用
│   ├── adapters/                # 将现有模块的 dataclass → Pydantic
│   │   ├── __init__.py
│   │   ├── signals_adapter.py
│   │   ├── risk_adapter.py
│   │   └── phase_adapter.py
│   └── requirements.txt        # Python 依赖
├── src/
│   ├── desktop/main/
│   │   ├── ipc.ts               # 添加 API 代理 handler
│   │   ├── pythonBridge.ts      # 新增: 启动 Python 子进程
│   │   └── wsBridge.ts          # 新增: WebSocket 客户端
│   └── services/
│       └── apiClient.ts         # 新增: TypeScript API 客户端
```

### 8.3 实现步骤

#### Step 1: 创建 Python API 项目骨架

```bash
# 在远程服务器上
mkdir -p /root/nemt-runtime/nemt_api/routers
mkdir -p /root/nemt-runtime/nemt_api/schemas
mkdir -p /root/nemt-runtime/nemt_api/services
mkdir -p /root/nemt-runtime/nemt_api/adapters
touch /root/nemt-runtime/nemt_api/__init__.py
touch /root/nemt-runtime/nemt_api/routers/__init__.py
touch /root/nemt-runtime/nemt_api/schemas/__init__.py
touch /root/nemt-runtime/nemt_api/services/__init__.py
touch /root/nemt-runtime/nemt_api/adapters/__init__.py
```

#### Step 2: 安装 Python 依赖

```
# nemt_api/requirements.txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
pydantic==2.9.0
numpy==1.26.0
pandas==2.2.0
httpx==0.27.0       # 替代 requests，支持 async
python-dotenv==1.0.0
websockets==12.0
```

```bash
pip install -r nemt_api/requirements.txt
```

#### Step 3: 编写 main.py

```python
# nemt_api/main.py
import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 将 NEMT-Simulator2 模块路径加入 sys.path
NEMT_SRC = "/root/NEMT-Simulator2"
if NEMT_SRC not in sys.path:
    sys.path.insert(0, NEMT_SRC)

from nemt_api.routers import analyze, signals, phase
from nemt_api.services.model_service import ModelService

model_service = ModelService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时加载模型
    model_service.initialize()
    print("[NEMT API] Model loaded successfully")
    yield
    # 关闭时清理
    print("[NEMT API] Shutting down")

app = FastAPI(
    title="NEMT API Middle Platform",
    version="1.0.0",
    description="Quantitative Trading Middle Platform — Signal, Risk, Execution API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api/v1")
app.include_router(signals.router, prefix="/api/v1")
app.include_router(phase.router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok", "modules_loaded": model_service.is_ready()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
```

#### Step 4: 编写 model_service.py — 核心服务

```python
# nemt_api/services/model_service.py
import sys
sys.path.insert(0, "/root/NEMT-Simulator2")

from nemt_model_node import NEMTModelNode, ModelNodeConfig, ModelInput
from nemt_signals import NEMTSignalIndicators
from enhanced_phase_detector import EnhancedPhaseDetector
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class ModelService:
    """统一模型服务 — 包装 NEMTModelNode 和各子模块"""

    def __init__(self):
        self._model_node: Optional[NEMTModelNode] = None
        self._signal_indicators: Optional[NEMTSignalIndicators] = None
        self._phase_detector: Optional[EnhancedPhaseDetector] = None

    def initialize(self):
        """初始化所有模块"""
        config = ModelNodeConfig(
            use_economic_analysis=False,
            use_volatility_model=False,
            cache_size=100
        )
        self._model_node = NEMTModelNode(config)
        self._signal_indicators = NEMTSignalIndicators()
        self._phase_detector = EnhancedPhaseDetector()
        logger.info("All modules initialized")

    def is_ready(self) -> bool:
        return self._model_node is not None

    def analyze(self, klines: list, onchain_data: dict = None,
                account: dict = None) -> dict:
        """统一分析 — 对应 NEMTModelNode.process()"""
        if not self._model_node:
            raise RuntimeError("ModelService not initialized")

        # 构造 ModelInput
        model_input = ModelInput(
            price_data=self._klines_to_price_array(klines),
            onchain_data=onchain_data or {},
            market_data={"klines": klines},
            account=account or {}
        )

        # 调用统一模型
        result = self._model_node.process(model_input)

        return self._serialize_model_output(result)

    def compute_signals(self, klines: list) -> dict:
        """单独信号计算"""
        closes = [k['close'] for k in klines]
        highs = [k['high'] for k in klines]
        lows = [k['low'] for k in klines]
        volumes = [k['volume'] for k in klines]

        dci = self._signal_indicators.compute_dci(closes)
        vortex = self._signal_indicators.detect_vortex(
            closes, highs, lows, volumes
        )
        resonance = self._signal_indicators.detect_resonance(closes)

        return {
            "dci": self._serialize(dci),
            "vortex": self._serialize(vortex),
            "resonance": self._serialize(resonance),
            "spectral_width": self._signal_indicators.calc_spectral_width(closes),
            "snr": self._signal_indicators.calc_snr(closes)
        }

    def detect_phase(self, klines: list, onchain_data: dict = None) -> dict:
        """相位检测"""
        result = self._phase_detector.analyze(klines, onchain_data)
        return self._serialize(result)

    def _klines_to_price_array(self, klines: list) -> list:
        return [float(k['close']) for k in klines]

    def _serialize(self, obj):
        """将 dataclass 转为可 JSON 序列化的 dict"""
        if hasattr(obj, '__dataclass_fields__'):
            return {
                k: self._serialize(v)
                for k, v in obj.__dict__.items()
                if not k.startswith('_')
            }
        elif isinstance(obj, list):
            return [self._serialize(v) for v in obj]
        elif isinstance(obj, dict):
            return {k: self._serialize(v) for k, v in obj.items()}
        elif hasattr(obj, 'value'):  # Enum
            return obj.value
        else:
            return obj

    def _serialize_model_output(self, result) -> dict:
        return self._serialize(result)
```

#### Step 5: 编写路由

```python
# nemt_api/routers/analyze.py
from fastapi import APIRouter, Depends
from nemt_api.services.model_service import ModelService
from nemt_api.dependencies import get_model_service

router = APIRouter()

@router.post("/analyze")
async def analyze(
    request: dict,
    service: ModelService = Depends(get_model_service)
):
    result = service.analyze(
        klines=request.get("klines", []),
        onchain_data=request.get("onchain_data"),
        account=request.get("account")
    )
    return {
        "success": True,
        "data": result,
        "meta": {"model_version": "1.0.0"}
    }
```

#### Step 6: TypeScript API 客户端

```typescript
// src/services/apiClient.ts
const API_BASE = 'http://localhost:9000/api/v1';

export interface KlineData {
  open_time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AnalyzeRequest {
  symbol: string;
  timeframe: string;
  klines: KlineData[];
  onchain_data?: Record<string, any>;
  account?: { balance: number; current_positions: any[] };
}

export async function analyze(request: AnalyzeRequest) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return res.json();
}

export async function computeSignals(klines: KlineData[]) {
  const res = await fetch(`${API_BASE}/signals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ klines }),
  });
  return res.json();
}

export async function detectPhase(klines: KlineData[]) {
  const res = await fetch(`${API_BASE}/phase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ klines }),
  });
  return res.json();
}
```

#### Step 7: Electron IPC 代理

```typescript
// src/desktop/main/ipc.ts 中新增
ipcMain.handle('api:analyze', async (_e, payload) => {
  const res = await fetch('http://localhost:9000/api/v1/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
});
```

### 8.4 阶段一验证清单

- [ ] `pip install -r nemt_api/requirements.txt` 通过
- [ ] `python -m uvicorn nemt_api.main:app --port 9000` 启动
- [ ] `curl http://localhost:9000/health` 返回 `{"status":"ok"}`
- [ ] `POST /api/v1/analyze` 用 Mock K 线数据返回完整分析结果
- [ ] `POST /api/v1/signals` 返回 DCI/涡旋/共振
- [ ] `POST /api/v1/phase` 返回相位检测结果
- [ ] TypeScript `apiClient.ts` 能调用 Python API
- [ ] Electron 端渲染进程通过 IPC 获取到分析结果
- [ ] `http://localhost:9000/docs` Swagger 文档可访问

---

## 9. 阶段二：完整交易中台

### 9.1 目标

将剩余 8 个核心模块全部包装为 API 端点，完成前后端功能闭环。

### 9.2 新增端点

```
POST /api/v1/risk/evaluate          # 风控评估 (nemt_risk.py)
POST /api/v1/risk/position-size     # 仓位计算
POST /api/v1/execution/plan         # 执行计划 (nemt_execution.py)
POST /api/v1/execution/signals      # 入场信号
POST /api/v1/backtest/run           # 回测运行 (backtest_engine 重写)
POST /api/v1/brain/weights          # 策略权重 (brain_layer.py)
POST /api/v1/brain/allocate         # 资金分配
POST /api/v1/probability/assess     # 概率评估 (nemt_probability_execution.py)
POST /api/v1/onchain/health         # 链上健康度 (nemt_onchain.py)
POST /api/v1/onchain/cycle          # 周期指标
POST /api/v1/data/klines            # K线数据 (binance_fetcher.py)
```

### 9.3 新增文件

```
nemt_api/
├── routers/
│   ├── risk.py                     # 新增
│   ├── execution.py                # 新增
│   ├── backtest.py                 # 新增
│   ├── brain.py                    # 新增
│   ├── probability.py             # 新增
│   ├── onchain.py                  # 新增
│   └── data.py                     # 新增
├── services/
│   ├── risk_service.py             # 新增: 包装 NEMTRiskManager
│   ├── execution_service.py        # 新增: 包装 NEMTExecutionFramework
│   ├── backtest_service.py         # 新增: 回测服务
│   ├── brain_service.py            # 新增: 包装 BrainLayer
│   ├── probability_service.py     # 新增: 包装 NEMTProbabilityEngine
│   ├── onchain_service.py          # 新增: 包装 OnchainCalculator
│   └── data_service.py             # 新增: 包装 BinanceFetcher
├── adapters/
│   ├── risk_adapter.py             # 新增
│   ├── execution_adapter.py        # 新增
│   ├── brain_adapter.py            # 新增
│   ├── probability_adapter.py     # 新增
│   ├── onchain_adapter.py          # 新增
│   └── backtest_adapter.py         # 新增
└── schemas/
    ├── request.py                  # 扩展
    └── response.py                 # 扩展
```

### 9.4 回测引擎重写

原 `backtest_engine.py` 依赖外部 `nemt_os` 包，需基于现有模块重建。

```python
# nemt_api/services/backtest_service.py
import sys
sys.path.insert(0, "/root/NEMT-Simulator2")

from nemt_signals import NEMTSignalIndicators
from nemt_execution import NEMTExecutionFramework
from nemt_risk import NEMTRiskManager
from nemt_state_machine import NEMTStateMachine
from enhanced_phase_detector import EnhancedPhaseDetector
from typing import List, Dict
import pandas as pd

class BacktestService:
    """基于现有模块的回测引擎"""

    def __init__(self):
        self.signals = NEMTSignalIndicators()
        self.phase_detector = EnhancedPhaseDetector()
        self.risk_manager = None  # 按初始资金创建

    def run(self, klines: List[dict],
            initial_capital: float = 100000.0,
            strategy_type: str = "vortex_breakout") -> dict:
        """
        逐根K线遍历，模拟交易决策
        """
        self.risk_manager = NEMTRiskManager(initial_capital)
        trades = []
        equity_curve = [initial_capital]
        current_position = None

        for i in range(50, len(klines)):  # 至少50根K线才开始
            window = klines[:i+1]

            # 1. 计算信号
            signals_result = self.signals.compute_all(
                closes=[k['close'] for k in window],
                highs=[k['high'] for k in window],
                lows=[k['low'] for k in window],
                volumes=[k['volume'] for k in window]
            )

            # 2. 相位检测
            phase_result = self.phase_detector.analyze(window)

            # 3. 交易决策 (简化版)
            decision = self._make_decision(
                signals_result, phase_result, current_position
            )

            # 4. 执行交易
            if decision['action'] in ('buy', 'sell'):
                trade = self._execute_trade(
                    decision, klines[i], initial_capital
                )
                trades.append(trade)

            # 5. 更新权益曲线
            equity = self._calculate_equity(
                trades, klines[i]['close'], initial_capital
            )
            equity_curve.append(equity)

        # 6. 计算回测指标
        return self._calculate_metrics(trades, equity_curve, initial_capital)

    def _make_decision(self, signals, phase, position) -> dict:
        """简化的交易决策逻辑"""
        # 涡旋突破 + 共振确认 → 入场
        if (signals.vortex.satisfied_count >= 3 and
            phase.phase == 'B' and
            position is None):
            return {'action': 'buy', 'confidence': 0.72}
        # 趋势衰竭 → 出场
        elif (phase.phase == 'D' and
              position is not None):
            return {'action': 'sell', 'confidence': 0.68}
        else:
            return {'action': 'hold'}

    def _execute_trade(self, decision, kline, capital) -> dict:
        """执行交易"""
        risk_eval = self.risk_manager.evaluate_risk(
            account_balance=capital,
            market_phase='B',
            atr=kline['high'] - kline['low'],
            trade_signal=decision
        )
        return {
            'timestamp': kline['open_time'],
            'action': decision['action'],
            'price': kline['close'],
            'size_usd': risk_eval.position_size.size_usd,
            'stop_loss': risk_eval.stop_loss.initial
        }

    def _calculate_equity(self, trades, current_price, initial_capital) -> float:
        """计算当前权益"""
        pnl = 0
        for t in trades:
            if t['action'] == 'buy':
                pnl += (current_price - t['price']) / t['price'] * t['size_usd']
            elif t['action'] == 'sell':
                pnl += (t['price'] - current_price) / current_price * t['size_usd']
        return initial_capital + pnl

    def _calculate_metrics(self, trades, equity_curve, initial_capital) -> dict:
        """计算回测指标"""
        df = pd.Series(equity_curve)
        returns = df.pct_change().dropna()

        return {
            "total_return_pct": (equity_curve[-1] / initial_capital - 1) * 100,
            "max_drawdown_pct": self._max_drawdown(equity_curve),
            "sharpe_ratio": self._sharpe(returns),
            "win_rate": self._win_rate(trades),
            "total_trades": len(trades),
            "equity_curve": equity_curve[::max(1, len(equity_curve) // 200)],
            "trades": trades
        }

    def _max_drawdown(self, equity: List[float]) -> float:
        peak = equity[0]
        max_dd = 0
        for v in equity:
            if v > peak:
                peak = v
            dd = (peak - v) / peak * 100
            if dd > max_dd:
                max_dd = dd
        return max_dd

    def _sharpe(self, returns) -> float:
        if len(returns) == 0:
            return 0
        return (returns.mean() / returns.std()) * (252 ** 0.5) if returns.std() > 0 else 0

    def _win_rate(self, trades: List[dict]) -> float:
        if not trades:
            return 0
        wins = sum(1 for t in trades if t.get('pnl', 0) > 0)
        return wins / len(trades) * 100
```

### 9.5 阶段二验证清单

- [ ] 所有 14 个 REST 端点正常响应
- [ ] Swagger 文档完整（`/docs`）
- [ ] 回测引擎可对历史数据运行并输出指标
- [ ] 链上数据计算端点可工作
- [ ] TypeScript 端所有 API 调用正常
- [ ] 回测面板 UI 能显示 Python 计算的真实回测结果
- [ ] 策略市场中的信号数据来自 Python 计算
- [ ] 风控面板显示 Python 风控引擎结果

---

## 10. 阶段三：实时交易系统

### 10.1 目标

实现 WebSocket 实时推送、行情流、自动交易信号。

### 10.2 WebSocket 实现

```python
# nemt_api/ws.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import asyncio
import json

class ConnectionManager:
    """WebSocket 连接管理器"""

    def __init__(self):
        self._connections: Dict[str, Set[WebSocket]] = {
            "phase_change": set(),
            "signal_update": set(),
            "risk_alert": set(),
            "price_tick": set(),
        }

    async def connect(self, ws: WebSocket):
        await ws.accept()

    async def disconnect(self, ws: WebSocket):
        for channel in self._connections.values():
            channel.discard(ws)

    async def subscribe(self, ws: WebSocket, channels: list):
        for ch in channels:
            if ch in self._connections:
                self._connections[ch].add(ws)

    async def broadcast(self, channel: str, data: dict):
        dead = set()
        for ws in self._connections.get(channel, set()):
            try:
                await ws.send_json({"type": channel, "data": data})
            except:
                dead.add(ws)
        self._connections[channel] -= dead

manager = ConnectionManager()

# 在 main.py 中注册 WebSocket 路由
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            msg = await ws.receive_json()
            if msg.get("type") == "subscribe":
                await manager.subscribe(ws, msg.get("channels", []))
            elif msg.get("type") == "ping":
                await ws.send_json({"type": "pong"})
    except WebSocketDisconnect:
        await manager.disconnect(ws)
```

### 10.3 实时行情推送

```python
# nemt_api/services/realtime_service.py
import asyncio
from nemt_api.ws import manager
from binance_fetcher import BinanceFetcher

class RealtimeService:
    def __init__(self):
        self._fetcher = BinanceFetcher()
        self._running = False

    async def start(self, symbols: list = ["BTCUSDT"], interval: str = "5m"):
        self._running = True
        while self._running:
            for symbol in symbols:
                klines = self._fetcher.fetch_klines(symbol, interval, limit=1)
                if klines is not None and len(klines) > 0:
                    latest = klines.iloc[-1]
                    await manager.broadcast("price_tick", {
                        "symbol": symbol,
                        "price": float(latest['close']),
                        "open": float(latest['open']),
                        "high": float(latest['high']),
                        "low": float(latest['low']),
                        "volume": float(latest['volume']),
                        "timestamp": int(latest['open_time'])
                    })
            await asyncio.sleep(60)  # 每分钟轮询

    def stop(self):
        self._running = False
```

### 10.4 TypeScript WebSocket 集成

```typescript
// src/hooks/useRealtimeData.ts
import { useEffect, useRef } from 'react';
import { useSignalStore } from '../stores/signalStore';
import { useRiskStore } from '../stores/riskStore';

export function useRealtimeData(symbol: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const updateSignal = useSignalStore(s => s.updateSignal);
  const addAlert = useRiskStore(s => s.addAlert);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:9000/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        channels: ['phase_change', 'signal_update', 'risk_alert', 'price_tick'],
        symbol
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case 'phase_change':
          updateSignal({ phase: msg.data });
          break;
        case 'risk_alert':
          addAlert(msg.data);
          break;
        case 'price_tick':
          updateSignal({ price: msg.data });
          break;
      }
    };

    return () => ws.close();
  }, [symbol]);
}
```

### 10.5 阶段三验证清单

- [ ] WebSocket 连接正常
- [ ] 前端能收到相位转换推送
- [ ] 前端能收到风控预警推送
- [ ] 实时行情数据每分钟刷新
- [ ] 断线自动重连
- [ ] Python API 作为 systemd 服务运行
- [ ] 远程部署模式下 Electron 可连接远程服务器

---

## 11. TypeScript 端改造

### 11.1 受影响的文件

| 文件 | 改造内容 |
|------|---------|
| `src/services/apiClient.ts` | 新建: TypeScript API 客户端 |
| `src/desktop/main/ipc.ts` | 添加 API 代理 handler |
| `src/desktop/main/pythonBridge.ts` | 新建: Python 子进程管理 |
| `src/desktop/main/wsBridge.ts` | 新建: WebSocket 桥接 |
| `src/stores/backtestStore.ts` | 替换 Mock 数据为真实 API 调用 |
| `src/stores/signalStore.ts` | 替换 Mock 为 API + WebSocket |
| `src/stores/riskStore.ts` | 替换 Mock 为 API + WebSocket |
| `src/stores/performanceStore.ts` | 替换 Mock 为真实回测指标 |
| `src/components/strategies/BacktestEngine.tsx` | 对接真实回测 |
| `src/components/strategies/execution/MonitorTab.tsx` | 对接实时执行状态 |
| `src/hooks/useRealtimeData.ts` | 新建: WebSocket hook |

### 11.2 Store 改造示例

```typescript
// src/stores/backtestStore.ts — 改造后
import { create } from 'zustand';
import { analyze, runBacktest, type AnalyzeRequest } from '../services/apiClient';

interface BacktestState {
  results: BacktestResult | null;
  isLoading: boolean;
  error: string | null;
  runBacktest: (request: AnalyzeRequest) => Promise<void>;
}

export const useBacktestStore = create<BacktestState>((set) => ({
  results: null,
  isLoading: false,
  error: null,

  runBacktest: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const result = await runBacktest(request);
      set({ results: result.data, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },
}));
```

### 11.3 环境变量配置

```bash
# .env (Electron 端)
NEMT_API_URL=http://localhost:9000     # 本地开发
# NEMT_API_URL=https://your-server:9000  # 远程部署
```

```typescript
// src/services/apiClient.ts
const API_BASE = import.meta.env.VITE_NEMT_API_URL || 'http://localhost:9000';
```

---

## 12. 测试策略

### 12.1 Python 后端测试

#### 单元测试

```python
# nemt_api/tests/test_signals.py
import sys
sys.path.insert(0, "/root/NEMT-Simulator2")
from nemt_signals import NEMTSignalIndicators

def test_dci_computation():
    """测试 DCI 计算"""
    indicators = NEMTSignalIndicators()
    closes = [100 + i * 0.5 for i in range(100)]  # 上涨趋势
    result = indicators.compute_dci(closes)
    assert result.direction == 1, "上涨趋势应该返回正向 DCI"
    assert result.strength > 0, "DCI 强度应 > 0"

def test_vortex_detection():
    """测试涡旋检测"""
    indicators = NEMTSignalIndicators()
    # 构造涡旋形态数据
    closes = [...]  # 满足涡旋条件的价格序列
    result = indicators.detect_vortex(closes, highs, lows, volumes)
    assert result.satisfied_count >= 3, "涡旋形态应满足 ≥3 条件"
```

#### API 集成测试

```python
# nemt_api/tests/test_api.py
from fastapi.testclient import TestClient
from nemt_api.main import app

client = TestClient(app)

def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"

def test_analyze():
    resp = client.post("/api/v1/analyze", json={
        "klines": [...],
        "onchain_data": {"mvrv_zscore": 2.1}
    })
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    assert "phase" in resp.json()["data"]
```

### 12.2 TypeScript 前端测试

```typescript
// src/__tests__/apiClient.test.ts
import { describe, it, expect, vi } from 'vitest';
import { analyze } from '../services/apiClient';

describe('apiClient', () => {
  it('should call analyze endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: {} })
    });

    const result = await analyze({
      symbol: 'BTCUSDT',
      timeframe: '1h',
      klines: mockKlines
    });

    expect(result.success).toBe(true);
  });
});
```

### 12.3 测试矩阵

| 测试类型 | 覆盖范围 | 工具 |
|------|------|------|
| Python 单元测试 | 所有计算模块 | pytest |
| API 集成测试 | 所有 REST 端点 | TestClient + pytest |
| WebSocket 测试 | 连接、订阅、推送 | pytest-asyncio |
| TypeScript 单元测试 | API Client + Store | vitest |
| E2E 测试 | 完整链路（UI → IPC → API → 引擎） | Playwright |

---

## 13. 部署与运维

### 13.1 本地开发模式

```
# 终端 1: 启动 Python API
cd /root/nemt-runtime
python -m uvicorn nemt_api.main:app --host 0.0.0.0 --port 9000 --reload

# 终端 2: 启动 Electron 前端
npm run dev
```

### 13.2 生产部署 — systemd 服务

```ini
# /etc/systemd/system/nemt-api.service
[Unit]
Description=NEMT API Middle Platform
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/nemt-runtime
Environment="PYTHONPATH=/root/NEMT-Simulator2"
ExecStart=/usr/bin/python -m uvicorn nemt_api.main:app --host 0.0.0.0 --port 9000
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# 部署命令
systemctl daemon-reload
systemctl enable nemt-api
systemctl start nemt-api
systemctl status nemt-api

# 查看日志
journalctl -u nemt-api -f
```

### 13.3 健康检查

```
GET /health
→ {"status": "ok", "modules_loaded": true, "uptime": 3600}
```

### 13.4 监控指标

| 指标 | 获取方式 |
|------|---------|
| 请求量/延迟 | FastAPI 内置 metrics |
| 计算耗时 | 各端点 processing_time_ms 字段 |
| 错误率 | systemd journal |
| 进程状态 | systemctl status |

---

## 14. 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| **模块导入失败** | 中 | 高 | `ModelService.initialize()` 中逐个 try/except，降级运行 |
| **Python/TS 数据类型不匹配** | 中 | 中 | 先定义 JSON Schema，两端按契约开发 |
| **计算耗时过大** | 低 | 中 | 缓存中间结果，设置超时（30秒），返回部分结果 |
| **Electron 打包体积膨胀** | 中 | 中 | Python 运行时不进 Electron 包，独立部署或通过 Docker |
| **远程部署网络延迟** | 低 | 中 | WebSocket 保持长连接，批量请求减少往返 |
| **Python 进程崩溃** | 低 | 高 | systemd 自动重启；Electron 端检测连接断开并提示用户 |
| **数据源不可用** | 中 | 中 | 本地缓存降级，返回缓存数据并标记 `stale: true` |
| **安全: API 未授权访问** | 中 | 高 | 生产环境加 API Key 验证；仅监听 localhost 或内网 |

---

## 15. 附录

### 15.1 关键路径总览

```
Phase 1 (1 周):
  /root/nemt-runtime/nemt_api/ 搭建
  → main.py + model_service.py + 3 个路由
  → TypeScript apiClient.ts + IPC 代理
  → 验证: UI 显示真实信号数据

Phase 2 (2 周):
  → 8 个新路由 + 7 个新 Service
  → BacktestService 重写
  → Store 改造 (backtest/signal/risk/performance)
  → UI 组件对接

Phase 3 (3 周):
  → WebSocket 实时推送
  → RealtimeService + ws.py
  → systemd 部署
  → 监控 + 日志
```

### 15.2 NEMT-Simulator2 模块路径映射

| 原模块 | 在新项目中的角色 |
|------|------|
| `/root/NEMT-Simulator2/nemt_signals.py` | `nemt_api/services/model_service.py` 中导入 |
| `/root/NEMT-Simulator2/nemt_risk.py` | `nemt_api/services/risk_service.py` 中导入 |
| `/root/NEMT-Simulator2/nemt_execution.py` | `nemt_api/services/execution_service.py` 中导入 |
| `/root/NEMT-Simulator2/nemt_state_machine.py` | `nemt_api/services/model_service.py` 中导入 |
| `/root/NEMT-Simulator2/enhanced_phase_detector.py` | `nemt_api/services/model_service.py` 中导入 |
| `/root/NEMT-Simulator2/brain_layer.py` | `nemt_api/services/brain_service.py` 中导入 |
| `/root/NEMT-Simulator2/nemt_probability_execution.py` | `nemt_api/services/probability_service.py` 中导入 |
| `/root/NEMT-Simulator2/nemt_onchain.py` | `nemt_api/services/onchain_service.py` 中导入 |
| `/root/NEMT-Simulator2/nemt_controller.py` | `nemt_api/services/model_service.py` 中导入（可选） |
| `/root/NEMT-Simulator2/binance_fetcher.py` | `nemt_api/services/data_service.py` 中导入 |
| `/root/NEMT-Simulator2/nemt_model_node.py` | `nemt_api/services/model_service.py` 中导入（核心） |

### 15.3 开发环境快速搭建

```bash
# 1. SSH 到远程服务器
ssh nemt-cloud

# 2. 确认 Python 版本
python3 --version  # 需要 ≥ 3.10

# 3. 安装依赖
cd /root/nemt-runtime
mkdir -p nemt_api/routers nemt_api/schemas nemt_api/services nemt_api/adapters
pip install fastapi uvicorn[standard] pydantic numpy pandas httpx

# 4. 验证模块可导入
python3 -c "
import sys
sys.path.insert(0, '/root/NEMT-Simulator2')
from nemt_signals import NEMTSignalIndicators
print('Module import OK')
"

# 5. 启动 API
python3 -m uvicorn nemt_api.main:app --host 0.0.0.0 --port 9000 --reload

# 6. 验证
curl http://localhost:9000/health
```

### 15.4 参考文档

| 文档 | 路径 |
|------|------|
| 运行时架构 | `/root/nemt-runtime/RUNTIME_ARCHITECTURE.md` |
| 运行时原则 | `/root/nemt-runtime/RUNTIME_PRINCIPLES.md` |
| 扩张计划索引 | `/root/nemt-runtime/plans/README.md` |
| NEMT 量化 OS 设计 | `/root/NEMT-Simulator2/NEMT_Quant_OS_Design.md` |
| NEMT Electron 架构 | `/root/NEMT-Simulator2/NEMT_Electron_Architecture.md` |
| 远程开发指南 | `/root/nemt-runtime/plans/REMOTE_DEV_GUIDE.md` |

---

> **下一步**: 开始阶段一实施 — 在 `/root/nemt-runtime/nemt_api/` 搭建 FastAPI 项目骨架。
