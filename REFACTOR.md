# 代码重构熵减指南

> 重构的目标不是让代码看起来更好，而是让代码更容易被理解和修改。

---

## 核心原则

### 1. 小步快跑

每次重构只做一件事，完成后立即验证。

```
BAD:  同时提取共享组件 + 迁移颜色 + 重命名变量

GOOD: 
  1. 提取共享组件 → 验证 → 提交
  2. 迁移颜色 → 验证 → 提交
  3. 重命名变量 → 验证 → 提交
```

### 2. 原子提交

每个 commit 只包含一个重构意图。

```bash
git commit -m "refactor: extract EmptyState component"
git commit -m "refactor: extract TabGroup component"
git commit -m "refactor: migrate to Colors preset"
```

### 3. 可回滚

重构前确保可以轻松回滚。

```bash
# 重构前打标签
git tag refactor/start

# 重构后如果有问题
git reset --hard refactor/start
```

### 4. 渐进式改进

不要试图一次性解决所有问题。先处理高优先级的，再逐步完善。

---

## 重构触发条件

当满足以下任一条件时，考虑重构：

| 指标 | Warning | Action |
|------|---------|--------|
| 文件行数 | >200 | 评估是否需要拆分 |
| 文件行数 | >300 | 必须拆分 |
| 函数行数 | >50 | 评估提取 |
| 函数行数 | >80 | 必须提取 |
| 嵌套深度 | >3 | 评估简化 |
| 嵌套深度 | >4 | 必须重构 |
| 重复模式 | 3+次 | 提取共享组件 |

---

## 提取模式库

### 1. 提取子组件

**触发条件:**
- 组件内有明显的视觉区块（>20行）
- 区块有独立的 props 接口
- 区块在其他地方可能复用

**操作步骤:**
1. 创建 `ChildComponent.tsx`
2. 将相关代码和 props 移动过去
3. 在原组件中导入使用
4. 验证 TypeScript 编译
5. 验证功能正常

**示例:**

```tsx
// BEFORE: BacktestEngine.tsx (500+ 行)

// AFTER: 
// BacktestEngine.tsx (150 行)
export function BacktestEngine() {
  return (
    <div>
      <BacktestChart data={chartData} />
      <BacktestConfigForm config={config} onChange={setConfig} />
    </div>
  );
}

// charts/BacktestChart.tsx (150 行)
export function BacktestChart({ data }: BacktestChartProps) { ... }

// forms/BacktestConfigForm.tsx (150 行)
export function BacktestConfigForm({ config, onChange }: BacktestConfigFormProps) { ... }
```

### 2. 提取工具函数

**触发条件:**
- 代码被重复使用 2+ 次
- 没有外部状态依赖
- 是纯转换逻辑

**操作步骤:**
1. 创建 `utils/xxxUtils.ts`
2. 将函数复制过去
3. 添加类型定义
4. 更新所有引用
5. 删除原位置代码

**示例:**

```tsx
// BEFORE: 多个组件内重复的 mock 数据生成

// AFTER: utils/mockDataUtils.ts
export function generateMockCandles(symbol: string, count: number): Candle[] { ... }
export function generateMockTrades(count: number): Trade[] { ... }
export function calculateMetrics(trades: Trade[]): Metrics { ... }
```

### 3. 提取自定义 Hook

**触发条件:**
- 逻辑使用了 React hooks
- 没有 JSX
- 代表某种能力（state + effects 的组合）

**操作步骤:**
1. 创建 `hooks/useXxx.ts`
2. 移动相关 hooks 和 state
3. 返回必要的值和函数
4. 在组件中替换为 hook 调用

**示例:**

```tsx
// BEFORE: 组件内复杂的 data fetching 逻辑

// AFTER: hooks/usePortfolioData.ts
export function usePortfolioData(portfolioId: string) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // fetch logic
  }, [portfolioId]);
  
  return { data, loading, error, refetch };
}
```

### 4. 提取类型定义

**触发条件:**
- 类型在 2+ 个文件中使用
- 代表领域概念

**操作步骤:**
1. 创建 `types/domain.ts`
2. 移动类型定义
3. 添加必要的 import

**示例:**

```tsx
// BEFORE: 类型分散在各个组件

// AFTER: types/strategy.ts
export interface Strategy {
  id: string;
  name: string;
  status: StrategyStatus;
  config: StrategyConfig;
}

export type StrategyStatus = 'draft' | 'ready' | 'running' | 'paused' | 'error';

export interface StrategyConfig {
  symbol: string;
  interval: string;
  parameters: Record<string, number>;
}
```

### 5. 提取常量/配置

**触发条件:**
- 魔法值出现 3+ 次
- 有语义含义

**操作步骤:**
1. 创建 `constants/xxx.ts` 或使用现有 presets
2. 移动常量
3. 使用命名代替字面量

**示例:**

```tsx
// BEFORE
<div style={{ backgroundColor: '#141414', color: '#737373' }}>

// AFTER
import { Colors } from '../../presets';
<div style={{ backgroundColor: Colors.bgSecondary, color: Colors.textMuted }}>
```

---

## 颜色迁移指南

### 硬编码颜色 → 预设变量

| 硬编码 | 预设变量 |
|--------|----------|
| `#141414` | `Colors.bgSecondary` |
| `#1a1a1a` | `Colors.bgTertiary` |
| `#0d0d0d` | `Colors.bg` |
| `#2a2a2a` | `Colors.border` |
| `#737373` | `Colors.textMuted` |
| `#a3a3a3` | `Colors.textSecondary` |
| `#ffffff` | `Colors.text` |
| `#6b21a8` | `ButtonVariants.primary.bg` |
| `#c084fc` | `Colors.accent` |
| `#22c55e` | `Colors.success` |
| `#ef4444` | `Colors.error` |
| `#fbbf24` | `Colors.warning` |
| `#3b82f6` | `Colors.info` |

### 迁移步骤

1. 在组件顶部添加导入
   ```tsx
   import { Colors, ButtonVariants } from '@/presets';
   ```

2. 批量替换硬编码值
   ```tsx
   // 使用 IDE 的 Find & Replace
   Find: '#141414'
   Replace: Colors.bgSecondary
   ```

3. 验证预设中没有的颜色

---

## 重构安全检查清单

每次重构前检查：

```
□ 是否在独立分支进行？
□ 是否有对应的测试覆盖？
□ 是否了解所有调用点？
□ 是否有回滚方案？
□ 是否只修改了一个文件/模块？
```

每次重构后检查：

```
□ TypeScript 编译通过？
□ 功能测试通过？
□ 没有引入新的 lint 警告？
□ 提交信息描述清晰？
```

---

## 运行重构检查

```bash
# 生成重构报告
npm run refactor:report

# 运行 ESLint 检查
npx eslint --config eslint.config.refactor.js src/

# 只检查特定文件
npx eslint --config eslint.config.refactor.js src/components/strategies/BacktestEngine.tsx
```

---

## 优先级排序

### 第一批（高优先级）
1. 提取共享 UI 组件（EmptyState, TabGroup, BaseModal）
2. 拆分 1000+ 行组件
3. 迁移硬编码颜色

### 第二批（中优先级）
4. 提取工具函数和 hooks
5. 简化深层嵌套
6. 提取重复代码

### 第三批（低优先级）
7. 优化圈复杂度
8. 简化大型 switch
9. 提取复杂条件为函数

---

## 相关文件

- [refactor-rules.json](src/rules/refactor-rules.json) - 规则配置
- [eslint.config.refactor.js](eslint.config.refactor.js) - ESLint 配置
- [scripts/refactor-report.ts](scripts/refactor-report.ts) - 报告脚本
- [presets](src/presets/) - 颜色预设
