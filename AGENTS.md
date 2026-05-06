# NEMT Runtime 开发规范

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: TailwindCSS (内联样式为主)
- **状态管理**: Zustand
- **图标库**: Lucide React
- **样式规范**: 内联样式 + TailwindCSS 工具类
- **代码检查**: ESLint + TypeScript strict mode

## 项目结构

```
src/
├── components/          # React 组件
│   ├── platform/       # 平台页面组件 (Sidebar, Settings, Header)
│   ├── strategies/     # 策略相关组件
│   ├── portfolio/      # 投资组合组件
│   ├── containers/     # 容器管理组件
│   ├── data-market/    # 数据市场组件
│   └── monitor/        # 监控面板组件
├── stores/             # Zustand 状态管理
├── types/              # TypeScript 类型定义
│   ├── shared.ts       # 共享类型（必须使用）
│   └── index.ts        # 类型导出
├── presets/            # 开发预设 (颜色、模板、Mock)
│   ├── presets.ts      # 颜色和样式预设（必须使用）
│   ├── templates.tsx   # 组件模板
│   └── mocks.ts       # Mock 数据
├── services/           # 服务层
├── hooks/              # 自定义 Hooks
└── desktop/            # Electron 主进程代码
```

## 颜色系统

### 基础色板 (必须使用)

| 用途 | 色值 | 变量 |
|------|------|------|
| 主背景 | #0d0d0d | `bg` |
| 卡片背景 | #141414 | `bg-secondary` |
| 组件背景 | #1a1a1a | `bg-tertiary` |
| 边框 | #2a2a2a | `border` |
| 边框高亮 | #3d3660 | `border-hover` |
| 主文字 | #ffffff | `text` |
| 次要文字 | #a3a3a3 | `text-secondary` |
| 弱化文字 | #737373 | `text-muted` |
| 强调色 | #c084fc | `accent` (紫色) |
| 成功色 | #22c55e | `success` |
| 警告色 | #fbbf24 | `warning` |

### 按钮变体

```typescript
// 主按钮 - 强调操作
{ bg: '#6b21a8', color: '#ffffff' }

// 次要按钮 - 普通操作
{ bg: '#262626', color: '#a3a3a3' }

// 幽灵按钮 - 低优先级
{ bg: 'transparent', color: '#737373' }
```

## 组件规范

### 命名约定

- 组件文件: PascalCase (如 `StrategyMarket.tsx`)
- 组件函数: PascalCase (如 `export function StrategyMarket`)
- 类型/接口: PascalCase (如 `interface StrategyData`)

### 卡片组件模式

```tsx
import { Colors } from '@/presets/presets';

<div
  className="rounded-xl p-5 transition-all"
  style={{
    backgroundColor: Colors.bgSecondary,
    border: `1px solid ${Colors.border}`,
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = Colors.borderHover;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = Colors.border;
  }}
>
  {/* 内容 */}
</div>
```

### 按钮组件模式

```tsx
import { ButtonVariants } from '@/presets/presets';

<button
  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
  style={{
    backgroundColor: ButtonVariants.primary.bg,
    color: ButtonVariants.primary.color,
  }}
>
  <Icon size={16} />
  按钮文字
</button>
```

### 输入框组件模式

```tsx
import { Colors } from '@/presets/presets';

<input
  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
  style={{
    backgroundColor: Colors.bgTertiary,
    border: `1px solid ${Colors.border}`,
    color: Colors.text,
  }}
  onFocus={(e) => e.target.style.borderColor = Colors.borderFocus}
  onBlur={(e) => e.target.style.borderColor = Colors.border}
/>
```

### 模态框模式

```tsx
import { Colors } from '@/presets/presets';

<div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* 背景遮罩 */}
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

  {/* 模态框内容 */}
  <div
    className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
    style={{ backgroundColor: Colors.bgSecondary }}
  >
    {/* 头部 */}
    <div
      className="flex items-center justify-between px-6 py-4 border-b"
      style={{ borderColor: Colors.border }}
    >
      <h2 className="text-lg font-semibold" style={{ color: Colors.text }}>标题</h2>
      <button onClick={onClose}>关闭</button>
    </div>

    {/* 内容 */}
    <div className="p-6">
      {/* ... */}
    </div>

    {/* 底部 */}
    <div
      className="flex justify-end gap-3 px-6 py-4 border-t"
      style={{ borderColor: Colors.border }}
    >
      <button>取消</button>
      <button>确认</button>
    </div>
  </div>
</div>
```

## 状态管理

### Zustand Store 模式

```typescript
import { create } from 'zustand';

interface State {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
}

export const useStore = create<State>()((set) => ({
  items: [],
  addItem: (item) => set(state => ({ items: [...state.items, item] })),
  removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),
}));

// Selectors
export const useItems = () => useStore(state => state.items);
```

## 策略数据结构

```typescript
interface StrategyData {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  status: 'draft' | 'ready' | 'running';
}

interface MarketStrategy {
  id: string;
  name: string;
  author: string;
  description: string;
  price: number;
  rating: number;
  purchases: number;
  code: string;
  tags: string[];
}
```

## 预设模块 (src/presets/)

项目内置了预设模块，可直接导入使用：

```typescript
// 颜色和样式（必须使用）
import { Colors } from '@/presets/presets';
import { ButtonVariants, CardStyles, StatusConfig } from '@/presets/presets';
import { ComponentStyles, Shadows, ZIndex, Transitions } from '@/presets/presets';

// 组件模板
import {
  CardTemplate,
  ButtonTemplate,
  ModalTemplate,
  TabsTemplate,
  EmptyState,
  StatusBadge,
} from '@/presets/templates';

// Mock 数据
import {
  StrategyMocks,
  MarketStrategyMocks,
  createStrategyMock,
  formatDate,
} from '@/presets/mocks';

// 类型定义（必须使用）
import type {
  Strategy,
  StrategyStatus,
  Portfolio,
  Position,
  Container,
  BacktestConfig,
  BacktestResult,
  ApiResponse,
  AppError,
} from '@/types';
```

### 使用示例

```tsx
// 使用颜色预设（必须从 presets 导入，禁止硬编码）
<div style={{ backgroundColor: Colors.bgSecondary }}>

// 使用按钮预设
<button style={{
  backgroundColor: ButtonVariants.primary.bg,
  color: ButtonVariants.primary.color,
}}>

// 使用状态配置
const config = StatusConfig[strategy.status];

// 使用组件样式
<div style={{ ...ComponentStyles.card.default }}>

// 使用 Mock 数据
const strategies = StrategyMocks;
```

## Git 提交规范

```
feat: 新功能
fix: 修复 bug
refactor: 重构
style: 样式调整
docs: 文档更新
chore: 构建/工具变动
```

---

## 强制约束（AI 编程必须遵守）

以下约束通过 ESLint + TypeScript 强制执行，违反将导致编译/检查失败。

### 1. 类型安全

| 规则 | 说明 |
|------|------|
| 禁止 `any` | 使用 `unknown` + 类型守卫，或定义具体类型 |
| 禁止隐式 any | 所有函数参数和返回值必须有类型 |
| 严格空值检查 | 必须处理 `null` / `undefined` |
| 必须类型化 | 组件 props、API 响应、函数参数必须定义类型 |

```typescript
// 错误 - 使用 any
const handleChange = (value: any) => { ... }

// 正确 - 类型化
const handleChange = (value: string) => { ... }

// 正确 - 使用 unknown + 类型守卫
const parseResponse = (data: unknown): Strategy => {
  if (!isStrategy(data)) throw new Error('Invalid data');
  return data;
};
```

### 2. 组件规范

| 规则 | 说明 |
|------|------|
| 最大行数 | 单个组件文件不超过 **200 行** |
| Props 类型化 | 必须定义并导出 `Props` 接口 |
| 无魔法数字 | 使用常量或枚举替代硬编码数字 |
| Hooks 规则 | 禁止在条件语句中调用 hooks |

```typescript
// 错误
export function Component() { ... }
const handleClick = (e: any) => { ... }

// 正确
export interface ComponentProps {
  onSubmit: (data: FormData) => void;
  disabled?: boolean;
}

export function Component({ onSubmit, disabled = false }: ComponentProps) { ... }
```

### 3. 状态管理规范

| 规则 | 说明 |
|------|------|
| 组件状态 | 使用 `useState`，必须是具体类型 |
| 共享状态 | 使用 Zustand store，从 `stores/index.ts` 导入 |
| Selector | 使用 `useStore(state => state.xxx)` 模式 |
| 禁止直接修改 | 组件不能直接修改 store 状态 |

```typescript
// 从统一的入口导入
import { useStrategyStore, useStrategies } from '@/stores';

// Selector 模式
const strategies = useStrategies();
const updateStrategy = useStrategyStore(state => state.updateStrategy);
```

### 4. 样式规范

| 规则 | 说明 |
|------|------|
| 必须使用预设 | 所有颜色从 `@/presets/presets` 导入 `Colors` |
| 禁止硬编码色值 | 禁止在代码中写死色值如 `#141414` |
| 统一样式预设 | 使用 `ButtonVariants`, `CardStyles` 等 |

```typescript
// 错误 - 硬编码颜色
style={{ backgroundColor: '#141414', color: '#ffffff' }}

// 正确 - 使用预设
import { Colors, ButtonVariants } from '@/presets';
style={{ backgroundColor: Colors.bgSecondary }}
```

### 5. Import 顺序

| 顺序 | 导入类型 | 示例 |
|------|----------|------|
| 1 | React | `import React from 'react'` |
| 2 | 外部库 | `import { create } from 'zustand'` |
| 3 | 类型 | `import type { Strategy } from '@/types'` |
| 4 | 内部模块 | `import { useStrategyStore } from '@/stores'` |
| 5 | 预设 | `import { Colors } from '@/presets'` |
| 6 | 相对路径 | `import { localHelper } from './utils'` |

### 6. 错误处理

| 规则 | 说明 |
|------|------|
| 禁止裸 Promise | 必须处理 Promise 错误或使用 `await` |
| 禁止无类型 throw | `throw` 必须抛出 `Error` 类型 |
| 使用 AppError | 业务错误使用 `AppError` / `ValidationError` 等 |

```typescript
// 错误
fetchData().then(data => ...)

// 正确
try {
  const data = await fetchData();
} catch (error) {
  if (error instanceof AppError) {
    handleAppError(error);
  }
}
```

### 7. 文件规范

| 规则 | 说明 |
|------|------|
| 文件命名 | PascalCase: `StrategyList.tsx` |
| 类型命名 | PascalCase: `interface StrategyData` |
| 常量命名 | SCREAMING_SNAKE_CASE: `MAX_RETRY_COUNT` |
| 函数命名 | camelCase: `handleSubmit` |

---

## 注意事项

1. **避免 CSS 类冲突**: 优先使用内联样式
2. **颜色硬编码**: 直接使用色值，不使用 CSS 变量（除了主题切换）
3. **TypeScript**: 所有组件和函数必须有类型定义
4. **状态提升**: 共享状态使用 Zustand，组件状态使用 useState
5. **图标导入**: 从 lucide-react 按需导入
