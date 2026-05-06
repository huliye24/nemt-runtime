# NEMT Platform

量化交易策略容器平台。基于非平衡市场理论（Non-Equilibrium Market Theory），为策略研发、回测、执行与组合管理提供统一的 Electron 桌面运行时。

## 核心概念

NEMT Platform 不是一个策略，也不是一组交易信号。它是一个**运行时容器**——让数据、资金、模型、Agent 和执行能力流入、交互并保持可观测。

> 距离来自轨道，而非引擎。

容器保持尽可能空。它的价值在于稳定、可扩展、变更时可读。

## 功能地图

| 模块 | 说明 |
|------|------|
| **策略市场** | 策略浏览、发布、购买；策略定义管理与版本控制 |
| **回测引擎** | 多场景回测、指标计算、权益曲线、交易清单 |
| **策略执行** | 实时执行、仓位同步、订单路由、执行适配器 |
| **投资组合** | 资金分配、多策略组合、绩效跟踪 |
| **容器管理** | 运行时容器创建、规格定义、边界策略、事件观测 |
| **数据市场** | 数据源接入、数据流管理、历史数据服务 |
| **风控系统** | 风控策略、预警规则、实时监控 |
| ** Electron 桌面** | 原生窗口、系统托盘、热重载、IPC 通道 |

## 技术架构

```
src/
├── components/          # React UI 组件
│   ├── strategies/      # 策略市场、回测引擎、执行面板
│   ├── portfolio/       # 投资组合管理
│   ├── containers/      # 容器管理
│   ├── data-market/     # 数据市场
│   ├── monitor/         # 监控面板
│   ├── platform/        # 平台外壳（侧边栏、头部、设置）
│   └── ui/              # 通用 UI 组件库
├── stores/              # Zustand 状态管理（40+ 模块）
├── types/               # TypeScript 类型定义
├── services/            # 业务服务层
├── desktop/             # Electron 主进程
│   ├── main/            # 窗口管理、IPC、热重载
│   ├── preload/         # 预加载桥接 API
│   ├── services/        # 26 个系统服务
│   └── ipc/             # IPC 处理器
├── presets/             # 预设（指标、模板、交易时段、行业分类）
├── runtime/             # 运行时注册表
├── adapters/            # 执行适配器
├── orchestrators/       # 编排层
└── contracts/           # 内部契约定义
```

### 分层模型

```
Ingress (接入) → Definition (定义) → Runtime (运行时) → Execution (执行) → Observation (观测)
```

## 技术栈

| 类别 | 选型 |
|------|------|
| 前端框架 | React 18 + TypeScript 5 |
| 构建工具 | Vite 5 |
| 桌面运行时 | Electron 28 |
| 状态管理 | Zustand |
| 样式方案 | TailwindCSS 3 |
| 图表库 | Lightweight Charts |
| 图标库 | Lucide React |
| 打包工具 | electron-builder |

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 克隆仓库
git clone git@github.com:huliye24/nemt-runtime.git
cd nemt-runtime

# 安装依赖
npm install --legacy-peer-deps

# 启动 Web 开发模式
npm run dev:web

# 启动 Electron 桌面应用
npm run dev:desktop

# 同时启动 Web + Electron
npm run dev
```

### 构建与打包

```bash
# 类型检查
npm run typecheck

# 构建 Web + Desktop
npm run build

# 打包 Windows 安装包
npm run package:win
```

### 项目脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | Web + Electron 并行开发 |
| `npm run dev:web` | 仅启动 Vite 前端 |
| `npm run dev:desktop` | 仅启动 Electron |
| `npm run build` | 完整构建 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run package` | 打包桌面安装包 |
| `npm run package:win` | Windows 安装包 |

## 设计原则

1. **容器优先** — 平台是壳，策略和数据是内容。壳保持薄，内容可替换
2. **边界清晰** — 每个领域有独立类型、独立 store、独立组件
3. **低耦合扩展** — 新能力通过适配器接入，不修改核心
4. **可观测性** — 所有运行时状态可观测、可记录、可回溯

## 项目状态

v1.0.0 — 核心框架完成，策略市场、回测引擎、投资组合、容器管理、Electron 桌面均已就绪。

## License

MIT
