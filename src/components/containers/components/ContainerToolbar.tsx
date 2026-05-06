/**
 * ContainerToolbar Component
 * 
 * 容器工具栏
 */

import { Plus, RefreshCw, Filter } from 'lucide-react';
import { Colors, ButtonVariants } from '../../../presets/presets';

type FilterStatus = 'all' | 'running' | 'stopped' | 'error';

interface ContainerToolbarProps {
  filter: FilterStatus;
  isRefreshing: boolean;
  onCreateNew: () => void;
  onRefresh: () => void;
  onFilterChange: (_f: FilterStatus) => void;
}

export function ContainerToolbar({
  filter,
  isRefreshing,
  onCreateNew,
  onRefresh,
  onFilterChange,
}: ContainerToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ backgroundColor: ButtonVariants.primary.bg, color: ButtonVariants.primary.color }}
        >
          <Plus size={16} />
          创建容器
        </button>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ backgroundColor: Colors.bgTertiary, color: Colors.text }}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Filter size={16} style={{ color: Colors.textMuted }} />
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as FilterStatus)}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{ backgroundColor: Colors.bgTertiary, color: Colors.text, border: `1px solid ${Colors.border}` }}
        >
          <option value="all">全部</option>
          <option value="running">运行中</option>
          <option value="stopped">已停止</option>
          <option value="error">错误</option>
        </select>
      </div>
    </div>
  );
}
