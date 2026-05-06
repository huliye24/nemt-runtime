# NEMT Platform MCP Server

量化交易策略管理平台的 MCP 协议实现。

## 架构分层

```
┌─────────────────────────────────────┐
│         用户 / AI 对话层             │
├─────────────────────────────────────┤
│      MCP 协议层（工具/规则）           │
│   - 工具定义 (JSON Schema)           │
│   - 权限控制                        │
│   - 业务规则                        │
├─────────────────────────────────────┤
│        业务逻辑层 (TypeScript)        │
│   - DataStore 数据存储              │
│   - PermissionManager 权限管理      │
├─────────────────────────────────────┤
│        数据存储层                     │
│   - 当前：内存存储                   │
│   - 可扩展：数据库、文件系统          │
└─────────────────────────────────────┘
```

## 权限级别

| 级别 | 说明 |
|------|------|
| `read` | 只读，可查询策略、查看结果 |
| `write` | 可创建和编辑策略 |
| `delete` | 可删除策略 |
| `execute` | 可执行回测、启动/停止策略 |
| `purchase` | 可购买市场策略 |
| `admin` | 完全权限，可执行实盘交易 |

## 工具列表

### 策略管理
- `nemt-create-strategy` - 创建策略
- `nemt-list-strategies` - 列出策略
- `nemt-get-strategy` - 获取策略详情
- `nemt-delete-strategy` - 删除策略

### 回测
- `nemt-run-backtest` - 执行回测
- `nemt-get-backtest-result` - 获取回测结果

### 执行
- `nemt-start-execution` - 启动执行
- `nemt-stop-execution` - 停止执行

### 市场
- `nemt-list-market-strategies` - 浏览市场
- `nemt-purchase-strategy` - 购买策略

## 使用方法

```bash
# 安装依赖
cd mcps/user-nemt-platform
npm install

# 构建
npm run build

# 运行
npm start
```

## MCP 工具调用示例

AI 可以通过自然语言调用：

```
"帮我创建一个叫海龟策略的交易策略，代码是..."

"列出我所有的策略"

"对这个策略运行回测，BTCUSDT，2024-01-01到2024-06-01"

"启动模拟盘执行"
```

## 扩展方向

1. **数据层**：接入真实数据库（PostgreSQL、MongoDB）
2. **权限层**：增加用户认证、API Key
3. **执行层**：对接交易所 API
4. **市场层**：实现真实支付、订阅系统
